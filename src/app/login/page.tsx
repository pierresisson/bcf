'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { Alert } from '@/components/ui/alert';

type FormData = {
  email: string;
  password: string;
};

type FormAction = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [formAction, setFormAction] = useState<FormAction>('login');

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
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;
    },
    onSuccess: () => {
      router.push('/');
    },
    onError: (error) => {},
  });

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase.auth.signUp(data);
      if (error) throw error;
    },
    onSuccess: () => {
      router.push('/');
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
                    <input
                      type="email"
                      placeholder="Email"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    {field.state.meta.errors ? (
                      <span className="text-red-500">
                        {field.state.meta.errors}
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
                    <input
                      type="password"
                      placeholder="Password"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    {field.state.meta.errors ? (
                      <span className="text-red-500">
                        {field.state.meta.errors}
                      </span>
                    ) : null}
                  </>
                )}
              </form.Field>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                onClick={() => setFormAction('login')}
                className="px-4 py-2 bg-blue-500 text-white rounded"
                disabled={loginMutation.isPending || form.state.isSubmitting}
              >
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </button>
              <button
                type="submit"
                onClick={() => setFormAction('signup')}
                className="px-4 py-2 bg-green-500 text-white rounded"
                disabled={signupMutation.isPending || form.state.isSubmitting}
              >
                {signupMutation.isPending ? 'Signing up...' : 'Signup'}
              </button>
            </div>
          </form>
        )}
      </form.Subscribe>
    </div>
  );
}
