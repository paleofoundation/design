import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log in — dzyne',
  description: 'Sign in to your dzyne account to manage design profiles, API keys, and the tool playground.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
