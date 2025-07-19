-- COMPLETE DATABASE SETUP FOR WONLINK PLATFORM
-- Copy and paste this entire script into Supabase SQL Editor

-- First, drop all existing tables if they exist (clean slate)
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.campaign_applications CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('brand', 'influencer')),
    bio TEXT,
    website TEXT,
    avatar_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    social_links JSONB DEFAULT '{}',
    company_info JSONB DEFAULT '{}',
    follower_count JSONB DEFAULT '{}',
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    budget DECIMAL(10,2),
    requirements TEXT,
    deliverables TEXT[] DEFAULT '{}',
    start_date DATE,
    end_date DATE,
    application_deadline DATE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    tags TEXT[] DEFAULT '{}',
    target_audience JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign applications table
CREATE TABLE public.campaign_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    influencer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    proposal TEXT,
    proposed_rate DECIMAL(10,2),
    portfolio_links TEXT[] DEFAULT '{}',
    availability JSONB DEFAULT '{}',
    message TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(campaign_id, influencer_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallet transactions table
CREATE TABLE public.wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    description TEXT NOT NULL,
    reference_id UUID,
    reference_type TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for campaigns
CREATE POLICY "Active campaigns are viewable by everyone" ON public.campaigns
    FOR SELECT USING (status = 'active' OR brand_id = auth.uid());

CREATE POLICY "Brands can insert their own campaigns" ON public.campaigns
    FOR INSERT WITH CHECK (brand_id = auth.uid());

CREATE POLICY "Brands can update their own campaigns" ON public.campaigns
    FOR UPDATE USING (brand_id = auth.uid());

CREATE POLICY "Brands can delete their own draft campaigns" ON public.campaigns
    FOR DELETE USING (brand_id = auth.uid() AND status = 'draft');

-- Create RLS policies for campaign applications
CREATE POLICY "Applications visible to relevant parties" ON public.campaign_applications
    FOR SELECT USING (
        influencer_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = campaign_applications.campaign_id 
            AND campaigns.brand_id = auth.uid()
        )
    );

CREATE POLICY "Influencers can apply to campaigns" ON public.campaign_applications
    FOR INSERT WITH CHECK (influencer_id = auth.uid());

CREATE POLICY "Brands can update application status" ON public.campaign_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = campaign_applications.campaign_id 
            AND campaigns.brand_id = auth.uid()
        )
    );

-- Create RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for wallet transactions
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert transactions" ON public.wallet_transactions
    FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_verified ON public.profiles(verified);
CREATE INDEX idx_campaigns_brand_id ON public.campaigns(brand_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_tags ON public.campaigns USING GIN(tags);
CREATE INDEX idx_campaign_applications_campaign_id ON public.campaign_applications(campaign_id);
CREATE INDEX idx_campaign_applications_influencer_id ON public.campaign_applications(influencer_id);
CREATE INDEX idx_campaign_applications_status ON public.campaign_applications(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON public.wallet_transactions(type);
CREATE INDEX idx_wallet_transactions_status ON public.wallet_transactions(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'influencer')
    );
    
    -- Send welcome notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        NEW.id,
        'Welcome to Wonlink!',
        'Your account has been created successfully. Complete your profile to get started.',
        'welcome'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data for testing
INSERT INTO public.profiles (id, email, name, role, bio, verified, social_links, follower_count, engagement_rate) VALUES
(
    '00000000-0000-0000-0000-000000000001', 
    'demo@brand.com', 
    'Demo Fashion Brand', 
    'brand', 
    'Leading sustainable fashion brand creating eco-friendly clothing for the modern consumer.',
    true,
    '{"instagram": "@demofashionbrand", "website": "https://demofashion.com"}',
    '{"instagram": 25000, "facebook": 15000}',
    3.8
),
(
    '00000000-0000-0000-0000-000000000002', 
    'demo@influencer.com', 
    'Fashion Influencer Pro', 
    'influencer', 
    'Fashion and lifestyle content creator with 150k+ engaged followers. Specializing in sustainable fashion and lifestyle content.',
    true,
    '{"instagram": "@fashioninfluencerpro", "tiktok": "@fashionpro", "youtube": "FashionInfluencerPro"}',
    '{"instagram": 150000, "tiktok": 85000, "youtube": 25000}',
    5.2
),
(
    '00000000-0000-0000-0000-000000000003', 
    'tech@reviewer.com', 
    'Tech Review Master', 
    'influencer', 
    'Tech enthusiast and product reviewer with expertise in smartphones, gadgets, and emerging technology.',
    true,
    '{"youtube": "TechReviewMaster", "instagram": "@techreviewmaster", "twitter": "@techmaster"}',
    '{"youtube": 200000, "instagram": 95000, "twitter": 45000}',
    4.7
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample campaigns
INSERT INTO public.campaigns (id, brand_id, title, description, budget, status, tags, requirements, deliverables, application_deadline, target_audience) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001', 
    'Summer Fashion Collection Launch', 
    'We are looking for fashion influencers to showcase our new sustainable summer collection. This campaign focuses on eco-friendly materials and ethical fashion practices. Perfect for creators who are passionate about sustainable living and fashion.',
    15000.00, 
    'active', 
    ARRAY['fashion', 'summer', 'sustainable', 'lifestyle', 'eco-friendly'],
    'Must have 50k+ followers on Instagram, previous fashion brand collaborations, engagement rate above 3%, and alignment with sustainable fashion values.',
    ARRAY['2 Instagram feed posts', '4 Instagram stories', '1 Reel showcasing the collection', '1 blog post or YouTube video (optional)'],
    '2024-12-31',
    '{"age_range": "18-35", "gender": "all", "interests": ["fashion", "sustainability", "lifestyle"], "location": ["US", "CA", "UK", "AU"]}'
),
(
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000001', 
    'Tech Product Launch Campaign', 
    'Seeking tech reviewers and influencers for our innovative smartphone accessory launch. Looking for creators who can provide honest, detailed reviews and demonstrate the product features effectively.',
    25000.00, 
    'active', 
    ARRAY['technology', 'smartphone', 'review', 'gadgets', 'innovation'],
    'Must have 100k+ followers across platforms, previous tech review experience, ability to create high-quality video content, and strong engagement with tech-focused audience.',
    ARRAY['1 YouTube review video (10+ minutes)', '3 Instagram posts', '5 Instagram stories', '1 TikTok unboxing video', '1 detailed written review'],
    '2024-12-25',
    '{"age_range": "20-45", "gender": "all", "interests": ["technology", "gadgets", "mobile", "innovation"], "location": ["US", "CA", "UK", "AU", "DE"]}'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample applications
INSERT INTO public.campaign_applications (campaign_id, influencer_id, status, proposal, proposed_rate, portfolio_links) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000002',
    'pending',
    'I am excited to apply for your Summer Fashion Collection campaign! My audience is highly engaged with sustainable fashion content, and I have successfully collaborated with eco-friendly brands in the past. I can create authentic content that showcases your collection while educating my followers about sustainable fashion practices.',
    2500.00,
    ARRAY['https://instagram.com/p/example1', 'https://youtube.com/watch?v=example2']
),
(
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000003',
    'approved',
    'I would love to review your new smartphone accessory! With my background in tech reviews and 200k+ YouTube subscribers, I can provide comprehensive coverage including unboxing, detailed feature analysis, and real-world usage scenarios. My recent tech reviews have averaged 75k+ views with high engagement.',
    4500.00,
    ARRAY['https://youtube.com/watch?v=techreview1', 'https://youtube.com/watch?v=techreview2', 'https://instagram.com/p/techpost1']
)
ON CONFLICT (campaign_id, influencer_id) DO NOTHING;

-- Insert sample notifications
INSERT INTO public.notifications (user_id, title, message, type, data) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'New Campaign Application',
    'Fashion Influencer Pro has applied to your Summer Fashion Collection Launch campaign.',
    'campaign_application',
    '{"campaign_id": "11111111-1111-1111-1111-111111111111", "application_id": "campaign_application_id", "influencer_name": "Fashion Influencer Pro"}'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Welcome to Wonlink!',
    'Your influencer account has been created successfully. Complete your profile to start applying to campaigns.',
    'welcome',
    '{}'
),
(
    '00000000-0000-0000-0000-000000000003',
    'Application Approved!',
    'Congratulations! Your application for the Tech Product Launch Campaign has been approved.',
    'application_approved',
    '{"campaign_id": "22222222-2222-2222-2222-222222222222", "campaign_title": "Tech Product Launch Campaign"}'
)
ON CONFLICT DO NOTHING;

-- Insert sample wallet transactions
INSERT INTO public.wallet_transactions (user_id, amount, type, description, reference_type, status, metadata) VALUES
(
    '00000000-0000-0000-0000-000000000003',
    4500.00,
    'credit',
    'Payment for Tech Product Launch Campaign collaboration',
    'campaign_payment',
    'completed',
    '{"campaign_title": "Tech Product Launch Campaign", "brand_name": "Demo Fashion Brand", "payment_method": "platform_wallet"}'
),
(
    '00000000-0000-0000-0000-000000000003',
    193.50,
    'debit',
    'Platform service fee (4.3%)',
    'service_fee',
    'completed',
    '{"fee_percentage": 4.3, "original_amount": 4500.00, "transaction_type": "service_fee"}'
),
(
    '00000000-0000-0000-0000-000000000002',
    1000.00,
    'credit',
    'Welcome bonus for new influencer',
    'welcome_bonus',
    'completed',
    '{"bonus_type": "welcome", "reason": "New influencer signup bonus"}'
)
ON CONFLICT DO NOTHING;

-- Create view for campaign analytics
CREATE OR REPLACE VIEW campaign_analytics AS
SELECT 
    c.id,
    c.title,
    c.brand_id,
    c.status,
    c.budget,
    COUNT(ca.id) as total_applications,
    COUNT(CASE WHEN ca.status = 'approved' THEN 1 END) as approved_applications,
    COUNT(CASE WHEN ca.status = 'pending' THEN 1 END) as pending_applications,
    COUNT(CASE WHEN ca.status = 'rejected' THEN 1 END) as rejected_applications,
    AVG(ca.proposed_rate) as average_proposed_rate,
    c.created_at,
    c.updated_at
FROM campaigns c
LEFT JOIN campaign_applications ca ON c.id = ca.campaign_id
GROUP BY c.id, c.title, c.brand_id, c.status, c.budget, c.created_at, c.updated_at;

-- Create view for user wallet balance
CREATE OR REPLACE VIEW user_wallet_balance AS
SELECT 
    user_id,
    SUM(CASE WHEN type = 'credit' AND status = 'completed' THEN amount ELSE 0 END) as total_credits,
    SUM(CASE WHEN type = 'debit' AND status = 'completed' THEN amount ELSE 0 END) as total_debits,
    SUM(CASE WHEN type = 'credit' AND status = 'completed' THEN amount ELSE 0 END) - 
    SUM(CASE WHEN type = 'debit' AND status = 'completed' THEN amount ELSE 0 END) as current_balance,
    SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
    MAX(created_at) as last_transaction_date
FROM wallet_transactions
GROUP BY user_id;

-- Success message
SELECT 'Database setup completed successfully! 🎉 Your Wonlink platform is ready to use.' as status,
       'Sample data has been inserted for testing. You can now proceed with OAuth setup.' as next_step;
