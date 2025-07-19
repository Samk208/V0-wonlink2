-- FRESH DATABASE SETUP FOR WONLINK PLATFORM
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Create RLS policies for wallet transactions
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions
    FOR SELECT USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_campaigns_brand_id ON public.campaigns(brand_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaign_applications_campaign_id ON public.campaign_applications(campaign_id);
CREATE INDEX idx_campaign_applications_influencer_id ON public.campaign_applications(influencer_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);

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

-- Insert sample data for testing
INSERT INTO public.profiles (id, email, name, role, bio, verified) VALUES
('00000000-0000-0000-0000-000000000001', 'demo@brand.com', 'Demo Brand', 'brand', 'A sample brand for testing the platform', true),
('00000000-0000-0000-0000-000000000002', 'demo@influencer.com', 'Demo Influencer', 'influencer', 'A sample influencer for testing the platform', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample campaigns
INSERT INTO public.campaigns (brand_id, title, description, budget, status, tags) VALUES
('00000000-0000-0000-0000-000000000001', 'Summer Fashion Campaign', 'Looking for fashion influencers to showcase our summer collection', 5000.00, 'active', ARRAY['fashion', 'summer', 'lifestyle']),
('00000000-0000-0000-0000-000000000001', 'Tech Product Launch', 'Need tech reviewers for our new smartphone launch', 10000.00, 'active', ARRAY['tech', 'smartphone', 'review'])
ON CONFLICT DO NOTHING;

-- Insert sample notifications
INSERT INTO public.notifications (user_id, title, message, type) VALUES
('00000000-0000-0000-0000-000000000002', 'Welcome to Wonlink!', 'Your influencer account has been created successfully.', 'system'),
('00000000-0000-0000-0000-000000000001', 'Welcome to Wonlink!', 'Your brand account has been created successfully.', 'system')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully! You can now use your Wonlink platform.' as status;
