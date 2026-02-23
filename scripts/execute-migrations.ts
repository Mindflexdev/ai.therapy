import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const SUPABASE_URL = 'https://tazrriepmnpqoutdxubt.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SERVICE_ROLE_KEY) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY not set');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function executeSql(filePath: string, description: string) {
    console.log(`\n--- ${description} ---`);
    
    try {
        const sqlContent = readFileSync(resolve(filePath), 'utf-8');
        
        // Execute SQL using the rpc exec function or as a query
        const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
        
        if (error) {
            // Try direct query approach
            console.log('Trying alternative approach...');
            
            // Execute using pg_query or similar
            const result = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'apikey': SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sql: sqlContent }),
            });
            
            if (!result.ok) {
                const errText = await result.text();
                // Fallback: try using the SQL editor API directly
                console.log('SQL Content (for manual execution if needed):');
                console.log('---');
                console.log(sqlContent);
                console.log('---');
                console.log(`Error: ${errText}`);
                return false;
            }
            
            console.log('Success!');
            return true;
        }
        
        console.log('Success!');
        return true;
    } catch (err) {
        console.error('Exception:', err);
        return false;
    }
}

async function main() {
    console.log('=== Supabase Migration Runner ===\n');
    
    // Execute agents schema
    const agentsSuccess = await executeSql(
        './supabase/agents-schema.sql', 
        'Executing agents table migration'
    );
    
    // Execute messages schema
    const messagesSuccess = await executeSql(
        './supabase/messages-schema.sql',
        'Executing messages table migration'
    );
    
    console.log('\n=== Migration Summary ===');
    console.log(`Agents table: ${agentsSuccess ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Messages table: ${messagesSuccess ? 'SUCCESS' : 'FAILED'}`);
    
    process.exit(agentsSuccess && messagesSuccess ? 0 : 1);
}

main();
