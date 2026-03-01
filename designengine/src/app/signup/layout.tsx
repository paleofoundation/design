import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create an account — dzyne',
  description: 'Sign up for dzyne — free during beta. Generate design systems your AI coding tools will actually follow.',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
