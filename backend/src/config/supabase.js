const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const adminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const anonClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = { adminClient, anonClient };
