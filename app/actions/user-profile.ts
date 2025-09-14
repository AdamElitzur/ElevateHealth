"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { UserProfile } from "@/lib/types";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const userProfileSchema = z.object({
  gender: z.enum(["male", "female", "other"]),
  age: z.coerce.number().min(18, "You must be at least 18 years old"),
  // Added weight field from the database schema
  weight: z.coerce.number().optional(),
});

export async function createUserProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      error: {
        message: "You must be logged in to create a profile",
      },
    };
  }

  const gender = formData.get("gender") as string;
  const age = Number(formData.get("age"));
  const weightValue = formData.get("weight");
  const weight = weightValue ? Number(weightValue) : undefined;

  const validatedFields = userProfileSchema.safeParse({
    gender,
    age,
    weight,
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { data: existingProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (existingProfile) {
    // Create an update object with only fields that exist in the users table
    const updateData: Record<string, any> = { gender, age };
    if (weight !== undefined) {
      updateData.weight = weight;
    }

    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", session.user.id);

    if (error) {
      return {
        error: {
          message: error.message,
        },
      };
    }
    // No need for additional upsert since we're already updating the users table directly
  } else {
    // Create an insert object with only fields that exist in the users table
    const insertData: Record<string, any> = {
      id: session.user.id,
      gender,
      age,
    };

    if (weight !== undefined) {
      insertData.weight = weight;
    }

    // photo_url is not stored in the users table

    const { error } = await supabase.from("users").insert(insertData);

    if (error) {
      return {
        error: {
          message: error.message,
        },
      };
    }
    // No need for additional upsert since we're already inserting directly into the users table
  }

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");

  return {
    success: true,
    message: "Profile created successfully",
  };
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  // First, let's try to get just the id to see if the user exists
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("id", session.user.id)
    .single();

  console.log("getUserProfile - session.user.id:", session.user.id);
  console.log("getUserProfile - userData:");
  console.log("getUserProfile - userError:", userError);

  if (userError) {
    console.error("Error fetching user:", userError);
    return null;
  }

  if (!userData) {
    console.log("No user found in database");
    return null;
  }

  // Now try to get all columns
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  console.log("getUserProfile - full data:", data);
  console.log("getUserProfile - full error:", error);

  if (error) {
    console.error("Error fetching full user profile:", error);
    // Return a basic profile with just the id if we can't get the full data
    return {
      id: session.user.id,
      created_at: new Date().toISOString(),
      gender: null,
      age: null,
      weight: null,
    };
  }

  return data;
}

export async function uploadProfilePhoto(file: File) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      error: {
        message: "You must be logged in to upload a photo",
      },
    };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

  const { error: uploadError, data } = await supabase.storage
    .from("photos")
    .upload(fileName, file);

  if (uploadError) {
    return {
      error: {
        message: uploadError.message,
      },
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("photos").getPublicUrl(fileName);

  return {
    success: true,
    url: publicUrl,
  };
}
