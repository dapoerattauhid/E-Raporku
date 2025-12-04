#!/usr/bin/env node
/**
 * Script untuk menjalankan SQL migration ke Supabase
 * Usage: node run_migration.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...rest] = line.split('=');
      const value = rest.join('=').replace(/^"|"$/g, '');
      env[key] = value;
    }
  });
  
  return env;
}

// Execute SQL via Supabase REST API
async function executeSql(url, apiKey, sql) {
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`\n📊 Total ${statements.length} SQL statements akan dijalankan\n`);
  console.log('⚠️  REST API tidak mendukung DDL statements langsung.');
  console.log('📋 Silakan copy-paste SQL berikut ke Supabase SQL Editor:\n');
  console.log('='.repeat(80));
  console.log(sql);
  console.log('='.repeat(80));
  console.log('\n📍 Langkah:');
  console.log('1. Buka https://app.supabase.com');
  console.log('2. Pilih project rapor-cepat');
  console.log('3. Buka SQL Editor');
  console.log('4. Buat query baru dan paste SQL di atas');
  console.log('5. Klik tombol RUN');
}

async function main() {
  try {
    const env = loadEnv();
    
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const apiKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!supabaseUrl || !apiKey) {
      console.error('❌ Error: Environment variables tidak ditemukan di .env');
      process.exit(1);
    }
    
    console.log('🔗 Supabase Configuration:');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Key: ${apiKey.substring(0, 20)}...`);
    
    const sqlFile = path.join(__dirname, 'supabase/migrations/20251203084341_add_ekstrakurikuler_and_prestasi.sql');
    
    if (!fs.existsSync(sqlFile)) {
      console.error(`❌ Error: File ${sqlFile} tidak ditemukan`);
      process.exit(1);
    }
    
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    console.log(`\n📝 SQL file ditemukan (${sql.length} bytes)\n`);
    
    await executeSql(supabaseUrl, apiKey, sql);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
