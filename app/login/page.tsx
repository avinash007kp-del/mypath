import { Metadata } from "next";
import { TectonicOnboardingView } from "@/components/auth/TectonicOnboardingView";

export const metadata: Metadata = {
  title: "Gateway // Scholar Authentication Terminal — MyPath",
  description: "Secure Zero-Knowledge Scholar Authentication Gateway for MyPath.",
};

export default function LoginPage() {
  return <TectonicOnboardingView />;
}
