import { Metadata } from "next";
import { TectonicOnboardingView } from "@/components/auth/TectonicOnboardingView";

export const metadata: Metadata = {
  title: "Register // Scholar Provisioning Terminal — MyPath",
  description: "Cryptographic Scholar Registration and Provisioning Terminal for MyPath.",
};

export default function RegisterPage() {
  return <TectonicOnboardingView />;
}
