import { Button } from '@/components/ui/button';
import { login, signup } from './actions';

export default function LoginPage() {
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <div className="inline-flex flex-col gap-4">
        <Button formAction={login}>Log in</Button>
        <Button formAction={signup}>Sign up</Button>
      </div>
    </form>
  );
}
