'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-surface)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)',
    }}>
      <Link href="/" style={{
        fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
        fontSize: 'var(--text-2xl)',
        fontWeight: 700,
        color: 'var(--color-green-deep)',
        textDecoration: 'none',
        marginBottom: 'var(--space-8)',
      }}>
        dzyne
      </Link>

      <div style={{
        width: '100%',
        maxWidth: '24rem',
        background: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-md)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
          fontSize: 'var(--text-xl)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-0-5)',
        }}>
          Sign in
        </h1>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-4)',
        }}>
          Welcome back to dzyne.
        </p>

        {error && (
          <div style={{
            background: 'rgba(220,53,69,0.08)',
            border: '1px solid rgba(220,53,69,0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-1) var(--space-2)',
            marginBottom: 'var(--space-3)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-error)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.625rem var(--space-2)',
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'var(--color-surface)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.625rem var(--space-2)',
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--color-orange)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 'var(--text-base)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontFamily: 'inherit',
              marginTop: 'var(--space-1)',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          marginTop: 'var(--space-4)',
        }}>
          Don&rsquo;t have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--color-green-deep)', fontWeight: 500 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
