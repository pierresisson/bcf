import React from 'react';
import ProfileForm from '../../components/ProfileForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Profile() {
  return (
    <div className="container mx-auto p-4">
      <Link href="/" passHref>
        <Button variant="link">
          <ChevronLeft className="h-4 w-4" />
          Go to dashboard
        </Button>
      </Link>
      <ProfileForm />
    </div>
  );
}
