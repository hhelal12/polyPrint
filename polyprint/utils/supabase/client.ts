import { createBrowserClient } from "@supabase/ssr";
import { Database } from '@/types/database.types' // Import your new file

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;


export function createClient() {
  return createBrowserClient<Database>( 
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}