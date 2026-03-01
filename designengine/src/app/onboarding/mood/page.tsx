'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingMoodRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/design-language');
  }, [router]);

  return null;
}
