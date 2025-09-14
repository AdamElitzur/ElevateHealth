"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { User } from "@/lib/types";

const userSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  age: z.coerce.number().min(18, "You must be at least 18 years old"),
  email: z.string().email("Invalid email address"),
  health_goals: z.array(z.string()).optional(),
  medical_conditions: z.array(z.string()).optional(),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

export async function getProfile() {
  try {
    console.log('Starting getProfile function');
    const supabase = await createSupabaseServerClient();
    console.log('Supabase client created');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth user:', { user, authError });

    if (!user) {
      console.log('No authenticated user found');
      return { error: "User not authenticated" };
    }

    console.log('Fetching user data for ID:', user.id);
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Supabase error fetching profile:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return { error: `Failed to fetch user profile: ${error.message}` };
    }

    console.log('Successfully fetched user data:', userData);
    return { profile: userData };
  } catch (error: unknown) {
    const errorObj = error as Error;
    console.error("Unexpected error in getProfile:", {
      error: errorObj,
      name: errorObj?.name || 'Unknown',
      message: errorObj?.message || 'No error message',
      stack: errorObj?.stack || 'No stack trace',
    });
    return { error: `An unexpected error occurred: ${errorObj?.message || 'Unknown error'}` };
  }
}

export async function completeUserOnboarding(formData: UserFormData) {
  try {
    // Validate the form data
    const validation = userSchema.safeParse(formData);
    
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Invalid form data';
      return { error: errorMessage };
    }

    // Extract validated data
    const validatedData = validation.data;

    // Create Supabase client
    const supabase = await createSupabaseServerClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return { error: "User not authenticated" };
    }

    // Insert the user profile data into the profiles table
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      age: validatedData.age,
      email: validatedData.email,
      health_goals: validatedData.health_goals,
      medical_conditions: validatedData.medical_conditions,
      height: validatedData.height,
      weight: validatedData.weight,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Database error:', error);
      return { error: error.message };
    }

    // Revalidate the dashboard path
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error('Error in completeUserOnboarding:', error);
    return { error: 'An unexpected error occurred' };
  }
}
