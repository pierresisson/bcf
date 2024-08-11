import React from 'react';
import ProfileForm from '../../components/ProfileForm';

export default function Profile() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <ProfileForm />
    </div>
  );
}
