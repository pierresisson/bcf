"use client";

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { supabase } from "../lib/supabaseClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const userProfileSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  age: z
    .number()
    .int()
    .min(18, "Vous devez avoir au moins 18 ans")
    .max(120, "Âge invalide"),
  occupation: z
    .string()
    .min(2, "L'occupation doit contenir au moins 2 caractères"),
  living_arrangement: z.enum(["Appartement", "Maison", "Colocation", "Autre"]),
  family_status: z.enum([
    "Célibataire",
    "En couple",
    "Marié(e)",
    "Avec enfants",
  ]),
  wake_up_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide"),
  sleep_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide"),
  work_hours: z.string(),
  diet_preference: z.enum(["Omnivore", "Végétarien", "Végétalien", "Autre"]),
  hobbies: z.string(),
  sports_activities: z.array(z.string()),
  health_goal: z.string(),
  career_goal: z.string(),
  personal_goal: z.string(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

type UserProfile = z.infer<typeof userProfileSchema>;

export default function OnboardingForm() {
  const mutation = useMutation({
    mutationFn: async (data: UserProfile) => {
      const { data: result, error } = await supabase
        .from("user_profiles")
        .upsert({
          ...data,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (!result) {
        throw new Error("No data returned from Supabase");
      }

      return result as UserProfile;
    },
    onSuccess: () => {
      // Handle success (e.g., redirect or show notification)
    },
  });

  const form = useForm<UserProfile>({
    defaultValues: {
      name: "",
      age: 18,
      occupation: "",
      living_arrangement: "Appartement",
      family_status: "Célibataire",
      wake_up_time: "",
      sleep_time: "",
      work_hours: "",
      diet_preference: "Omnivore",
      hobbies: "",
      sports_activities: [],
      health_goal: "",
      career_goal: "",
      personal_goal: "",
    },
    onSubmit: async (values) => {
      const validatedData = userProfileSchema.parse(values);
      mutation.mutate(validatedData);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6"
    >
      <h2 className="text-2xl font-bold mb-4">Profil Utilisateur</h2>

      {mutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Une erreur est survenue. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      )}

      <form.Field
        name="name"
        validators={{
          onChange: (field) => {
            if (typeof field.value !== "string")
              return "Le nom doit être une chaîne de caractères";
            if (field.value.length < 2)
              return "Le nom doit contenir au moins 2 caractères";
          },
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom complet
            </label>
            <Input
              id="name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Votre nom complet"
            />
            {field.state.meta.errors ? (
              <p className="mt-1 text-sm text-red-600">
                {field.state.meta.errors.join(", ")}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field
        name="age"
        validators={{
          onChange: (field) => {
            if (typeof field.value !== "number")
              return "L'âge doit être un nombre";
            if (field.value < 18) return "Vous devez avoir au moins 18 ans";
            if (field.value > 120) return "Âge invalide";
          },
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Âge
            </label>
            <Input
              id="age"
              type="number"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) =>
                field.handleChange(Number(event.target.value))
              }
              min={18}
              max={120}
            />
            {field.state.meta.errors ? (
              <p className="mt-1 text-sm text-red-600">
                {field.state.meta.errors.join(", ")}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <Button
        type="submit"
        disabled={mutation.isPending || form.state.isSubmitting}
        className="w-full"
      >
        {mutation.isPending ? "Enregistrement..." : "Enregistrer le profil"}
      </Button>
    </form>
  );
}
