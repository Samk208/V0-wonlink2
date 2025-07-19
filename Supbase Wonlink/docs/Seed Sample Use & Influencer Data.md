-- COMPLETE SAMPLE DATA FOR WONLINK PLATFORM
-- This script creates realistic sample data for testing the platform

-- Temporarily disable foreign key constraints for sample data insertion
SET session_replication_role = replica;

-- Clear existing sample data (optional - uncomment if you want to start fresh)
-- DELETE FROM wallet_transactions WHERE user_id IN (
--   '550e8400-e29b-41d4-a716-446655440000',
--   '660e8400-e29b-41d4-a716-446655440001', 
--   '770e8400-e29b-41d4-a716-446655440002'
-- );
-- DELETE FROM notifications WHERE user_id IN (
--   '550e8400-e29b-41d4-a716-446655440000',
--   '660e8400-e29b-41d4-a716-446655440001',
--   '770e8400-e29b-41d4-a716-446655440002'
-- );
-- DELETE FROM campaign_applications WHERE campaign_id IN (
--   '880e8400-e29b-41d4-a716-446655440003',
--   '990e8400-e29b-41d4-a716-446655440004'
-- );
-- DELETE FROM campaigns WHERE brand_id = '550e8400-e29b-41d4-a716-446655440000';
-- DELETE FROM profiles WHERE id IN (
--   '550e8400-e29b-41d4-a716-446655440000',
--   '660e8400-e29b-41d4-a716-446655440001',
--   '770e8400-e29b-41d4-a716-446655440002'
-- );

-- Insert sample profiles
INSERT INTO profiles (
  id,
  email,
  name,
  role,
  avatar_url,
  bio,
  website,
  social_links,
  follower_count,
  engagement_rate,
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
  '/placeholder.svg?height=120&width=120&text=Sustainable+Fashion+Co',
  'Leading sustainable fashion brand creating eco-friendly clothing for the conscious consumer. We believe fashion should be beautiful, ethical, and environmentally responsible. Our mission is to prove that style and sustainability can go hand in hand, creating timeless pieces that make you look good and feel good about your choices.',
  'https://sustainablefashion.com',
  '{
    "instagram": "@sustainablefashionco",
    "twitter": "@sustainablefashion", 
    "linkedin": "company/sustainable-fashion-co",
    "website": "https://sustainablefashion.com",
    "facebook": "SustainableFashionCo"
  }'::jsonb,
  '{
    "instagram": 45000,
    "twitter": 12000,
    "facebook": 25000,
    "linkedin": 8000
  }'::jsonb,
  3.8,
  true,
  '2024-01-01 00:00:00+00',
  '2024-01-15 10:30:00+00'
),
-- Sample Influencer Profile 1 - Fashion Focus
(
  '660e8400-e29b-41d4-a716-446655440001',
  'sarah@fashionpro.com',
  'Sarah Fashion Pro',
  'influencer',
  '/placeholder.svg?height=120&width=120&text=Sarah+Fashion+Pro',
  'Fashion and lifestyle content creator with 150k+ followers across platforms. Passionate about sustainable fashion, beauty tips, and empowering women through style. Based in Los Angeles, I create authentic content that inspires my community to make conscious fashion choices while looking fabulous. I love collaborating with brands that share my values of sustainability and ethical practices.',
  'https://sarahfashionpro.com',
  '{
    "instagram": "@sarahfashionpro",
    "tiktok": "@sarahfashionpro",
    "youtube": "SarahFashionPro",
    "website": "https://sarahfashionpro.com",
    "pinterest": "sarahfashionpro"
  }'::jsonb,
  '{
    "instagram": 150000,
    "tiktok": 85000,
    "youtube": 25000,
    "pinterest": 35000
  }'::jsonb,
  5.2,
  true,
  '2024-01-02 00:00:00+00',
  '2024-01-16 14:20:00+00'
),
-- Sample Influencer Profile 2 - Tech Focus
(
  '770e8400-e29b-41d4-a716-446655440002',
  'mike@techreviews.com',
  'Mike Tech Reviews',
  'influencer',
  '/placeholder.svg?height=120&width=120&text=Mike+Tech+Reviews',
  'Tech enthusiast and product reviewer with 200k+ subscribers across platforms. Specializing in smartphone reviews, gadget unboxings, and tech tutorials. I provide honest, in-depth reviews that help consumers make informed decisions. My content focuses on practical usage, value for money, and real-world performance testing. Based in San Francisco with access to the latest tech trends.',
  'https://miketechreviews.com',
  '{
    "youtube": "MikeTechReviews",
    "instagram": "@miketechreviews",
    "twitter": "@miketechreviews",
    "tiktok": "@miketechreviews",
    "website": "https://miketechreviews.com"
  }'::jsonb,
  '{
    "youtube": 200000,
    "instagram": 95000,
    "twitter": 45000,
    "tiktok": 120000
  }'::jsonb,
  4.7,
  true,
  '2024-01-03 00:00:00+00',
  '2024-01-17 09:45:00+00'
),
-- Sample Influencer Profile 3 - Lifestyle Focus
(
  '880e8400-e29b-41d4-a716-446655440003',
  'emma@lifestyleguide.com',
  'Emma Lifestyle Guide',
  'influencer',
  '/placeholder.svg?height=120&width=120&text=Emma+Lifestyle',
  'Lifestyle content creator sharing wellness tips, home decor inspiration, and daily life moments with 80k+ engaged followers. I focus on creating content that helps people live their best lives through mindful choices, beautiful spaces, and healthy habits. My audience loves authentic recommendations and behind-the-scenes glimpses into real life.',
  'https://emmalifestyleguide.com',
  '{
    "instagram": "@emmalifestyleguide",
    "youtube": "EmmaLifestyleGuide",
    "pinterest": "emmalifestyle",
    "blog": "https://emmalifestyleguide.com"
  }'::jsonb,
  '{
    "instagram": 80000,
    "youtube": 15000,
    "pinterest": 50000
  }'::jsonb,
  6.1,
  true,
  '2024-01-04 00:00:00+00',
  '2024-01-18 16:10:00+00'
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
  application_deadline,
  status,
  tags,
  target_audience,
  created_at,
  updated_at
) VALUES 
-- Fashion Campaign
(
  '990e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440000',
  'Summer Sustainable Fashion Collection Launch',
  'We are launching our highly anticipated summer collection featuring 100% organic cotton, recycled polyester, and innovative eco-friendly materials. This collection represents our commitment to sustainable fashion without compromising on style or quality. We are looking for fashion influencers who genuinely care about environmental impact and can authentically showcase how sustainable fashion can be both beautiful and responsible. The campaign will highlight our transparent supply chain, ethical manufacturing processes, and the versatility of our summer pieces. We want to work with creators who can inspire their audiences to make more conscious fashion choices while looking absolutely stunning.',
  15000.00,
  'Must have 50k+ followers on Instagram with high engagement rates (3%+), previous experience collaborating with fashion brands, genuine interest in sustainable fashion and environmental causes, high-quality content creation skills, and an audience that aligns with our target demographic of conscious consumers aged 18-35.',
  ARRAY[
    '2 Instagram feed posts featuring different outfits from the collection',
    '4 Instagram stories showing styling tips and behind-the-scenes content',
    '1 Instagram Reel demonstrating the versatility of key pieces',
    '1 blog post or YouTube video about sustainable fashion (bonus deliverable)',
    'Authentic captions sharing personal thoughts on sustainable fashion'
  ],
  '2024-06-01',
  '2024-08-31',
  '2024-05-15',
  'active',
  ARRAY['fashion', 'sustainable', 'summer', 'organic', 'eco-friendly', 'ethical', 'conscious'],
  '{
    "age_range": "18-35",
    "gender": "all",
    "interests": ["fashion", "sustainability", "lifestyle", "eco-friendly", "ethical-consumption"],
    "location": ["US", "CA", "UK", "AU", "DE"],
    "min_followers": 50000,
    "engagement_rate": 3.0,
    "values": ["sustainability", "ethical-fashion", "environmental-consciousness"]
  }'::jsonb,
  '2024-04-01 00:00:00+00',
  '2024-04-15 10:30:00+00'
),
-- Tech Campaign
(
  'aa0e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440000',
  'Revolutionary Wireless Charging Stand Review Campaign',
  'Introducing our game-changing wireless charging stand that solves the biggest problem with wireless charging - overheating. Our innovative cooling technology maintains optimal charging speeds while keeping your device cool and safe. We are seeking tech reviewers and gadget enthusiasts who can provide honest, detailed reviews that help consumers understand the real benefits of this breakthrough product. The campaign focuses on demonstrating practical usage scenarios, comparing performance with competitors, and showing how this product enhances daily tech routines.',
  25000.00,
  'Must have 100k+ followers across platforms with strong engagement in tech content, previous experience reviewing smartphone accessories and charging solutions, ability to create high-quality video content with good lighting and audio, access to multiple devices for testing, and audience interested in mobile technology and innovative gadgets.',
  ARRAY[
    '1 comprehensive YouTube review video (10+ minutes) with detailed testing',
    '3 Instagram posts showcasing key features and benefits',
    '5 Instagram stories documenting unboxing, setup, and daily usage',
    '1 TikTok video demonstrating the cooling technology in action',
    '1 written review on personal blog or website (if available)',
    'Honest comparison with at least 2 competitor products'
  ],
  '2024-07-01',
  '2024-09-30',
  '2024-06-15',
  'active',
  ARRAY['technology', 'smartphone', 'wireless-charging', 'gadgets', 'review', 'innovation', 'mobile-tech'],
  '{
    "age_range": "20-45",
    "gender": "all",
    "interests": ["technology", "gadgets", "smartphones", "innovation", "mobile-accessories"],
    "location": ["US", "CA", "UK", "AU", "DE", "JP"],
    "min_followers": 100000,
    "engagement_rate": 4.0,
    "content_types": ["video-reviews", "unboxing", "tech-tutorials"]
  }'::jsonb,
  '2024-05-01 00:00:00+00',
  '2024-05-10 16:20:00+00'
),
-- Lifestyle Campaign
(
  'bb0e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440000',
  'Home Wellness & Lifestyle Product Collaboration',
  'We are expanding into the wellness and lifestyle space with a curated collection of home products designed to enhance daily routines and create peaceful living spaces. This campaign focuses on showing how small changes in our environment can lead to big improvements in wellbeing. We are looking for lifestyle influencers who can authentically integrate our products into their daily routines and share genuine experiences with their audiences.',
  12000.00,
  'Must have 30k+ followers interested in lifestyle, wellness, or home content, strong engagement rates (4%+), experience creating authentic lifestyle content, ability to style products naturally in home settings, and audience that values wellness and mindful living.',
  ARRAY[
    '2 Instagram posts featuring products in natural home settings',
    '3 Instagram stories showing products in daily routines',
    '1 Instagram Reel demonstrating product benefits',
    'Authentic captions sharing personal wellness journey',
    '1 blog post about creating wellness routines at home (optional)'
  ],
  '2024-08-01',
  '2024-10-31',
  '2024-07-15',
  'active',
  ARRAY['lifestyle', 'wellness', 'home', 'mindfulness', 'self-care', 'daily-routine'],
  '{
    "age_range": "22-40",
    "gender": "all",
    "interests": ["wellness", "lifestyle", "home-decor", "self-care", "mindfulness"],
    "location": ["US", "CA", "UK", "AU"],
    "min_followers": 30000,
    "engagement_rate": 4.0,
    "content_focus": ["lifestyle", "wellness", "home"]
  }'::jsonb,
  '2024-06-01 00:00:00+00',
  '2024-06-05 11:45:00+00'
);

-- Insert sample campaign applications
INSERT INTO campaign_applications (
  id,
  campaign_id,
  influencer_id,
  status,
  proposal,
  proposed_rate,
  portfolio_links,
  availability,
  applied_at,
  reviewed_at
) VALUES 
-- Sarah's application to Fashion Campaign (APPROVED)
(
  'cc0e8400-e29b-41d4-a716-446655440007',
  '990e8400-e29b-41d4-a716-446655440004',
  '660e8400-e29b-41d4-a716-446655440001',
  'approved',
  'I am absolutely thrilled about the opportunity to collaborate with Sustainable Fashion Co! Your brand values align perfectly with my personal mission to promote conscious fashion choices. My audience of 150k+ followers is highly engaged with sustainable fashion content - my recent posts about eco-friendly brands have averaged 8k+ likes with 5.2% engagement rate. I have successfully collaborated with brands like Reformation, Everlane, and Patagonia, creating authentic content that not only showcases products beautifully but also educates my audience about the importance of sustainable fashion. I would love to create content that highlights both the aesthetic appeal and environmental benefits of your summer collection, showing my followers that sustainable fashion can be both stylish and responsible.',
  2500.00,
  ARRAY[
    'https://instagram.com/p/sustainable-fashion-collab1',
    'https://instagram.com/p/eco-friendly-outfit-styling',
    'https://youtube.com/watch?v=sustainable-fashion-haul',
    'https://sarahfashionpro.com/blog/sustainable-fashion-guide'
  ],
  '{
    "start_date": "2024-06-01",
    "end_date": "2024-08-31",
    "preferred_posting_days": ["Tuesday", "Thursday", "Saturday"],
    "timezone": "PST",
    "availability_notes": "Flexible schedule, can accommodate brand events and photoshoots"
  }'::jsonb,
  '2024-04-10 14:30:00+00',
  '2024-04-12 09:15:00+00'
),
-- Mike's application to Tech Campaign (PENDING)
(
  'dd0e8400-e29b-41d4-a716-446655440008',
  'aa0e8400-e29b-41d4-a716-446655440005',
  '770e8400-e29b-41d4-a716-446655440002',
  'pending',
  'This wireless charging stand with cooling technology sounds like exactly the kind of innovative product my audience loves to discover! With 200k+ subscribers across YouTube, Instagram, and TikTok, I specialize in comprehensive tech reviews that help consumers make informed purchasing decisions. My recent smartphone accessory reviews have consistently generated 50k+ views with excellent engagement rates and positive feedback from viewers who appreciate my honest, detailed approach. I have extensive experience testing charging solutions and would provide a thorough review covering design quality, charging speeds, cooling effectiveness, compatibility with different devices, and real-world usage scenarios. My testing methodology includes temperature monitoring, charging speed comparisons, and long-term usage evaluation to give viewers the complete picture.',
  3500.00,
  ARRAY[
    'https://youtube.com/watch?v=wireless-charger-comparison-2024',
    'https://youtube.com/watch?v=smartphone-accessory-reviews',
    'https://instagram.com/p/tech-review-setup-behind-scenes',
    'https://miketechreviews.com/best-wireless-chargers-2024'
  ],
  '{
    "start_date": "2024-07-01",
    "end_date": "2024-09-30",
    "preferred_posting_days": ["Monday", "Wednesday", "Friday"],
    "timezone": "PST",
    "equipment": ["4K camera", "professional lighting", "temperature monitoring tools"],
    "testing_period": "2 weeks minimum for thorough evaluation"
  }'::jsonb,
  '2024-05-15 11:45:00+00',
  NULL
),
-- Emma's application to Lifestyle Campaign (APPROVED)
(
  'ee0e8400-e29b-41d4-a716-446655440009',
  'bb0e8400-e29b-41d4-a716-446655440006',
  '880e8400-e29b-41d4-a716-446655440003',
  'approved',
  'I am so excited about this wellness and lifestyle collaboration! Creating content around wellness routines and mindful living is truly my passion, and your product collection sounds perfect for my audience who is always looking for ways to enhance their daily wellness practices. My followers of 80k+ are highly engaged (6.1% engagement rate) and genuinely interested in authentic lifestyle recommendations. I love showing how small, intentional changes in our environment can create big shifts in our wellbeing. I would integrate your products naturally into my existing routines and share honest experiences about how they enhance my daily wellness practices. My content style focuses on authenticity and real-life application rather than overly polished presentations.',
  1800.00,
  ARRAY[
    'https://instagram.com/p/morning-wellness-routine',
    'https://instagram.com/p/home-wellness-space-tour',
    'https://youtube.com/watch?v=creating-peaceful-home-environment',
    'https://emmalifestyleguide.com/wellness-routine-essentials'
  ],
  '{
    "start_date": "2024-08-01",
    "end_date": "2024-10-31",
    "preferred_posting_days": ["Sunday", "Wednesday", "Friday"],
    "timezone": "EST",
    "content_style": "natural lifestyle integration",
    "home_setting": "minimalist modern apartment with natural lighting"
  }'::jsonb,
  '2024-06-20 16:20:00+00',
  '2024-06-22 10:30:00+00'
),
-- Sarah's second application to Lifestyle Campaign (PENDING)
(
  'ff0e8400-e29b-41d4-a716-446655440010',
  'bb0e8400-e29b-41d4-a716-446655440006',
  '660e8400-e29b-41d4-a716-446655440001',
  'pending',
  'While I am primarily known for fashion content, wellness and lifestyle are increasingly important parts of my content strategy and personal brand. My audience often asks about my daily routines, self-care practices, and how I maintain balance while creating content. I believe there is beautiful synergy between fashion and wellness - both are about feeling confident and comfortable in your own skin. I would love to explore how your wellness products fit into a holistic lifestyle approach that includes both looking good and feeling good. My fashion audience is very interested in lifestyle content, and this collaboration could introduce your brand to a new demographic.',
  2000.00,
  ARRAY[
    'https://instagram.com/p/morning-routine-fashion-wellness',
    'https://instagram.com/p/self-care-sunday-routine',
    'https://sarahfashionpro.com/blog/wellness-and-style-balance'
  ],
  '{
    "start_date": "2024-08-15",
    "end_date": "2024-10-31",
    "preferred_posting_days": ["Sunday", "Tuesday", "Thursday"],
    "timezone": "PST",
    "content_angle": "fashion meets wellness lifestyle"
  }'::jsonb,
  '2024-06-25 13:15:00+00',
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
  '110e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440000',
  'Welcome to Wonlink! 🎉',
  'Your brand profile has been created successfully. Start creating campaigns to connect with talented influencers and grow your brand reach. Our platform makes it easy to find the perfect creators for your brand.',
  'welcome',
  false,
  '{
    "action": "create_campaign",
    "url": "/brand/campaigns/create",
    "cta": "Create Your First Campaign"
  }'::jsonb,
  '2024-01-01 00:30:00+00'
),
-- Application notification for brand
(
  '220e8400-e29b-41d4-a716-446655440012',
  '550e8400-e29b-41d4-a716-446655440000',
  'New Campaign Application Received 📩',
  'Sarah Fashion Pro has applied to your "Summer Sustainable Fashion Collection Launch" campaign. Her proposal looks promising - review her portfolio and engagement metrics to make a decision.',
  'campaign_application',
  false,
  '{
    "campaign_id": "990e8400-e29b-41d4-a716-446655440004",
    "application_id": "cc0e8400-e29b-41d4-a716-446655440007",
    "influencer_name": "Sarah Fashion Pro",
    "influencer_id": "660e8400-e29b-41d4-a716-446655440001",
    "proposed_rate": 2500.00,
    "action": "review_application"
  }'::jsonb,
  '2024-04-10 14:35:00+00'
),
-- Campaign performance update
(
  '330e8400-e29b-41d4-a716-446655440013',
  '550e8400-e29b-41d4-a716-446655440000',
  'Campaign Performance Update 📈',
  'Your "Revolutionary Wireless Charging Stand Review Campaign" has received 12 new views and 3 applications in the last 48 hours. Your campaign is performing well!',
  'campaign_performance',
  true,
  '{
    "campaign_id": "aa0e8400-e29b-41d4-a716-446655440005",
    "campaign_title": "Revolutionary Wireless Charging Stand Review Campaign",
    "new_views": 12,
    "new_applications": 3,
    "period": "48 hours",
    "total_applications": 5
  }'::jsonb,
  '2024-05-17 09:20:00+00'
),
-- Welcome notification for Sarah
(
  '440e8400-e29b-41d4-a716-446655440014',
  '660e8400-e29b-41d4-a716-446655440001',
  'Welcome to Wonlink! ✨',
  'Your influencer profile is ready! Browse active campaigns and start applying to collaborate with amazing brands that match your style and values. Your verification is complete!',
  'welcome',
  true,
  '{
    "action": "browse_campaigns",
    "url": "/influencer/campaigns",
    "cta": "Browse Active Campaigns",
    "profile_completion": 100
  }'::jsonb,
  '2024-01-02 00:30:00+00'
),
-- Application approved notification for Sarah
(
  '550e8400-e29b-41d4-a716-446655440015',
  '660e8400-e29b-41d4-a716-446655440001',
  'Application Approved! 🎊',
  'Congratulations! Sustainable Fashion Co has approved your application for the "Summer Sustainable Fashion Collection Launch" campaign. Check your email for collaboration details and next steps.',
  'application_approved',
  false,
  '{
    "campaign_id": "990e8400-e29b-41d4-a716-446655440004",
    "application_id": "cc0e8400-e29b-41d4-a716-446655440007",
    "brand_name": "Sustainable Fashion Co",
    "approved_rate": 2500.00,
    "next_steps": "Check email for contract and product details"
  }'::jsonb,
  '2024-04-12 09:20:00+00'
),
-- Payment received notification for Sarah
(
  '660e8400-e29b-41d4-a716-446655440016',
  '660e8400-e29b-41d4-a716-446655440001',
  'Payment Received! 💰',
  'You have received $2,392.50 for your "Summer Sustainable Fashion Collection Launch" collaboration. The amount reflects the agreed rate minus platform fees.',
  'payment_received',
  false,
  '{
    "amount": 2392.50,
    "original_amount": 2500.00,
    "platform_fee": 107.50,
    "campaign_title": "Summer Sustainable Fashion Collection Launch",
    "transaction_id": "220e8400-e29b-41d4-a716-446655440012"
  }'::jsonb,
  '2024-04-15 14:45:00+00'
),
-- Welcome notification for Mike
(
  '770e8400-e29b-41d4-a716-446655440017',
  '770e8400-e29b-41d4-a716-446655440002',
  'Welcome to Wonlink! 🚀',
  'Your tech reviewer profile is live! Start browsing tech campaigns and connect with innovative brands looking for honest product reviews. Your expertise is in high demand!',
  'welcome',
  true,
  '{
    "action": "browse_campaigns",
    "url": "/influencer/campaigns",
    "cta": "Find Tech Campaigns",
    "specialization": "tech_reviews"
  }'::jsonb,
  '2024-01-03 00:30:00+00'
),
-- Application under review notification for Mike
(
  '880e8400-e29b-41d4-a716-446655440018',
  '770e8400-e29b-41d4-a716-446655440002',
  'Application Under Review ⏳',
  'Your application for "Revolutionary Wireless Charging Stand Review Campaign" is being reviewed by Sustainable Fashion Co. We will notify you once they make a decision.',
  'application_review',
  false,
  '{
    "campaign_id": "aa0e8400-e29b-41d4-a716-446655440005",
    "application_id": "dd0e8400-e29b-41d4-a716-446655440008",
    "campaign_title": "Revolutionary Wireless Charging Stand Review Campaign",
    "status": "under_review",
    "estimated_response": "within 5 business days"
  }'::jsonb,
  '2024-05-15 12:00:00+00'
),
-- Welcome notification for Emma
(
  '990e8400-e29b-41d4-a716-446655440019',
  '880e8400-e29b-41d4-a716-446655440003',
  'Welcome to Wonlink! 🌿',
  'Your lifestyle influencer profile is ready! Discover wellness and lifestyle campaigns from brands that value authentic, mindful content creation. Your wellness focus is perfect for our platform!',
  'welcome',
  true,
  '{
    "action": "browse_campaigns",
    "url": "/influencer/campaigns",
    "cta": "Explore Lifestyle Campaigns",
    "specialization": "lifestyle_wellness"
  }'::jsonb,
  '2024-01-04 00:30:00+00'
),
-- Application approved notification for Emma
(
  'aa1e8400-e29b-41d4-a716-446655440020',
  '880e8400-e29b-41d4-a716-446655440003',
  'Application Approved! 🌟',
  'Wonderful news! Sustainable Fashion Co has approved your application for the "Home Wellness & Lifestyle Product Collaboration" campaign. Your authentic approach to wellness content impressed them!',
  'application_approved',
  false,
  '{
    "campaign_id": "bb0e8400-e29b-41d4-a716-446655440006",
    "application_id": "ee0e8400-e29b-41d4-a716-446655440009",
    "brand_name": "Sustainable Fashion Co",
    "approved_rate": 1800.00,
    "collaboration_start": "2024-08-01"
  }'::jsonb,
  '2024-06-22 10:35:00+00'
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
  metadata,
  created_at
) VALUES 
-- Welcome bonus for Sarah
(
  'bb1e8400-e29b-41d4-a716-446655440021',
  '660e8400-e29b-41d4-a716-446655440001',
  1000.00,
  'credit',
  'Welcome bonus for joining Wonlink platform as verified influencer',
  '660e8400-e29b-41d4-a716-446655440001',
  'welcome_bonus',
  'completed',
  '{
    "bonus_type": "influencer_welcome",
    "verification_status": "verified",
    "account_type": "influencer",
    "eligibility": "first_time_verified_user"
  }'::jsonb,
  '2024-01-02 00:35:00+00'
),
-- Campaign payment for Sarah's approved collaboration
(
  'cc1e8400-e29b-41d4-a716-446655440022',
  '660e8400-e29b-41d4-a716-446655440001',
  2500.00,
  'credit',
  'Payment for "Summer Sustainable Fashion Collection Launch" campaign collaboration',
  'cc0e8400-e29b-41d4-a716-446655440007',
  'campaign_payment',
  'completed',
  '{
    "campaign_title": "Summer Sustainable Fashion Collection Launch",
    "brand_name": "Sustainable Fashion Co",
    "collaboration_type": "sponsored_content",
    "deliverables_completed": true,
    "payment_method": "platform_wallet"
  }'::jsonb,
  '2024-04-15 14:30:00+00'
),
-- Platform fee deduction for Sarah
(
  'dd1e8400-e29b-41d4-a716-446655440023',
  '660e8400-e29b-41d4-a716-446655440001',
  107.50,
  'debit',
  'Platform service fee (4.3% of $2,500.00)',
  'cc1e8400-e29b-41d4-a716-446655440022',
  'platform_fee',
  'completed',
  '{
    "fee_percentage": 4.3,
    "original_amount": 2500.00,
    "fee_calculation": "2500 * 0.043 = 107.50",
    "fee_type": "campaign_completion"
  }'::jsonb,
  '2024-04-15 14:31:00+00'
),
-- Welcome bonus for Mike
(
  'ee1e8400-e29b-41d4-a716-446655440024',
  '770e8400-e29b-41d4-a716-446655440002',
  1000.00,
  'credit',
  'Welcome bonus for joining Wonlink platform as verified tech reviewer',
  '770e8400-e29b-41d4-a716-446655440002',
  'welcome_bonus',
  'completed',
  '{
    "bonus_type": "influencer_welcome",
    "verification_status": "verified",
    "account_type": "tech_reviewer",
    "specialization": "technology_reviews"
  }'::jsonb,
  '2024-01-03 00:35:00+00'
),
-- Profile boost payment for Mike
(
  'ff1e8400-e29b-41d4-a716-446655440025',
  '770e8400-e29b-41d4-a716-446655440002',
  50.00,
  'debit',
  'Profile boost to increase visibility in tech campaign searches',
  '770e8400-e29b-41d4-a716-446655440002',
  'profile_boost',
  'completed',
  '{
    "boost_type": "category_visibility",
    "category": "technology",
    "duration_days": 30,
    "boost_level": "standard"
  }'::jsonb,
  '2024-02-01 10:15:00+00'
),
-- Welcome bonus for Emma
(
  '111e8400-e29b-41d4-a716-446655440026',
  '880e8400-e29b-41d4-a716-446655440003',
  1000.00,
  'credit',
  'Welcome bonus for joining Wonlink platform as verified lifestyle influencer',
  '880e8400-e29b-41d4-a716-446655440003',
  'welcome_bonus',
  'completed',
  '{
    "bonus_type": "influencer_welcome",
    "verification_status": "verified",
    "account_type": "lifestyle_influencer",
    "specialization": "wellness_lifestyle"
  }'::jsonb,
  '2024-01-04 00:35:00+00'
),
-- Campaign payment for Emma's approved collaboration
(
  '222e8400-e29b-41d4-a716-446655440027',
  '880e8400-e29b-41d4-a716-446655440003',
  1800.00,
  'credit',
  'Payment for "Home Wellness & Lifestyle Product Collaboration" campaign',
  'ee0e8400-e29b-41d4-a716-446655440009',
  'campaign_payment',
  'completed',
  '{
    "campaign_title": "Home Wellness & Lifestyle Product Collaboration",
    "brand_name": "Sustainable Fashion Co",
    "collaboration_type": "product_integration",
    "deliverables_completed": true,
    "payment_method": "platform_wallet"
  }'::jsonb,
  '2024-06-25 16:00:00+00'
),
-- Platform fee deduction for Emma
(
  '333e8400-e29b-41d4-a716-446655440028',
  '880e8400-e29b-41d4-a716-446655440003',
  77.40,
  'debit',
  'Platform service fee (4.3% of $1,800.00)',
  '222e8400-e29b-41d4-a716-446655440027',
  'platform_fee',
  'completed',
  '{
    "fee_percentage": 4.3,
    "original_amount": 1800.00,
    "fee_calculation": "1800 * 0.043 = 77.40",
    "fee_type": "campaign_completion"
  }'::jsonb,
  '2024-06-25 16:01:00+00'
),
-- Referral bonus for Sarah (referred Emma)
(
  '444e8400-e29b-41d4-a716-446655440029',
  '660e8400-e29b-41d4-a716-446655440001',
  250.00,
  'credit',
  'Referral bonus for successfully referring Emma Lifestyle Guide to the platform',
  '880e8400-e29b-41d4-a716-446655440003',
  'referral_bonus',
  'completed',
  '{
    "referred_user": "Emma Lifestyle Guide",
    "referred_user_id": "880e8400-e29b-41d4-a716-446655440003",
    "referral_type": "influencer_referral",
    "bonus_tier": "standard",
    "referred_user_status": "verified_and_active"
  }'::jsonb,
  '2024-01-10 12:00:00+00'
);

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;

-- Final verification and summary
DO $$
DECLARE
    profile_count INTEGER;
    campaign_count INTEGER;
    application_count INTEGER;
    notification_count INTEGER;
    transaction_count INTEGER;
    total_wallet_credits DECIMAL;
    total_wallet_debits DECIMAL;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO campaign_count FROM campaigns;
    SELECT COUNT(*) INTO application_count FROM campaign_applications;
    SELECT COUNT(*) INTO notification_count FROM notifications;
    SELECT COUNT(*) INTO transaction_count FROM wallet_transactions;
    
    SELECT COALESCE(SUM(amount), 0) INTO total_wallet_credits 
    FROM wallet_transactions WHERE type = 'credit';
    
    SELECT COALESCE(SUM(amount), 0) INTO total_wallet_debits 
    FROM wallet_transactions WHERE type = 'debit';
    
    RAISE NOTICE '╔══════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║                    WONLINK SAMPLE DATA COMPLETE              ║';
    RAISE NOTICE '╠══════════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║ ✅ Profiles created: %                                      ║', LPAD(profile_count::text, 32);
    RAISE NOTICE '║ ✅ Campaigns created: %                                     ║', LPAD(campaign_count::text, 31);
    RAISE NOTICE '║ ✅ Applications created: %                                  ║', LPAD(application_count::text, 28);
    RAISE NOTICE '║ ✅ Notifications created: %                                 ║', LPAD(notification_count::text, 27);
    RAISE NOTICE '║ ✅ Transactions created: %                                  ║', LPAD(transaction_count::text, 28);
    RAISE NOTICE '╠══════════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║                         SAMPLE PROFILES                      ║';
    RAISE NOTICE '╠══════════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║ 🏢 Brand: Sustainable Fashion Co                            ║';
    RAISE NOTICE '║    • Email: brand@sustainablefashion.com                    ║';
    RAISE NOTICE '║    • Focus: Sustainable fashion & eco-friendly products     ║';
    RAISE NOTICE '║                                                              ║';
    RAISE NOTICE '║ 👩 Influencer: Sarah Fashion Pro                            ║';
    RAISE NOTICE '║    • Email: sarah@fashionpro.com                            ║';
    RAISE NOTICE '║    • Followers: 150k+ | Engagement: 5.2%%                   ║';
    RAISE NOTICE '║    • Focus: Fashion & sustainable lifestyle                 ║';
    RAISE NOTICE '║                                                              ║';
    RAISE NOTICE '║ 👨 Influencer: Mike Tech Reviews                            ║';
    RAISE NOTICE '║    • Email: mike@techreviews.com                            ║';
    RAISE NOTICE '║    • Followers: 200k+ | Engagement: 4.7%%                   ║';
    RAISE NOTICE '║    • Focus: Technology reviews & gadgets                    ║';
    RAISE NOTICE '║                                                              ║';
    RAISE NOTICE '║ 👩 Influencer: Emma Lifestyle Guide                         ║';
    RAISE NOTICE '║    • Email: emma@lifestyleguide.com                         ║';
    RAISE NOTICE '║    • Followers: 80k+ | Engagement: 6.1%%                    ║';
    RAISE NOTICE '║    • Focus: Wellness & lifestyle content                    ║';
    RAISE NOTICE '╠══════════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║                        ACTIVE CAMPAIGNS                      ║';
    RAISE NOTICE '╠══════════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║ 🌟 Summer Sustainable Fashion Collection Launch             ║';
    RAISE NOTICE '║    • Budget: $15,000 | Status: Active                      ║';
    RAISE NOTICE '║    • Applications: 2 (1 approved, 1 pending)               ║';
    RAISE NOTICE '║                                                              ║';
    RAISE NOTICE '║ 📱 Revolutionary Wireless Charging Stand Review             ║';
    RAISE NOTICE '║    • Budget: $25,000 | Status: Active                      ║';
    RAISE NOTICE '║    • Applications: 1 (pending review)                       ║';
    RAISE NOTICE '║                                                              ║';
    RAISE NOTICE '║ 🏠 Home Wellness & Lifestyle Product Collaboration          ║';
    RAISE NOTICE '║    • Budget: $12,000 | Status: Active                      ║';
    RAISE NOTICE '║    • Applications: 2 (1 approved, 1 pending)               ║';
    RAISE NOTICE '╠══════════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║                      WALLET SUMMARY                          ║';
    RAISE NOTICE '╠══════════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║ 💰 Total Credits: $%                                       ║', LPAD(total_wallet_credits::text, 31);
    RAISE NOTICE '║ 💸 Total Debits: $%                                        ║', LPAD(total_wallet_debits::text, 32);
    RAISE NOTICE '║ 📊 Net Amount: $%                                          ║', LPAD((total_wallet_credits - total_wallet_debits)::text, 33);
    RAISE NOTICE '╠══════════════════════════════════════════════════════════════╣';
    RAISE NOTICE '║                    🎉 SETUP COMPLETE! 🎉                    ║';
    RAISE NOTICE '║                                                              ║';
    RAISE NOTICE '║ Your Wonlink platform is now ready for testing with:        ║';
    RAISE NOTICE '║ • Realistic sample data across all features                 ║';
    RAISE NOTICE '║ • Multiple user types and interaction scenarios             ║';
    RAISE NOTICE '║ • Complete campaign and application workflows               ║';
    RAISE NOTICE '║ • Wallet transactions and notification system              ║';
    RAISE NOTICE '║                                                              ║';
    RAISE NOTICE '║ 🚀 Ready to deploy and test your platform!                  ║';
    RAISE NOTICE '╚══════════════════════════════════════════════════════════════╝';
    
END $$;


Has this error from supbase when I ran it.