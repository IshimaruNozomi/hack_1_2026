import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tstdfwxhcyromjyvbhbc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzdGRmd3hoY3lyb21qeXZiaGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5NzIzNjYsImV4cCI6MjA5MzU0ODM2Nn0.WYe8pqcSZDPjTWg-8vbDnUOphSQtwbowbpeQyIdNHzM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)