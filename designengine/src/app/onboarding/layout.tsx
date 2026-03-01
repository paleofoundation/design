import type { Metadata } from 'next';
import OnboardingShell from './onboarding-shell';

export const metadata: Metadata = {
  title: 'Design Interview — dzyne',
  description:
    'Tell dzyne about your brand, choose colors, fonts, and a design language. Walk away with a complete design system your AI coding tools can enforce.',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingShell>{children}</OnboardingShell>;
}
