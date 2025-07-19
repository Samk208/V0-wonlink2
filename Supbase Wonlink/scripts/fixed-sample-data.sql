-- Fixed Sample Data Script for Wonlink Platform
-- This script properly handles foreign key constraints and creates realistic sample data

-- First, let's temporarily disable foreign key constraints for sample data insertion
SET session_replication_role = replica;

-- Insert sample profiles with proper UUID handling
-- Note: These are demo profiles that don't require actual auth.users entries
INSERT INTO profiles (
  id,
  email,
  name,
  role,
  avatar_url,
  bio,
  website,
  social_links,
  verified,
  created_at,
  updated_at
) VALUES 
-- Sample Brand Profile
(
  '550e8400-e29b-41d4-a716-446655440000',
  'brand@sustainablefashion.com',
  'Sustainable Fashion Co',
  'brand',
  '/placeholder.svg?height=100&width=100&text=SF',
  'Leading sustainable fashion brand creating eco-friendly clothing for the conscious consumer. We believe fashion should be beautiful, ethical, and environmentally responsible.',
  'https://sustainablefashion.com',
  '{
    "instagram": "@sustainablefashionco",
    "twitter": "@sustainablefashion",
    "linkedin": "company/sustainable-fashion-co",
    "website": "https://sustainablefashion.com"
  }'::jsonb,
  true,
  '2024-01-01 00:00:00+00',
  '2024-01-15 10:30:00+00'
),
-- Sample Influencer Profile 1
(
  '660e8400-e29b-41d4-a716-446655440001',
  'sarah@fashionpro.com',
  'Sarah Fashion Pro',
  'influencer',
  '/placeholder.svg?height=100&width=100&text=SP',
  'Fashion and lifestyle content creator with 150k+ followers. Passionate about sustainable fashion, beauty tips, and empowering women through style. Based in Los Angeles.',
  'https://sarahfashionpro.com',
  '{
    "instagram": "@sarahfashionpro",
    "tiktok": "@sarahfashionpro",
    "youtube": "SarahFashionPro",
    "website": "https://sarahfashionpro.com"
  }'::jsonb,
  true,
  '2024-01-02 00:00:00+00',
  '2024-01-16 14:20:00+00'
),
-- Sample Influencer Profile 2
(
  '770e8400-e29b-41d4-a716-446655440002',
  'mike@techreviews.com',
  'Mike Tech Reviews',
  'influencer',
  '/placeholder.svg?height=100&width=100&text=MT',
  'Tech enthusiast and product reviewer with 200k+ subscribers across platforms. Specializing in smartphone reviews, gadget unboxings, and tech tutorials. Honest reviews you can trust.',
  'https://miketechreviews.com',
  '{
    "youtube": "MikeTechReviews",
    "instagram": "@miketechreviews",
    "twitter": "@miketechreviews",
    "tiktok": "@miketechreviews"
  }'::jsonb,
  true,
  '2024-01-03 00:00:00+00',
  '2024-01-17 09:45:00+00'
);

-- Insert sample campaigns
INSERT INTO campaigns (
  id,
  brand_id,
  title,
  description,
  budget,
  requirements,
  deliverables,
  start_date,
  end_date,
  status,
  tags,
  target_audience,
  created_at,
  updated_at
) VALUES 
-- Fashion Campaign
(
  '880e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440000',
  'Summer Sustainable Fashion Collection Launch',
  'We''re launching our new summer collection featuring 100% organic cotton and recycled materials. Looking for fashion influencers who align with our sustainability values and have an engaged audience interested in eco-friendly fashion. This campaign will showcase our commitment to environmental responsibility while highlighting the style and quality of our new pieces.',
  15000.00,
  'Must have 50k+ followers on Instagram, previous fashion brand collaborations, engagement rate above 3%, and genuine interest in sustainable fashion. Content should align with eco-friendly values.',
  ARRAY[
    '2 Instagram feed posts featuring collection pieces',
    '4 Instagram stories showing styling tips',
    '1 Reel showcasing the collection''s versatility',
    '1 blog post about sustainable fashion (if applicable)'
  ],
  '2024-06-01',
  '2024-08-31',
  'active',
  ARRAY['fashion', 'sustainable', 'summer', 'organic', 'eco-friendly'],
  '{
    "age_range": "18-35",
    "gender": "all",
    "interests": ["fashion", "sustainability", "lifestyle", "eco-friendly"],
    "location": ["US", "CA", "UK", "AU"],
    "min_followers": 50000,
    "engagement_rate": 3.0
  }'::jsonb,
  '2024-04-01 00:00:00+00',
  '2024-04-15 10:30:00+00'
),
-- Tech Campaign
(
  '990e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440000',
  'Innovative Smartphone Accessory Review Campaign',
  'Launching our revolutionary wireless charging stand with built-in phone cooling technology. Seeking tech reviewers and gadget enthusiasts to create honest, detailed reviews. This product solves the common problem of phone overheating during wireless charging while maintaining fast charging speeds.',
  25000.00,
  'Must have 100k+ followers across platforms, previous tech review experience, ability to create high-quality video content, and audience interested in mobile technology and accessories.',
  ARRAY[
    '1 YouTube review video (10+ minutes)',
    '3 Instagram posts showing product features',
    '5 Instagram stories with unboxing and setup',
    '1 TikTok video demonstrating key features',
    '1 written review (blog/website if available)'
  ],
  '2024-07-01',
  '2024-09-30',
  'active',
  ARRAY['technology', 'smartphone', 'wireless-charging', 'gadgets', 'review'],
  '{
    "age_range": "20-45",
    "gender": "all",
    "interests": ["technology", "gadgets", "smartphones", "innovation"],
    "location": ["US", "CA", "UK", "AU", "DE"],
    "min_followers": 100000,
    "engagement_rate": 4.0
  }'::jsonb,
  '2024-05-01 00:00:00+00',
  '2024-05-10 16:20:00+00'
);

-- Insert sample campaign applications
INSERT INTO campaign_applications (
  id,
  campaign_id,
  influencer_id,
  status,
  proposal,
  proposed_rate,
  applied_at,
  reviewed_at
) VALUES 
-- Sarah's application to Fashion Campaign
(
  'aa0e8400-e29b-41d4-a716-446655440005',
  '880e8400-e29b-41d4-a716-446655440003',
  '660e8400-e29b-41d4-a716-446655440001',
  'approved',
  'I''m incredibly excited about this collaboration opportunity! Your sustainable fashion values perfectly align with my content and personal beliefs. My audience of 150k+ followers is highly engaged with eco-friendly fashion content, and my recent sustainable fashion posts have averaged 8k+ likes with 5.2% engagement rate. I''ve previously collaborated with brands like Reformation and Everlane, creating authentic content that drives real engagement and conversions. I would love to showcase your summer collection through creative styling videos and honest reviews that highlight both the aesthetic appeal and environmental benefits of your pieces.',
  2500.00,
  '2024-04-10 14:30:00+00',
  '2024-04-12 09:15:00+00'
),
-- Mike's application to Tech Campaign
(
  'bb0e8400-e29b-41d4-a716-446655440006',
  '990e8400-e29b-41d4-a716-446655440004',
  '770e8400-e29b-41d4-a716-446655440002',
  'pending',
  'This wireless charging stand sounds like exactly the kind of innovative product my audience loves to discover! With 200k+ subscribers across YouTube, Instagram, and TikTok, I specialize in in-depth tech reviews that help consumers make informed decisions. My recent smartphone accessory reviews have generated 50k+ views with excellent engagement rates. I would provide a comprehensive review covering design, functionality, charging speeds, cooling effectiveness, and real-world usage scenarios. My honest, detailed approach has built strong trust with my audience, leading to high conversion rates for featured products.',
  3500.00,
  '2024-05-15 11:45:00+00',
  NULL
);

-- Insert sample notifications
INSERT INTO notifications (
  id,
  user_id,
  title,
  message,
  type,
  read,
  data,
  created_at
) VALUES 
-- Welcome notification for brand
(
  'cc0e8400-e29b-41d4-a716-446655440007',
  '550e8400-e29b-41d4-a716-446655440000',
  'Welcome to Wonlink! 🎉',
  'Your brand profile has been created successfully. Start creating campaigns to connect with talented influencers and grow your brand reach.',
  'welcome',
  false,
  '{
    "action": "create_campaign",
    "url": "/brand/campaigns/create"
  }'::jsonb,
  '2024-01-01 00:30:00+00'
),
-- Application notification for brand
(
  'dd0e8400-e29b-41d4-a716-446655440008',
  '550e8400-e29b-41d4-a716-446655440000',
  'New Campaign Application Received',
  'Sarah Fashion Pro has applied to your "Summer Sustainable Fashion Collection Launch" campaign. Review their proposal and portfolio to make a decision.',
  'campaign_application',
  false,
  '{
    "campaign_id": "880e8400-e29b-41d4-a716-446655440003",
    "application_id": "aa0e8400-e29b-41d4-a716-446655440005",
    "influencer_name": "Sarah Fashion Pro"
  }'::jsonb,
  '2024-04-10 14:35:00+00'
),
-- Welcome notification for influencer
(
  'ee0e8400-e29b-41d4-a716-446655440009',
  '660e8400-e29b-41d4-a716-446655440001',
  'Welcome to Wonlink! ✨',
  'Your influencer profile is ready! Browse active campaigns and start applying to collaborate with amazing brands that match your style and values.',
  'welcome',
  true,
  '{
    "action": "browse_campaigns",
    "url": "/influencer/campaigns"
  }'::jsonb,
  '2024-01-02 00:30:00+00'
),
-- Application approved notification
(
  'ff0e8400-e29b-41d4-a716-446655440010',
  '660e8400-e29b-41d4-a716-446655440001',
  'Application Approved! 🎊',
  'Congratulations! Sustainable Fashion Co has approved your application for the "Summer Sustainable Fashion Collection Launch" campaign. Check your email for next steps and collaboration details.',
  'application_approved',
  false,
  '{
    "campaign_id": "880e8400-e29b-41d4-a716-446655440003",
    "application_id": "aa0e8400-e29b-41d4-a716-446655440005",
    "brand_name": "Sustainable Fashion Co"
  }'::jsonb,
  '2024-04-12 09:20:00+00'
);

-- Insert sample wallet transactions
INSERT INTO wallet_transactions (
  id,
  user_id,
  amount,
  type,
  description,
  reference_id,
  reference_type,
  status,
  created_at
) VALUES 
-- Welcome bonus for influencer
(
  '110e8400-e29b-41d4-a716-446655440011',
  '660e8400-e29b-41d4-a716-446655440001',
  1000.00,
  'credit',
  'Welcome bonus for joining Wonlink platform',
  '660e8400-e29b-41d4-a716-446655440001',
  'welcome_bonus',
  'completed',
  '2024-01-02 00:35:00+00'
),
-- Campaign payment for approved application
(
  '220e8400-e29b-41d4-a716-446655440012',
  '660e8400-e29b-41d4-a716-446655440001',
  2500.00,
  'credit',
  'Payment for "Summer Sustainable Fashion Collection Launch" campaign collaboration',
  'aa0e8400-e29b-41d4-a716-446655440005',
  'campaign_payment',
  'completed',
  '2024-04-12 10:00:00+00'
),
-- Platform fee deduction
(
  '330e8400-e29b-41d4-a716-446655440013',
  '660e8400-e29b-41d4-a716-446655440001',
  107.50,
  'debit',
  'Platform service fee (4.3% of $2,500.00)',
  '220e8400-e29b-41d4-a716-446655440012',
  'platform_fee',
  'completed',
  '2024-04-12 10:01:00+00'
),
-- Welcome bonus for second influencer
(
  '440e8400-e29b-41d4-a716-446655440014',
  '770e8400-e29b-41d4-a716-446655440002',
  1000.00,
  'credit',
  'Welcome bonus for joining Wonlink platform',
  '770e8400-e29b-41d4-a716-446655440002',
  'welcome_bonus',
  'completed',
  '2024-01-03 00:35:00+00'
);

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;

-- Verify the data was inserted correctly
DO $$
DECLARE
    profile_count INTEGER;
    campaign_count INTEGER;
    application_count INTEGER;
    notification_count INTEGER;
    transaction_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO campaign_count FROM campaigns;
    SELECT COUNT(*) INTO application_count FROM campaign_applications;
    SELECT COUNT(*) INTO notification_count FROM notifications;
    SELECT COUNT(*) INTO transaction_count FROM wallet_transactions;
    
    RAISE NOTICE '=== SAMPLE DATA INSERTION COMPLETE ===';
    RAISE NOTICE 'Profiles created: %', profile_count;
    RAISE NOTICE 'Campaigns created: %', campaign_count;
    RAISE NOTICE 'Applications created: %', application_count;
    RAISE NOTICE 'Notifications created: %', notification_count;
    RAISE NOTICE 'Transactions created: %', transaction_count;
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Sample data inserted successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Your platform now includes:';
    RAISE NOTICE '• 1 Brand: Sustainable Fashion Co';
    RAISE NOTICE '• 2 Influencers: Sarah Fashion Pro, Mike Tech Reviews';
    RAISE NOTICE '• 2 Active Campaigns: Fashion & Tech campaigns';
    RAISE NOTICE '• Sample applications, notifications, and transactions';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to test your Wonlink platform!';
END $$;
