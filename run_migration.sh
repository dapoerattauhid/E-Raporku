#!/bin/bash
# Script untuk menjalankan SQL migration ke Supabase menggunakan curl

# Load environment variables
export $(cat .env | grep -v '#' | xargs)

echo "🔗 Connecting to Supabase..."
echo "URL: $VITE_SUPABASE_URL"

# Baca SQL file dan escape untuk JSON
SQL_CONTENT=$(cat supabase/migrations/20251203084341_add_ekstrakurikuler_and_prestasi.sql)

# Split by semicolon dan jalankan setiap statement
IFS=';' read -ra STATEMENTS <<< "$SQL_CONTENT"

count=0
for statement in "${STATEMENTS[@]}"; do
    # Trim whitespace
    statement=$(echo "$statement" | xargs)
    
    if [ -z "$statement" ]; then
        continue
    fi
    
    count=$((count + 1))
    echo ""
    echo "[$count] Executing SQL statement..."
    echo "Preview: ${statement:0:80}..."
    
    # Escape quotes untuk JSON
    json_query=$(echo "$statement" | sed 's/"/\\"/g')
    
    # Jalankan via Supabase REST API (menggunakan rpc call)
    # Catatan: Ini memerlukan function execute_sql di Supabase
    # Alternatif: gunakan SQL Editor langsung di Supabase Console
done

echo ""
echo "⚠️  Perhatian: Script ini memerlukan custom function di Supabase"
echo "📋 Silakan copy-paste SQL berikut ke Supabase SQL Editor dan jalankan:"
echo ""
cat supabase/migrations/20251203084341_add_ekstrakurikuler_and_prestasi.sql
