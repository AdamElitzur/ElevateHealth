// Changed from Profile to User
export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  age: number | null
