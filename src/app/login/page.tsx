'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' }),
});

type FormData = z.infer<typeof formSchema>;

type FormAction = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [formAction, setFormAction] = useState<FormAction>('login');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  useEffect(() => {
    // Check if the user is already logged in
    const checkUserSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsLoggedIn(true);
      }
    };

    checkUserSession();
  }, []);

  const form = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      if (formAction === 'login') {
        loginMutation.mutate(value);
      } else {
        signupMutation.mutate(value);
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { data: signInData, error } =
        await supabase.auth.signInWithPassword(data);
      if (error) throw error;

      return signInData.user?.id;
    },
    onSuccess: async (userId) => {
      if (userId) {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (profileData) {
          setShowDialog(true);
        } else {
          router.push(`/profile?userId=${userId}`);
        }
      } else {
        console.error('User ID not found after login');
        router.push('/');
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { data: signUpData, error } = await supabase.auth.signUp(data);
      if (error) throw error;
      return signUpData.user?.id;
    },
    onSuccess: async (userId) => {
      if (userId) {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            name: '',
            age: null,
          });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          router.push('/');
          return;
        }

        router.push(`/profile?userId=${userId}`);
      } else {
        console.error('User ID not found after signup');
        router.push('/');
      }
    },
    onError: (error) => {
      console.error('Signup error:', error);
    },
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Login</h1>

      <form.Subscribe>
        {() => (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <div className="mb-4">
              <form.Field name="email">
                {(field) => (
                  <>
                    <Input
                      type="email"
                      placeholder="Email"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors ? (
                      <span className="text-red-500">
                        {field.state.meta.errors.join(', ')}
                      </span>
                    ) : null}
                  </>
                )}
              </form.Field>
            </div>
            <div className="mb-4">
              <form.Field name="password">
                {(field) => (
                  <>
                    <Input
                      type="password"
                      placeholder="Password"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors ? (
                      <span className="text-red-500">
                        {field.state.meta.errors.join(', ')}
                      </span>
                    ) : null}
                  </>
                )}
              </form.Field>
            </div>
            <div className="flex space-x-2">
              <Button
                type="submit"
                onClick={() => setFormAction('login')}
                disabled={loginMutation.isPending || form.state.isSubmitting}
              >
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </Button>
              <Button
                variant="outline"
                type="submit"
                onClick={() => setFormAction('signup')}
                disabled={signupMutation.isPending || form.state.isSubmitting}
              >
                {signupMutation.isPending ? 'Signing up...' : 'Signup'}
              </Button>
            </div>
          </form>
        )}
      </form.Subscribe>

      {showDialog && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Already Logged In</DialogTitle>
              <DialogDescription>
                You are already logged in. Do you want to go to your profile
                page?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => router.push(`/profile`)}>
                Go to Profile
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  supabase.auth.signOut().then(() => setIsLoggedIn(false))
                }
              >
                Logout
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
