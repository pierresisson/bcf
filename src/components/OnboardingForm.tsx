import { memo } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "../lib/supabaseClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

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
          onChange: ({ value }) => {
            if (typeof value !== "string")
              return "Le nom doit être une chaîne de caractères";
            if (value.length < 2)
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
          onChange: ({ value }) => {
            if (typeof value !== "number") return "L'âge doit être un nombre";
            if (value < 18) return "Vous devez avoir au moins 18 ans";
            if (value > 120) return "Âge invalide";
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

      {/* Ajoutez les champs restants de la même manière */}

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
