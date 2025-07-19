# 🌟 Wonlink - Influencer Commerce Platform

A comprehensive platform connecting brands with influencers for authentic marketing collaborations, built with Next.js 15, Supabase, and modern web technologies.

## 🚀 Quick Start

1. **Clone and Install**
   \`\`\`bash
   git clone <your-repo-url>
   cd wonlink-platform
   npm install
   \`\`\`

2. **Set Up Database**
   - Run the SQL scripts in `scripts/` folder in your Supabase dashboard
   - Start with `complete-database-setup.sql`
   - Then run `sample-data-complete-fixed.sql`

3. **Run Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open Browser**
   - Visit `http://localhost:3000`
   - Test with sample users from the database

## 📁 Project Structure

\`\`\`
wonlink-platform/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   ├── brand/                    # Brand dashboard & features
│   ├── influencer/               # Influencer dashboard & features
│   ├── api/                      # API routes
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── design-system/            # Reusable design components
│   ├── campaign-management/      # Campaign-related components
│   ├── profile/                  # User profile components
│   ├── navigation/               # Navigation components
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utilities and configurations
│   ├── supabase.ts              # Supabase client
│   ├── auth.ts                  # Authentication helpers
│   └── translations.ts          # Internationalization
├── hooks/                        # Custom React hooks
├── scripts/                      # Database setup scripts
└── docs/                         # Documentation
\`\`\`

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Mobile**: Capacitor (iOS/Android)
- **Deployment**: Vercel

## 📖 Documentation

- [📋 Project Handover](./docs/PROJECT_HANDOVER.md) - Complete project overview
- [🔧 Development Guide](./docs/DEVELOPMENT_GUIDE.md) - Developer setup and patterns
- [📡 API Reference](./docs/API_REFERENCE.md) - Complete API documentation
- [🚀 Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) - Production deployment

## 🎯 Key Features

- **Multi-role Authentication** (Brand/Influencer)
- **Campaign Management** (Create, browse, apply)
- **Profile System** (Verification, portfolios)
- **Wallet & Payments** (Transactions, withdrawals)
- **Real-time Notifications**
- **Analytics Dashboard**
- **Mobile App Support**
- **Multi-language** (English/Korean)

## 🔐 Sample Users

After running the sample data script, you can test with:

- **Brand**: `brand@example.com` / `password123`
- **Influencer**: `sarah@example.com` / `password123`
- **Tech Reviewer**: `mike@example.com` / `password123`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary. All rights reserved.

---

Built with ❤️ for authentic influencer marketing

