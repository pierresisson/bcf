import React from "react";
import OnboardingForm from "../../components/OnboardingForm";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <OnboardingForm />
    </div>
  );
}
