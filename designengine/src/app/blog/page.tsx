import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-1)',
        lineHeight: 'var(--leading-tight)',
      }}>
        Blog
      </h1>
      <p style={{
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-muted)',
        marginBottom: 'var(--space-6)',
        maxWidth: '32rem',
      }}>
        On design systems, AI-assisted development, and why intentionality beats defaults.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <article style={{
              background: 'var(--color-white)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}>
              <div style={{
                display: 'flex',
                gap: 'var(--space-1)',
                marginBottom: 'var(--space-2)',
                flexWrap: 'wrap',
              }}>
                {post.tags.map((tag) => (
                  <span key={tag} style={{
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    padding: '0.1rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-green-muted)',
                    color: 'var(--color-green-deep)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              <h2 style={{
                fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
                fontSize: 'var(--text-xl)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--leading-tight)',
                marginBottom: 'var(--space-1)',
              }}>
                {post.title}
              </h2>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-body)',
                lineHeight: 'var(--leading-relaxed)',
                marginBottom: 'var(--space-2)',
              }}>
                {post.excerpt}
              </p>
              <time style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
              }}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
