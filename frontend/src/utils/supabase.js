import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wauazxmiulazexlnaqqu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdWF6eG1pdWxhemV4bG5hcXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NjM3NTAsImV4cCI6MjA3ODMzOTc1MH0.aZVlmjvL928vin636-a10I_mzUwBmfp3gTMir-jTJqc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);