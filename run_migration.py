#!/usr/bin/env python3
"""
Script untuk menjalankan migration SQL ke Supabase
"""
import os
import sys
import requests
import json

# Baca environment variables dari .env
def load_env():
    env_vars = {}
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    env_vars[key] = value.strip('"')
    return env_vars

# Baca SQL file
def read_sql_file(filename):
    with open(filename, 'r') as f:
        return f.read()

# Jalankan SQL
def execute_sql(supabase_url, api_key, sql):
    """Jalankan SQL menggunakan Supabase REST API"""
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    # Split SQL into individual statements
    statements = [s.strip() for s in sql.split(';') if s.strip()]
    
    print(f"Total {len(statements)} SQL statements akan dijalankan")
    
    for i, statement in enumerate(statements, 1):
        print(f"\n[{i}/{len(statements)}] Menjalankan statement...")
        print(f"Query: {statement[:80]}...")
        
        try:
            # Gunakan endpoint rpc untuk menjalankan custom SQL
            response = requests.post(
                f'{supabase_url}/rest/v1/rpc/execute_sql',
                headers=headers,
                json={'query': statement}
            )
            
            if response.status_code in [200, 201]:
                print(f"✓ Berhasil")
            else:
                print(f"✗ Error: {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"✗ Exception: {str(e)}")

def main():
    env = load_env()
    
    supabase_url = env.get('VITE_SUPABASE_URL')
    api_key = env.get('VITE_SUPABASE_PUBLISHABLE_KEY')
    
    if not supabase_url or not api_key:
        print("❌ Error: VITE_SUPABASE_URL atau VITE_SUPABASE_PUBLISHABLE_KEY tidak ditemukan di .env")
        sys.exit(1)
    
    print(f"🔗 Supabase URL: {supabase_url}")
    print(f"🔑 API Key: {api_key[:20]}...")
    
    sql_file = 'supabase/migrations/20251203084341_add_ekstrakurikuler_and_prestasi.sql'
    
    if not os.path.exists(sql_file):
        print(f"❌ Error: File {sql_file} tidak ditemukan")
        sys.exit(1)
    
    sql = read_sql_file(sql_file)
    print(f"\n📝 SQL file ditemukan ({len(sql)} bytes)")
    
    execute_sql(supabase_url, api_key, sql)
    
    print("\n✅ Migration selesai!")

if __name__ == '__main__':
    main()
