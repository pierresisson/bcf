'use client';

import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

export default function ProfileForm() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
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
  });

  const mutation = useMutation({
    mutationFn: async (data: UserProfile) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) {
        throw new Error('User not authenticated');
      }

      const formattedData = {
        user_id: user.user.id,
        ...data,
        living_arrangement: data.livingArrangement,
        family_status: data.familyStatus,
        wake_up_time: data.wakeUpTime,
        sleep_time: data.sleepTime,
        work_hours: data.workHours,
        diet_preference: data.dietPreference,
        sports_activities: data.sportsActivities,
        health_goal: data.healthGoal,
        career_goal: data.careerGoal,
        personal_goal: data.personalGoal,
      };

      const { data: result, error } = await supabase
        .from('user_profiles')
        .upsert(formattedData, { onConflict: 'user_id' })
        .select();

      if (error) throw error;

      if (!result || result.length === 0) {
        throw new Error('No data returned from Supabase');
      }

      return result[0];
    },
    onSuccess: () => {
      console.log('Profile saved successfully');
    },
    onError: (error) => {
      console.error('Error saving profile:', error);
    },
  });

  const onSubmit = (data: UserProfile) => {
    console.log(data);
    console.log(supabase.auth.getUser);
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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

      {mutation.isSuccess && (
        <Alert>
          <AlertDescription>Profil enregistré avec succès!</AlertDescription>
        </Alert>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nom complet
        </label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input {...field} id="name" placeholder="Votre nom complet" />
          )}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="age"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Âge
        </label>
        <Controller
          name="age"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="age"
              type="number"
              min={18}
              max={120}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />
        {errors.age && (
          <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
        )}
      </div>

      {/* Add similar Controller components for other fields */}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Activités sportives
        </label>
        <div className="space-y-2">
          {['Running', 'Yoga', 'Musculation', 'Natation', 'Autre'].map(
            (activity) => (
              <div key={activity} className="flex items-center">
                <Controller
                  name="sportsActivities"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id={activity.toLowerCase()}
                      checked={field.value.includes(activity)}
                      onCheckedChange={(checked) => {
                        const updatedActivities = checked
                          ? [...field.value, activity]
                          : field.value.filter((a) => a !== activity);
                        field.onChange(updatedActivities);
                      }}
                    />
                  )}
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

      <Button
        type="submit"
        disabled={mutation.isPending || isSubmitting}
        className="w-full"
      >
        {mutation.isPending ? 'Enregistrement...' : 'Enregistrer le profil'}
      </Button>
    </form>
  );
}
