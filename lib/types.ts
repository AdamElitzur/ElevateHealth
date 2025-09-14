export type UserProfile = {
  id: string;
  email: string;
  created_at: string;
  gender: 'male' | 'female' | 'other' | null;
  age: number | null;
  photo_url: string | null;
  biological_age: number | null;
  challenge_start_date: string | null;
}

export type DailyLog = {
  id: string;
  user_id: string;
  date: string;
  sugar_intake_grams: number;
  weight_kg: number | null;
  mood_rating: number | null; // 1-10
  cravings_rating: number | null; // 1-10
  energy_rating: number | null; // 1-10
  sleep_rating: number | null; // 1-10
  notes: string | null;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      daily_logs: {
        Row: DailyLog;
        Insert: Omit<DailyLog, 'id' | 'created_at'>;
        Update: Partial<Omit<DailyLog, 'id' | 'created_at'>>;
      };
    };
  };
};
