import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from '@tanstack/react-form';
import { supabase } from '../lib/supabaseClient';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const userProfileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  age: z
    .number()
    .min(18, 'Vous devez avoir au moins 18 ans')
    .max(120, 'Âge invalide'),
  occupation: z
    .string()
    .min(2, "L'occupation doit contenir au moins 2 caractères"),
  livingArrangement: z.enum(['Appartement', 'Maison', 'Colocation', 'Autre']),
  familyStatus: z.enum([
    'Célibataire',
    'En couple',
    'Marié(e)',
    'Avec enfants',
  ]),
  wakeUpTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide"),
  sleepTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide"),
  workHours: z.string(),
  dietPreference: z.enum(['Omnivore', 'Végétarien', 'Végétalien', 'Autre']),
  hobbies: z.string(),
  sportsActivities: z.array(z.string()),
  healthGoal: z.string(),
  careerGoal: z.string(),
  personalGoal: z.string(),
});

type UserProfile = z.infer<typeof userProfileSchema>;

export default function OnboardingForm() {
  const mutation = useMutation<UserProfile[], Error, UserProfile>({
    mutationFn: async (data: UserProfile) => {
      const { data: result, error } = await supabase
        .from<UserProfile>('user_profiles')
        .upsert({
          ...data,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      if (!result) {
        throw new Error('No data returned from Supabase');
      }

      return result[0];
    },
    onSuccess: () => {
      // Handle success (e.g., redirect or show notification)
    },
  });

  const form = useForm<UserProfile>({
    defaultValues: {
      name: '',
      age: 18,
      occupation: '',
      livingArrangement: 'Appartement',
      familyStatus: 'Célibataire',
      wakeUpTime: '',
      sleepTime: '',
      workHours: '',
      dietPreference: 'Omnivore',
      hobbies: '',
      sportsActivities: [],
      healthGoal: '',
      careerGoal: '',
      personalGoal: '',
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
            if (typeof field.value !== 'string')
              return 'Le nom doit être une chaîne de caractères';
            if (field.value.length < 2)
              return 'Le nom doit contenir au moins 2 caractères';
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
                {field.state.meta.errors.join(', ')}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field
        name="age"
        validators={{
          onChange: (field) => {
            if (typeof field.value !== 'number')
              return "L'âge doit être un nombre";
            if (field.value < 18) return 'Vous devez avoir au moins 18 ans';
            if (field.value > 120) return 'Âge invalide';
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
                {field.state.meta.errors.join(', ')}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field
        name="occupation"
        validators={{
          onChange: (field) => {
            if (typeof field.value !== 'string')
              return "L'occupation doit être une chaîne de caractères";
            if (field.value.length < 2)
              return "L'occupation doit contenir au moins 2 caractères";
          },
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor="occupation"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Occupation
            </label>
            <Input
              id="occupation"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Votre occupation"
            />
            {field.state.meta.errors ? (
              <p className="mt-1 text-sm text-red-600">
                {field.state.meta.errors.join(', ')}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field name="livingArrangement">
        {(field) => (
          <div>
            <label
              htmlFor="livingArrangement"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Arrangement de vie
            </label>
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisissez votre arrangement de vie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Appartement">Appartement</SelectItem>
                <SelectItem value="Maison">Maison</SelectItem>
                <SelectItem value="Colocation">Colocation</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <form.Field name="familyStatus">
        {(field) => (
          <div>
            <label
              htmlFor="familyStatus"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Statut familial
            </label>
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisissez votre statut familial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Célibataire">Célibataire</SelectItem>
                <SelectItem value="En couple">En couple</SelectItem>
                <SelectItem value="Marié(e)">Marié(e)</SelectItem>
                <SelectItem value="Avec enfants">Avec enfants</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <form.Field
        name="wakeUpTime"
        validators={{
          onChange: (field) => {
            if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(field.value))
              return "Format d'heure invalide";
          },
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor="wakeUpTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Heure de réveil
            </label>
            <Input
              id="wakeUpTime"
              type="time"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors ? (
              <p className="mt-1 text-sm text-red-600">
                {field.state.meta.errors.join(', ')}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field
        name="sleepTime"
        validators={{
          onChange: (field) => {
            if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(field.value))
              return "Format d'heure invalide";
          },
        }}
      >
        {(field) => (
          <div>
            <label
              htmlFor="sleepTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Heure de coucher
            </label>
            <Input
              id="sleepTime"
              type="time"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors ? (
              <p className="mt-1 text-sm text-red-600">
                {field.state.meta.errors.join(', ')}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field name="workHours">
        {(field) => (
          <div>
            <label
              htmlFor="workHours"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Heures de travail
            </label>
            <Input
              id="workHours"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ex: 9h-17h"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="dietPreference">
        {(field) => (
          <div>
            <label
              htmlFor="dietPreference"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Préférence alimentaire
            </label>
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisissez votre préférence alimentaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Omnivore">Omnivore</SelectItem>
                <SelectItem value="Végétarien">Végétarien</SelectItem>
                <SelectItem value="Végétalien">Végétalien</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <form.Field name="hobbies">
        {(field) => (
          <div>
            <label
              htmlFor="hobbies"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Loisirs
            </label>
            <Textarea
              id="hobbies"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Décrivez vos loisirs"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="sportsActivities">
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activités sportives
            </label>
            <div className="space-y-2">
              {['Running', 'Yoga', 'Musculation', 'Natation', 'Autre'].map(
                (activity) => (
                  <div key={activity} className="flex items-center">
                    <Checkbox
                      id={activity.toLowerCase()}
                      checked={field.state.value.includes(activity)}
                      onCheckedChange={(checked) => {
                        const updatedActivities = checked
                          ? [...field.state.value, activity]
                          : field.state.value.filter((a) => a !== activity);
                        field.handleChange(updatedActivities);
                      }}
                    />
                    <label
                      htmlFor={activity.toLowerCase()}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {activity}
                    </label>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </form.Field>

      <form.Field name="healthGoal">
        {(field) => (
          <div>
            <label
              htmlFor="healthGoal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Objectif de santé
            </label>
            <Textarea
              id="healthGoal"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Décrivez votre objectif de santé"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="careerGoal">
        {(field) => (
          <div>
            <label
              htmlFor="careerGoal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Objectif de carrière
            </label>
            <Textarea
              id="careerGoal"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Décrivez votre objectif de carrière"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="personalGoal">
        {(field) => (
          <div>
            <label
              htmlFor="personalGoal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Objectif personnel
            </label>
            <Textarea
              id="personalGoal"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Décrivez votre objectif personnel"
            />
          </div>
        )}
      </form.Field>

      <Button
        type="submit"
        disabled={mutation.isPending || form.state.isSubmitting}
        className="w-full"
      >
        {mutation.isPending ? 'Enregistrement...' : 'Enregistrer le profil'}
      </Button>
    </form>
  );
}
