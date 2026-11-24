import { Metadata } from "next";
import { TectonicOnboardingView } from "@/components/auth/TectonicOnboardingView";

export const metadata: Metadata = {
  title: "Onboarding // Scholar Registration Terminal — MyPath",
  description: "Autonomous Onboarding Blueprint & Scholar Registration Terminal for MyPath.",
};

export default function OnboardingPage() {
  return <TectonicOnboardingView />;
}
