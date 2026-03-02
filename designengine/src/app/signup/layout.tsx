import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create an account — Refine Design',
  description: 'Sign up for Refine Design — free during beta. Generate design systems your AI coding tools will actually follow.',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
