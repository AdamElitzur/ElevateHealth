"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = signUpSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      error: {
        message: error.message,
      },
    };
  }

  // Ensure a row exists in public.users (FK to auth.users)
  if (data?.user?.id) {
    await supabase
      .from("users")
      .upsert({ id: data.user.id }, { onConflict: "id" });
  }

  return {
    success: true,
    message: "Please check your email to confirm your account",
  };
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = signInSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: {
        message: error.message,
      },
    };
  }
  // Ensure a row exists in public.users (FK to auth.users)
  if (data?.user?.id) {
    await supabase
      .from("users")
      .upsert({ id: data.user.id }, { onConflict: "id" });
  }

  // Return success response; client handles navigation
  return {
    success: true,
    user: data?.user,
  };
}

// Passwordless: send a Magic Link to the user's email
export async function sendMagicLink(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) {
    return { error: "Email is required" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  // Redirect to home on sign out
  redirect("/");
}

export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
