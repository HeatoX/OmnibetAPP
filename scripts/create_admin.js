const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load Environment Variables from .env
const envPath = path.resolve(__dirname, '../.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
const env = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const COMPAT_KEY = env['SUPABASE_SERVICE_ROLE_KEY']; // Fix for potential key name mismatch

if (!SUPABASE_URL || !COMPAT_KEY) {
    console.error('❌ Error: Missing Supabase credentials in .env');
    console.log('URL:', SUPABASE_URL);
    console.log('KEY:', COMPAT_KEY ? '******' : 'Missing');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, COMPAT_KEY);

async function createAdminUser() {
    console.log('🚀 Attempting to create/update Admin user...');

    const email = 'admin@omnibet.ai';
    const password = 'admin123'; // Default strong password

    // 1. Check if user exists
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('❌ Error listing users:', listError.message);
        return;
    }

    const existingUser = listData.users.find(u => u.email === email);

    if (existingUser) {
        console.log(`ℹ️ User ${email} already exists. Updating password...`);
        const { data, error } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: password, email_confirm: true, user_metadata: { full_name: 'Admin User' } }
        );

        if (error) {
            console.error('❌ Error updating password:', error.message);
        } else {
            console.log('✅ Password updated successfully!');
            console.log('🆔 User ID:', data.user.id);
        }
    } else {
        console.log(`🆕 Creating new user ${email}...`);
        const { data, error } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { full_name: 'Admin User' }
        });

        if (error) {
            console.error('❌ Error creating user:', error.message);
        } else {
            console.log('✅ User created successfully!');
            console.log('🆔 User ID:', data.user.id);
        }
    }
}

createAdminUser();
