-- Safe migration script that checks for existing tables
-- This will not conflict with existing data

-- First, let's check what tables already exist
DO $$
BEGIN
    -- Only create profiles table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('brand', 'influencer')),
            avatar_url TEXT,
            bio TEXT,
            website TEXT,
            social_links JSONB DEFAULT '{}',
            verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Public profiles are viewable by everyone" ON profiles
            FOR SELECT USING (true);
        CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);
        CREATE POLICY "Users can insert own profile" ON profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
            
        RAISE NOTICE 'Created profiles table';
    ELSE
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'social_links') THEN
            ALTER TABLE profiles ADD COLUMN social_links JSONB DEFAULT '{}';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'verified') THEN
            ALTER TABLE profiles ADD COLUMN verified BOOLEAN DEFAULT FALSE;
        END IF;
        RAISE NOTICE 'Profiles table already exists, added missing columns if needed';
    END IF;

    -- Only create campaigns table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campaigns') THEN
        CREATE TABLE campaigns (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            brand_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            budget DECIMAL(10,2),
            requirements TEXT,
            deliverables TEXT[],
            start_date DATE,
            end_date DATE,
            status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
            tags TEXT[],
            target_audience JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Active campaigns are viewable by everyone" ON campaigns
            FOR SELECT USING (status = 'active' OR brand_id = auth.uid());
        CREATE POLICY "Brands can insert their own campaigns" ON campaigns
            FOR INSERT WITH CHECK (brand_id = auth.uid());
        CREATE POLICY "Brands can update their own campaigns" ON campaigns
            FOR UPDATE USING (brand_id = auth.uid());
            
        RAISE NOTICE 'Created campaigns table';
    ELSE
        RAISE NOTICE 'Campaigns table already exists';
    END IF;

    -- Only create campaign_applications table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campaign_applications') THEN
        CREATE TABLE campaign_applications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
            influencer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
            proposal TEXT,
            proposed_rate DECIMAL(10,2),
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            reviewed_at TIMESTAMP WITH TIME ZONE,
            UNIQUE(campaign_id, influencer_id)
        );
        
        ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Applications visible to relevant parties" ON campaign_applications
            FOR SELECT USING (
                influencer_id = auth.uid() OR 
                EXISTS (
                    SELECT 1 FROM campaigns 
                    WHERE campaigns.id = campaign_applications.campaign_id 
                    AND campaigns.brand_id = auth.uid()
                )
            );
        CREATE POLICY "Influencers can apply to campaigns" ON campaign_applications
            FOR INSERT WITH CHECK (influencer_id = auth.uid());
        CREATE POLICY "Brands can update application status" ON campaign_applications
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM campaigns 
                    WHERE campaigns.id = campaign_applications.campaign_id 
                    AND campaigns.brand_id = auth.uid()
                )
            );
            
        RAISE NOTICE 'Created campaign_applications table';
    ELSE
        RAISE NOTICE 'Campaign_applications table already exists';
    END IF;

    -- Only create notifications table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        CREATE TABLE notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL,
            read BOOLEAN DEFAULT FALSE,
            data JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own notifications" ON notifications
            FOR SELECT USING (user_id = auth.uid());
        CREATE POLICY "Users can update own notifications" ON notifications
            FOR UPDATE USING (user_id = auth.uid());
            
        RAISE NOTICE 'Created notifications table';
    ELSE
        RAISE NOTICE 'Notifications table already exists';
    END IF;

    -- Only create wallet_transactions table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wallet_transactions') THEN
        CREATE TABLE wallet_transactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
            description TEXT NOT NULL,
            reference_id UUID,
            reference_type TEXT,
            status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own transactions" ON wallet_transactions
            FOR SELECT USING (user_id = auth.uid());
            
        RAISE NOTICE 'Created wallet_transactions table';
    ELSE
        RAISE NOTICE 'Wallet_transactions table already exists';
    END IF;

END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_campaign_id ON campaign_applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_influencer_id ON campaign_applications(influencer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);

-- Create or replace the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_campaigns_updated_at') THEN
        CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
