"use client";

import { useState } from "react";
import { createUserProfile } from "../actions/user-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/image-upload";

export default function OnboardingForm() {
  const router = useRouter();
  const [gender, setGender] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const handleImageUploaded = (url: string) => {
    setPhotoUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!gender || !age) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create form data
      const formData = new FormData();
      formData.append("gender", gender);
      formData.append("age", age);
      if (photoUrl) {
        formData.append("photo_url", photoUrl);
      }

      // Submit profile data
      const response = await createUserProfile(formData);

      if (response?.error) {
        setError(
          typeof response.error === "string"
            ? response.error
            : Object.values(response.error).flat().join(", ")
        );
      } else if (response?.success) {
        // Force a page refresh to ensure the latest data is loaded
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <Label className="text-center">Profile Photo</Label>
          <ImageUpload
            onImageUploaded={handleImageUploaded}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground text-center">
            This photo will be used to calculate your biological age
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select value={gender} onValueChange={setGender} required>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min="18"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Your age"
            required
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Start My Challenge"}
      </Button>
    </form>
  );
}
