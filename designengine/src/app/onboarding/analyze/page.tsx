'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '../store';

export default function OnboardingAnalyzeRedirect() {
  const router = useRouter();
  const intent = useOnboardingStore((s) => s.intent);

  useEffect(() => {
    if (intent === 'refresh') {
      router.replace('/onboarding/refresh');
    } else {
      router.replace('/onboarding');
    }
  }, [router, intent]);

  return null;
}
