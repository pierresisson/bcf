import { memo } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "../lib/supabaseClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const userProfileSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  age: z
    .number()
    .min(18, "Vous devez avoir au moins 18 ans")
    .max(120, "Âge invalide"),
  occupation: z
    .string()
    .min(2, "L'occupation doit contenir au moins 2 caractères"),
  livingArrangement: z.enum(["Appartement", "Maison", "Colocation", "Autre"]),
  familyStatus: z.enum([
    "Célibataire",
    "En couple",
    "Marié(e)",
    "Avec enfants",
  ]),
  wakeUpTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide"),
  sleepTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide"),
  workHours: z.string(),
  dietPreference: z.enum(["Omnivore", "Végétarien", "Végétalien", "Autre"]),
  hobbies: z.string(),
  sportsActivities: z.array(z.string()),
  healthGoal: z.string(),
  careerGoal: z.string(),
  personalGoal: z.string(),
});

type UserProfile = z.infer<typeof userProfileSchema>;

export default function OnboardingForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: UserProfile) => {
      const { data: result, error } = await supabase
        .from("user_profiles")
        .upsert({
          ...data,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      // Redirection ou notification de succès ici
    },
  });

  const form = useForm<UserProfile>({
    defaultValues: {
      name: "",
      age: 18,
      occupation: "",
      livingArrangement: "Appartement",
      familyStatus: "Célibataire",
      wakeUpTime: "",
      sleepTime: "",
      workHours: "",
      dietPreference: "Omnivore",
      hobbies: "",
      sportsActivities: [],
      healthGoal: "",
      careerGoal: "",
      personalGoal: "",
    },
    onSubmit: async (values) => {
      const validatedData = userProfileSchema.parse(values);
      mutation.mutate(validatedData);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit();
  };

  return (
    <FormProvider form={form}>
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold mb-4">Profil Utilisateur</h2>
        {mutation.isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Une erreur est survenue. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        )}
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nom complet
          </label>
          <input
            {...form.getFieldProps("name")}
            type="text"
            id="name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          {form.getFieldError("name") && (
            <p className="mt-1 text-sm text-red-600">
              {form.getFieldError("name")}
            </p>
          )}
        </div>
        {/* Répétez ce pattern pour les autres champs */}
        <Button type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? "Enregistrement..." : "Enregistrer le profil"}
        </Button>
      </form>
    </FormProvider>
  );
}
