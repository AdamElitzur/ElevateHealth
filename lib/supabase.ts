// This is a bridge file that re-exports from the appropriate client/server files
// to maintain backward compatibility with existing imports

// Re-export from server file
export { createSupabaseServerClient } from './supabase-server'

// Re-export from client file
export { createSupabaseBrowserClient } from './supabase-client'
