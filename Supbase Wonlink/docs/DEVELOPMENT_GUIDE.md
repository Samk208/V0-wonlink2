# 🔧 Wonlink Platform - Development Guide

**For Developers**: Complete guide to working with the Wonlink codebase  
**Last Updated**: January 2025

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Git
- Supabase account (auto-configured with v0 integration)
- Code editor (VS Code recommended)

### **Setup Steps**
\`\`\`bash
# 1. Clone and install
git clone <your-repo-url>
cd wonlink-platform
npm install

# 2. Start development server
npm run dev

# 3. Open browser
open http://localhost:3000
\`\`\`

### **Database Setup**
1. Open your Supabase dashboard (connected via v0 integration)
2. Go to SQL Editor
3. Run `scripts/complete-database-setup.sql`
4. Run `scripts/sample-data-complete-fixed.sql`
5. Verify tables and sample data are created

---

## 🏗️ **Architecture Patterns**

### **File Structure**
\`\`\`
app/
├── (auth)/                    # Auth-related pages
│   ├── login/
│   └── register/
├── brand/                     # Brand user pages
│   ├── dashboard/
│   ├── campaigns/
│   └── wallet/
├── influencer/                # Influencer user pages
│   ├── dashboard/
│   ├── campaigns/
│   └── wallet/
├── api/                       # API routes
│   ├── auth/
│   ├── campaigns/
│   └── profiles/
└── globals.css

components/
├── design-system/             # Reusable UI components
├── campaign-management/       # Campaign-specific components
├── profile/                   # Profile-related components
├── navigation/                # Navigation components
└── ui/                        # shadcn/ui components

lib/
├── supabase.ts               # Supabase client configuration
├── auth.ts                   # Authentication helpers
├── utils.ts                  # Utility functions
└── translations.ts           # Internationalization
\`\`\`

### **Component Patterns**

#### **Server Components (Default)**
\`\`\`typescript
// app/campaigns/page.tsx
import { getCampaigns } from '@/lib/campaigns'

export default async function CampaignsPage() {
  const campaigns = await getCampaigns()
  
  return (
    <div>
      <h1>Campaigns</h1>
      <CampaignList campaigns={campaigns} />
    </div>
  )
}
\`\`\`

#### **Client Components**
\`\`\`typescript
// components/campaign-card.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface CampaignCardProps {
  campaign: Campaign
  onApply?: (campaignId: string) => void
}

export function CampaignCard({ campaign, onApply }: CampaignCardProps) {
  const [isApplying, setIsApplying] = useState(false)
  
  const handleApply = async () => {
    setIsApplying(true)
    try {
      await onApply?.(campaign.id)
    } finally {
      setIsApplying(false)
    }
  }
  
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold">{campaign.title}</h3>
      <p className="text-muted-foreground">{campaign.description}</p>
      <Button onClick={handleApply} disabled={isApplying}>
        {isApplying ? 'Applying...' : 'Apply Now'}
      </Button>
    </div>
  )
}
\`\`\`

---

## 🔐 **Authentication Patterns**

### **Client-Side Auth Hook**
\`\`\`typescript
// hooks/use-auth.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
\`\`\`

### **Server-Side Auth**
\`\`\`typescript
// lib/auth.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function getServerUser() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getServerUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}
\`\`\`

### **Protected Route Pattern**
\`\`\`typescript
// app/brand/dashboard/page.tsx
import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function BrandDashboard() {
  const user = await requireAuth()
  
  // Check if user is a brand
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'brand') {
    redirect('/influencer/dashboard')
  }
  
  return <BrandDashboardContent />
}
\`\`\`

---

## 🗄️ **Database Patterns**

### **Supabase Client Setup**
\`\`\`typescript
// lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

// Type-safe database interface
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'brand' | 'influencer'
          bio: string | null
          avatar_url: string | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role: 'brand' | 'influencer'
          bio?: string | null
          avatar_url?: string | null
          verified?: boolean
        }
        Update: {
          name?: string
          bio?: string | null
          avatar_url?: string | null
        }
      }
      // ... other tables
    }
  }
}
\`\`\`

### **Data Fetching Patterns**

#### **Server-Side Data Fetching**
\`\`\`typescript
// lib/campaigns.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function getCampaigns(filters?: {
  status?: string
  tags?: string[]
  limit?: number
}) {
  const supabase = createServerComponentClient({ cookies })
  
  let query = supabase
    .from('campaigns')
    .select(`
      *,
      profiles:brand_id (
        name,
        avatar_url,
        verified
      )
    `)
    .order('created_at', { ascending: false })
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.tags?.length) {
    query = query.overlaps('tags', filters.tags)
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    throw new Error(`Failed to fetch campaigns: ${error.message}`)
  }
  
  return data
}
\`\`\`

#### **Client-Side Data Fetching**
\`\`\`typescript
// hooks/use-campaigns.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useCampaigns(filters?: CampaignFilters) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        setLoading(true)
        setError(null)
        
        let query = supabase
          .from('campaigns')
          .select('*, profiles:brand_id(name, avatar_url, verified)')
          .order('created_at', { ascending: false })
        
        if (filters?.status) {
          query = query.eq('status', filters.status)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        
        setCampaigns(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [filters])

  return { campaigns, loading, error }
}
\`\`\`

### **Real-time Subscriptions**
\`\`\`typescript
// hooks/use-realtime-campaigns.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtimeCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    // Initial fetch
    fetchCampaigns()

    // Set up real-time subscription
    const subscription = supabase
      .channel('campaigns')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'campaigns'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCampaigns(prev => [payload.new as Campaign, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setCampaigns(prev => 
            prev.map(campaign => 
              campaign.id === payload.new.id 
                ? { ...campaign, ...payload.new }
                : campaign
            )
          )
        } else if (payload.eventType === 'DELETE') {
          setCampaigns(prev => 
            prev.filter(campaign => campaign.id !== payload.old.id)
          )
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchCampaigns() {
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setCampaigns(data)
  }

  return campaigns
}
\`\`\`

---

## 🎨 **Design System Usage**

### **Using shadcn/ui Components**
\`\`\`typescript
// components/campaign-form.tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CampaignForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Campaign</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Campaign title" />
        <Textarea placeholder="Campaign description" />
        <Button type="submit">Create Campaign</Button>
      </CardContent>
    </Card>
  )
}
\`\`\`

### **Custom Design System Components**
\`\`\`typescript
// components/design-system/cards/universal-card.tsx
import { cn } from '@/lib/utils'

interface UniversalCardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
  className?: string
}

export function UniversalCard({ 
  children, 
  variant = 'default', 
  className 
}: UniversalCardProps) {
  return (
    <div className={cn(
      'rounded-lg border bg-card text-card-foreground',
      {
        'shadow-sm': variant === 'default',
        'shadow-lg': variant === 'elevated',
        'border-2': variant === 'outlined'
      },
      className
    )}>
      {children}
    </div>
  )
}
\`\`\`

### **Responsive Design Patterns**
\`\`\`typescript
// components/campaign-grid.tsx
export function CampaignGrid({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map(campaign => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  )
}
\`\`\`

---

## 📱 **Mobile Development**

### **Capacitor Configuration**
\`\`\`typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.wonlink.app',
  appName: 'Wonlink',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SafeArea: {
      enabled: true
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
}

export default config
\`\`\`

### **Platform Detection Hook**
\`\`\`typescript
// hooks/use-platform.tsx
'use client'

import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'

export function usePlatform() {
  const [platform, setPlatform] = useState<'web' | 'ios' | 'android'>('web')
  const [isNative, setIsNative] = useState(false)

  useEffect(() => {
    const currentPlatform = Capacitor.getPlatform()
    setPlatform(currentPlatform as 'web' | 'ios' | 'android')
    setIsNative(Capacitor.isNativePlatform())
  }, [])

  return { platform, isNative }
}
\`\`\`

### **Safe Area Component**
\`\`\`typescript
// components/mobile-safe-area.tsx
'use client'

import { usePlatform } from '@/hooks/use-platform'

interface SafeAreaProps {
  children: React.ReactNode
  className?: string
}

export function SafeArea({ children, className }: SafeAreaProps) {
  const { isNative } = usePlatform()
  
  return (
    <div className={cn(
      isNative && 'pt-safe-area-top pb-safe-area-bottom',
      className
    )}>
      {children}
    </div>
  )
}
\`\`\`

---

## 🧪 **Testing Patterns**

### **Component Testing**
\`\`\`typescript
// __tests__/components/campaign-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { CampaignCard } from '@/components/campaign-card'

const mockCampaign = {
  id: '1',
  title: 'Test Campaign',
  description: 'Test description',
  budget: 1000,
  status: 'active'
}

describe('CampaignCard', () => {
  it('renders campaign information', () => {
    render(<CampaignCard campaign={mockCampaign} />)
    
    expect(screen.getByText('Test Campaign')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('$1,000')).toBeInTheDocument()
  })

  it('calls onApply when apply button is clicked', () => {
    const onApply = jest.fn()
    render(<CampaignCard campaign={mockCampaign} onApply={onApply} />)
    
    fireEvent.click(screen.getByText('Apply Now'))
    expect(onApply).toHaveBeenCalledWith('1')
  })
})
\`\`\`

### **API Route Testing**
\`\`\`typescript
// __tests__/api/campaigns.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/campaigns/route'

describe('/api/campaigns', () => {
  it('returns campaigns for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data).toHaveProperty('campaigns')
    expect(Array.isArray(data.campaigns)).toBe(true)
  })
})
\`\`\`

---

## 🐛 **Debugging & Troubleshooting**

### **Common Issues**

#### **Authentication Issues**
\`\`\`typescript
// Debug auth state
console.log('Auth state:', {
  user: user,
  session: session,
  loading: loading
})

// Check if user is properly authenticated
if (!user) {
  console.error('User not authenticated')
  return
}

// Verify user role
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

console.log('User profile:', profile)
\`\`\`

#### **Database Query Issues**
\`\`\`typescript
// Add detailed error logging
const { data, error } = await supabase
  .from('campaigns')
  .select('*')
  .eq('status', 'active')

if (error) {
  console.error('Database error:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code
  })
}
\`\`\`

#### **RLS Policy Issues**
\`\`\`sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Test policy with specific user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM campaigns WHERE status = 'active';
\`\`\`

### **Performance Debugging**
\`\`\`typescript
// Add performance monitoring
const startTime = performance.now()

const { data, error } = await supabase
  .from('campaigns')
  .select('*')

const endTime = performance.now()
console.log(`Query took ${endTime - startTime} milliseconds`)

// Monitor component render times
import { Profiler } from 'react'

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component render:', { id, phase, actualDuration })
}

<Profiler id="CampaignList" onRender={onRenderCallback}>
  <CampaignList campaigns={campaigns} />
</Profiler>
\`\`\`

---

## 🚀 **Deployment & Build**

### **Build Commands**
\`\`\`bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Mobile builds
npm run build:mobile
npx cap sync
npx cap open ios
npx cap open android

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
\`\`\`

### **Environment Variables**
\`\`\`bash
# .env.local (for local development)
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# .env.production (for production)
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com
\`\`\`

### **Vercel Deployment**
\`\`\`json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
\`\`\`

---

## 📚 **Code Examples Library**

### **Form Handling with Server Actions**
\`\`\`typescript
// app/campaigns/create/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function createCampaign(formData: FormData) {
  const supabase = createServerActionClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Authentication required')
  }

  const campaignData = {
    brand_id: user.id,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    budget: parseFloat(formData.get('budget') as string),
    status: 'draft'
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert(campaignData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create campaign: ${error.message}`)
  }

  revalidatePath('/brand/campaigns')
  redirect(`/brand/campaigns/${data.id}`)
}
\`\`\`

### **File Upload Pattern**
\`\`\`typescript
// components/avatar-upload.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function AvatarUpload({ userId, currentUrl, onUpload }: {
  userId: string
  currentUrl?: string
  onUpload: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      onUpload(data.publicUrl)
    } catch (error) {
      alert('Error uploading avatar!')
      console.log(error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {currentUrl && (
        <img
          src={currentUrl || "/placeholder.svg"}
          alt="Avatar"
          className="w-20 h-20 rounded-full object-cover"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={uploading}
      />
    </div>
  )
}
\`\`\`

### **Search and Filter Pattern**
\`\`\`typescript
// components/campaign-search.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface CampaignSearchProps {
  campaigns: Campaign[]
  onFilteredCampaigns: (campaigns: Campaign[]) => void
}

export function CampaignSearch({ campaigns, onFilteredCampaigns }: CampaignSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      // Text search
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
      
      // Tag filter
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => campaign.tags.includes(tag))
      
      return matchesSearch && matchesStatus && matchesTags
    })
  }, [campaigns, searchTerm, statusFilter, selectedTags])

  useEffect(() => {
    onFilteredCampaigns(filteredCampaigns)
  }, [filteredCampaigns, onFilteredCampaigns])

  const allTags = useMemo(() => {
    const tags = campaigns.flatMap(campaign => campaign.tags)
    return [...new Set(tags)]
  }, [campaigns])

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search campaigns..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="draft">Draft</option>
        <option value="completed">Completed</option>
      </Select>
      
      <div className="flex flex-wrap gap-2">
        {allTags.map(tag => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => {
              setSelectedTags(prev => 
                prev.includes(tag) 
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              )
            }}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}
\`\`\`

---

## 🔧 **Best Practices**

### **Code Organization**
- **Single Responsibility**: Each component should have one clear purpose
- **Composition over Inheritance**: Use composition patterns for reusability
- **Custom Hooks**: Extract complex logic into reusable hooks
- **Type Safety**: Use TypeScript strictly, avoid `any` types
- **Error Boundaries**: Implement error boundaries for graceful error handling

### **Performance**
- **Server Components**: Use server components by default, client components only when needed
- **Lazy Loading**: Implement lazy loading for large components and routes
- **Memoization**: Use `useMemo` and `useCallback` judiciously
- **Image Optimization**: Use Next.js Image component for automatic optimization
- **Database Queries**: Optimize queries with proper indexing and selective fields

### **Security**
- **Input Validation**: Validate all user inputs on both client and server
- **SQL Injection**: Use parameterized queries (Supabase handles this)
- **XSS Prevention**: Sanitize user-generated content
- **Authentication**: Always verify user authentication and authorization
- **Environment Variables**: Never expose sensitive data in client-side code

### **Accessibility**
- **Semantic HTML**: Use proper HTML elements for their intended purpose
- **ARIA Labels**: Add ARIA labels for screen readers
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Color Contrast**: Maintain sufficient color contrast ratios
- **Focus Management**: Implement proper focus management for modals and navigation

---

**Happy Coding!** 🚀

*This guide is a living document. Update it as the codebase evolves and new patterns emerge.*

