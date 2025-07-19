#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * This script tests the connection to your Supabase instance
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Environment Variables Check:');
  console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓ Set' : '❌ Missing'}`);
  console.log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓ Set' : '❌ Missing'}`);
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? '✓ Set' : '❌ Missing'}\n`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing required environment variables. Please check your .env.local file.');
    return;
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('🔗 Testing basic connection...');
    
    // Test 1: Basic connection test
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (healthError) {
      console.log('❌ Connection test failed:', healthError.message);
      return;
    }

    console.log('✅ Basic connection successful!\n');

    // Test 2: Check if tables exist
    console.log('📊 Checking database tables...');
    
    const tables = ['profiles', 'campaigns', 'campaign_applications', 'notifications', 'wallet_transactions'];
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': Accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': Error - ${err.message}`);
      }
    }

    console.log('\n🎉 Supabase connection test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. If tables are missing, run your database migrations');
    console.log('2. Test authentication by running: npm run dev');
    console.log('3. Check the browser console for any additional errors');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

// Run the test
testSupabaseConnection().catch(console.error);
