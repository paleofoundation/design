import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — dzyne`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^(?!<[hupola])((?!^\s*$).+)$/gm, '<p>$1</p>')
    .replace(/\n{2,}/g, '\n');
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = markdownToHtml(post.content);

  return (
    <article>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link href="/blog" style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          &larr; All posts
        </Link>
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--space-1)',
        marginBottom: 'var(--space-3)',
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

      <h1 style={{
        fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
        fontSize: 'var(--text-3xl)',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        lineHeight: 'var(--leading-tight)',
        marginBottom: 'var(--space-2)',
      }}>
        {post.title}
      </h1>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-6)',
        paddingBottom: 'var(--space-4)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <time style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <span style={{ color: 'var(--color-text-muted)' }}>&middot;</span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {post.author}
        </span>
      </div>

      <div
        className="blog-prose"
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-body)',
          lineHeight: 'var(--leading-relaxed)',
        }}
      />

      <div style={{
        marginTop: 'var(--space-8)',
        padding: 'var(--space-4)',
        background: 'var(--color-green-muted)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-fraunces, Fraunces, Georgia, serif)',
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          color: 'var(--color-green-deep)',
          marginBottom: 'var(--space-2)',
        }}>
          Ready to stop building generic?
        </p>
        <Link href="/onboarding" style={{
          display: 'inline-block',
          background: 'var(--color-orange)',
          color: '#fff',
          fontWeight: 600,
          fontSize: 'var(--text-sm)',
          padding: '0.5rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          textDecoration: 'none',
        }}>
          Start your design interview
        </Link>
      </div>
    </article>
  );
}
