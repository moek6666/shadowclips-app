import { createClient } from '@supabase/supabase-js'

// Ganti nilai ini dengan Project URL dan Anon Key dari dashboard Supabase Anda (Project Settings -> API)
const supabaseUrl = 'https://nmeaifqvxgyzvwavijhb.supabase.co/rest/v1/'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZWFpZnF2eGd5enZ3YXZpamhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzExODQsImV4cCI6MjA4NTk0NzE4NH0.tIzCj1YovFtHtb9LKIj_etp734BIk2vsqHUT3wB-54k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)