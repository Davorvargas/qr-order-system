const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createAdminUser() {
  const email = 'admin@restaurant.local';
  const password = 'admin123';
  
  console.log('Creating admin user with email:', email);
  
  // Create user with email confirmation disabled
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true
  });
  
  if (authError) {
    console.log('Auth error:', authError.message);
    return;
  }
  
  console.log('User created successfully:', authData.user.id);
  
  // Create profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      role: 'admin',
      restaurant_id: 'd4503f1b-9fc5-48aa-ada6-354775e57a67',
      full_name: 'Admin User'
    });
  
  if (profileError) {
    console.log('Profile error:', profileError.message);
  } else {
    console.log('Profile created successfully');
  }
  
  console.log(`\n✅ Admin user created successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Login at: http://localhost:3006/login`);
}

createAdminUser().catch(console.error);