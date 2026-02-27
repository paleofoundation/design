import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface SeedPattern {
  name: string;
  description: string;
  category: string;
  tags: string[];
  source_url: string;
  tokens: {
    colorScheme: 'light' | 'dark';
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      textPrimary: string;
      textSecondary: string;
    };
    typography: {
      fontFamilies: {
        primary: string;
        heading: string;
      };
      fontSizes: {
        h1: string;
        h2: string;
        h3: string;
        body: string;
      };
    };
    spacing: {
      baseUnit: number;
      borderRadius: string;
    };
  };
}

// =============================================
// 100 CURATED DESIGN PATTERNS
// =============================================

const SEED_PATTERNS: SeedPattern[] = [
  // =========================================
  // LANDING PAGES (20)
  // =========================================
  {
    name: 'Stripe Hero Pattern',
    description: 'Gradient mesh background with clean typography, prominent CTA, and animated code snippets. Dark theme with vibrant accent colors. Uses custom gradient animations and code syntax highlighting for developer appeal.',
    category: 'landing-page',
    tags: ['gradient', 'dark-theme', 'fintech', 'developer', 'animated', 'hero'],
    source_url: 'https://stripe.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#635BFF',
        secondary: '#0A2540',
        accent: '#00D4AA',
        background: '#0A2540',
        textPrimary: '#FFFFFF',
        textSecondary: '#ADBDCC',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '64px', h2: '48px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '12px' },
    },
  },
  {
    name: 'Vercel Landing Page',
    description: 'Minimalist black and white hero with a single headline, command-line prompt, and deploy button. Ultra-clean layout with generous whitespace. Monochrome palette with a focus on typography hierarchy and subtle hover transitions.',
    category: 'landing-page',
    tags: ['minimal', 'dark-theme', 'developer', 'monochrome', 'clean', 'cli'],
    source_url: 'https://vercel.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#FFFFFF',
        secondary: '#111111',
        accent: '#0070F3',
        background: '#000000',
        textPrimary: '#FFFFFF',
        textSecondary: '#888888',
      },
      typography: {
        fontFamilies: { primary: 'Geist', heading: 'Geist' },
        fontSizes: { h1: '72px', h2: '48px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Tailwind CSS Landing',
    description: 'Developer-focused landing with interactive code examples and live previews. Light theme with signature teal accent. Features utility-class demos, responsive design showcases, and a component library preview section.',
    category: 'landing-page',
    tags: ['developer', 'light-theme', 'interactive', 'code-examples', 'css', 'framework'],
    source_url: 'https://tailwindcss.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#38BDF8',
        secondary: '#0F172A',
        accent: '#F472B6',
        background: '#0F172A',
        textPrimary: '#E2E8F0',
        textSecondary: '#94A3B8',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '56px', h2: '36px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Framer Landing Page',
    description: 'Design-forward landing with smooth scroll-driven animations and 3D transforms. Dark mode with neon purple highlights. Showcases interactive prototyping capabilities with embedded design previews and motion graphics.',
    category: 'landing-page',
    tags: ['animation', 'dark-theme', 'design-tool', 'creative', '3d', 'motion'],
    source_url: 'https://framer.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#BB5DFF',
        secondary: '#1A1A1A',
        accent: '#FF3366',
        background: '#111111',
        textPrimary: '#FFFFFF',
        textSecondary: '#999999',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '80px', h2: '48px', h3: '28px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '16px' },
    },
  },
  {
    name: 'Railway Landing Page',
    description: 'Infrastructure-as-code landing with terminal UI elements and deployment flow visualizations. Deep purple dark theme with pink accents. Clean card-based feature grid with subtle glow effects on hover.',
    category: 'landing-page',
    tags: ['developer', 'dark-theme', 'infrastructure', 'terminal', 'deployment', 'purple'],
    source_url: 'https://railway.app',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#C049FF',
        secondary: '#1C1030',
        accent: '#FF3E8D',
        background: '#13111C',
        textPrimary: '#FFFFFF',
        textSecondary: '#A09BAE',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '56px', h2: '40px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '12px' },
    },
  },
  {
    name: 'Resend Landing Page',
    description: 'Email API landing with code-first presentation and React email component previews. Stark black background with white text and a single blue accent. Minimal navigation and a focus on developer experience messaging.',
    category: 'landing-page',
    tags: ['developer', 'dark-theme', 'email', 'api', 'minimal', 'code-first'],
    source_url: 'https://resend.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#FFFFFF',
        secondary: '#171717',
        accent: '#3B82F6',
        background: '#000000',
        textPrimary: '#FFFFFF',
        textSecondary: '#A1A1AA',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '56px', h2: '36px', h3: '24px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Cal.com Landing Page',
    description: 'Scheduling platform landing with bold typography and an interactive calendar demo. Light theme with warm neutral tones and a vibrant orange CTA. Open-source messaging with comparison tables and social proof counters.',
    category: 'landing-page',
    tags: ['scheduling', 'light-theme', 'open-source', 'bold-typography', 'interactive', 'orange'],
    source_url: 'https://cal.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#111827',
        secondary: '#F3F4F6',
        accent: '#FF6B2B',
        background: '#FFFFFF',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Cal Sans' },
        fontSizes: { h1: '64px', h2: '40px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Clerk Auth Landing',
    description: 'Authentication platform landing with component previews and framework integration badges. Clean white layout with purple accents and embedded sign-in form demos. Focuses on drop-in UI components and multi-framework support.',
    category: 'landing-page',
    tags: ['auth', 'light-theme', 'developer', 'components', 'purple', 'framework'],
    source_url: 'https://clerk.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#6C47FF',
        secondary: '#F1EDFF',
        accent: '#1DA1F2',
        background: '#FFFFFF',
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '56px', h2: '40px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '12px' },
    },
  },
  {
    name: 'Neon Database Landing',
    description: 'Serverless Postgres landing with neon-green accents on a deep black background. Features branching visualizations and latency benchmark charts. Technical yet approachable with SQL code snippets and connection string demos.',
    category: 'landing-page',
    tags: ['database', 'dark-theme', 'neon', 'serverless', 'postgres', 'developer'],
    source_url: 'https://neon.tech',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#00E599',
        secondary: '#1A1A2E',
        accent: '#B3FF66',
        background: '#0A0A0F',
        textPrimary: '#FFFFFF',
        textSecondary: '#7A7A8E',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '64px', h2: '44px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '12px' },
    },
  },
  {
    name: 'PlanetScale Landing',
    description: 'MySQL platform landing with a cosmic dark theme and branching workflow diagrams. Orange accent on charcoal with schema diff visualizations. Enterprise-grade messaging balanced with developer-friendly code examples.',
    category: 'landing-page',
    tags: ['database', 'dark-theme', 'mysql', 'branching', 'enterprise', 'cosmic'],
    source_url: 'https://planetscale.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#F5A623',
        secondary: '#1A1A1A',
        accent: '#FF6F61',
        background: '#0D0D0D',
        textPrimary: '#F5F5F5',
        textSecondary: '#8C8C8C',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '56px', h2: '40px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Turso Database Landing',
    description: 'Edge database landing with a teal-green palette on dark background. Emphasizes low-latency with globe visualization showing edge locations. SQLite-compatible messaging with embedded query performance benchmarks.',
    category: 'landing-page',
    tags: ['database', 'dark-theme', 'edge', 'sqlite', 'latency', 'global'],
    source_url: 'https://turso.tech',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#4FF8D2',
        secondary: '#0D2137',
        accent: '#FF6B6B',
        background: '#050E1A',
        textPrimary: '#FFFFFF',
        textSecondary: '#8BA3BC',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '52px', h2: '36px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '10px' },
    },
  },
  {
    name: 'Astro Framework Landing',
    description: 'Content-focused framework landing with an island architecture diagram and performance metrics. Dark purple theme with warm orange accents. Features build-time rendering comparisons and framework integration logos.',
    category: 'landing-page',
    tags: ['framework', 'dark-theme', 'performance', 'static-site', 'islands', 'content'],
    source_url: 'https://astro.build',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#FF5D01',
        secondary: '#17191E',
        accent: '#BC52EE',
        background: '#0D0F14',
        textPrimary: '#F6F6F6',
        textSecondary: '#858B98',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '56px', h2: '40px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'shadcn/ui Landing',
    description: 'Component library landing with live-copyable code blocks and inline component demos. Muted neutral palette with subtle borders. Minimalist design that lets the components speak for themselves, featuring a command palette UI.',
    category: 'landing-page',
    tags: ['components', 'dark-theme', 'react', 'minimal', 'open-source', 'tailwind'],
    source_url: 'https://ui.shadcn.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#FAFAFA',
        secondary: '#27272A',
        accent: '#2563EB',
        background: '#09090B',
        textPrimary: '#FAFAFA',
        textSecondary: '#A1A1AA',
      },
      typography: {
        fontFamilies: { primary: 'Geist', heading: 'Geist' },
        fontSizes: { h1: '48px', h2: '30px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '6px' },
    },
  },
  {
    name: 'Supabase Landing Page',
    description: 'Open-source Firebase alternative landing with an emerald green accent on dark charcoal. Features real-time database dashboards, auth flow diagrams, and storage bucket previews. Community-driven with GitHub star counters.',
    category: 'landing-page',
    tags: ['database', 'dark-theme', 'open-source', 'baas', 'green', 'realtime'],
    source_url: 'https://supabase.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#3ECF8E',
        secondary: '#1C1C1C',
        accent: '#6EE7B7',
        background: '#171717',
        textPrimary: '#EDEDED',
        textSecondary: '#8F8F8F',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '56px', h2: '40px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Loom Landing Page',
    description: 'Video messaging landing with embedded recorder UI preview and playback demos. Warm purple-to-pink gradient hero with floating video thumbnails. Emphasizes async communication with team collaboration use cases.',
    category: 'landing-page',
    tags: ['video', 'light-theme', 'collaboration', 'purple', 'gradient', 'async'],
    source_url: 'https://loom.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#625DF5',
        secondary: '#F5F3FF',
        accent: '#E04F75',
        background: '#FFFFFF',
        textPrimary: '#1B1340',
        textSecondary: '#625B71',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Loom Sans' },
        fontSizes: { h1: '60px', h2: '40px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '16px' },
    },
  },
  {
    name: 'Arc Browser Landing',
    description: 'Browser reimagination landing with colorful sidebar preview and spatial tab organization. Playful multi-color palette on light cream background. Features split-view demos, easel boards, and boost customization showcases.',
    category: 'landing-page',
    tags: ['browser', 'light-theme', 'colorful', 'playful', 'creative', 'spatial'],
    source_url: 'https://arc.net',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#4A90D9',
        secondary: '#FFF8F0',
        accent: '#FF6B8A',
        background: '#FFFCF5',
        textPrimary: '#1A1A1A',
        textSecondary: '#6E6E6E',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '64px', h2: '44px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '12px' },
    },
  },
  {
    name: 'Raycast Landing Page',
    description: 'Productivity launcher landing with command palette UI and extension marketplace preview. Dark theme with a warm amber accent and frosted glass panels. Showcases keyboard-first workflows and AI integration features.',
    category: 'landing-page',
    tags: ['productivity', 'dark-theme', 'command-palette', 'keyboard', 'launcher', 'ai'],
    source_url: 'https://raycast.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#FF6363',
        secondary: '#1A1A1A',
        accent: '#FF9F43',
        background: '#111111',
        textPrimary: '#FFFFFF',
        textSecondary: '#929292',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '56px', h2: '40px', h3: '24px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '12px' },
    },
  },
  {
    name: 'Warp Terminal Landing',
    description: 'Modern terminal landing with IDE-like feature previews and AI command suggestions. Deep navy background with bright cyan and orange highlights. Features block-based editing, workflow sharing, and team collaboration demos.',
    category: 'landing-page',
    tags: ['terminal', 'dark-theme', 'developer', 'ai', 'ide', 'productivity'],
    source_url: 'https://warp.dev',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#01A4FF',
        secondary: '#0E1724',
        accent: '#FF8562',
        background: '#0B1120',
        textPrimary: '#FFFFFF',
        textSecondary: '#8094A7',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '60px', h2: '42px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '12px' },
    },
  },
  {
    name: 'Deno Landing Page',
    description: 'JavaScript runtime landing with a clean light theme and bold black typography. Features permission-model diagrams, benchmark charts against Node.js, and TypeScript-first code examples. Fresh and modern with nature-inspired green tones.',
    category: 'landing-page',
    tags: ['runtime', 'light-theme', 'developer', 'typescript', 'fresh', 'green'],
    source_url: 'https://deno.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#12124B',
        secondary: '#F7F7F7',
        accent: '#70FFAF',
        background: '#FFFFFF',
        textPrimary: '#12124B',
        textSecondary: '#6B6B97',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '56px', h2: '40px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Bun Runtime Landing',
    description: 'JavaScript bundler and runtime landing with speed benchmarks and flame chart visualizations. Warm beige background with a playful peach mascot. Focuses on drop-in Node.js compatibility and package manager performance.',
    category: 'landing-page',
    tags: ['runtime', 'light-theme', 'performance', 'bundler', 'playful', 'benchmarks'],
    source_url: 'https://bun.sh',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#FBF0DF',
        secondary: '#1A1410',
        accent: '#F472B6',
        background: '#FFFBF5',
        textPrimary: '#14110F',
        textSecondary: '#6B5E53',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '60px', h2: '42px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },

  // =========================================
  // DASHBOARDS (12)
  // =========================================
  {
    name: 'Notion Dashboard',
    description: 'Flexible workspace dashboard with a sidebar navigation tree, nested pages, and inline databases. Light theme with warm gray tones. Features toggle blocks, kanban boards, and a slash-command content creation interface.',
    category: 'dashboard',
    tags: ['workspace', 'light-theme', 'productivity', 'sidebar', 'blocks', 'database'],
    source_url: 'https://notion.so',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#000000',
        secondary: '#F7F6F3',
        accent: '#2EAADC',
        background: '#FFFFFF',
        textPrimary: '#37352F',
        textSecondary: '#787774',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Georgia' },
        fontSizes: { h1: '40px', h2: '30px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '4px' },
    },
  },
  {
    name: 'Linear Dashboard',
    description: 'Issue tracking dashboard with a dense, keyboard-navigable interface and real-time sync. Dark theme with purple accents and ultra-smooth animations. Features cycle progress bars, priority badges, and team workload charts.',
    category: 'dashboard',
    tags: ['issue-tracking', 'dark-theme', 'keyboard-first', 'real-time', 'purple', 'dense'],
    source_url: 'https://linear.app',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#5E6AD2',
        secondary: '#1B1B25',
        accent: '#F2C94C',
        background: '#111119',
        textPrimary: '#EEEEEE',
        textSecondary: '#8A8F98',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '32px', h2: '24px', h3: '18px', body: '14px' },
      },
      spacing: { baseUnit: 4, borderRadius: '6px' },
    },
  },
  {
    name: 'GitHub Dashboard',
    description: 'Code collaboration dashboard with repository feeds, pull request queues, and contribution graphs. Muted dark theme with green contribution heatmaps. Features markdown previews, diff viewers, and action status indicators.',
    category: 'dashboard',
    tags: ['code', 'dark-theme', 'git', 'collaboration', 'contributions', 'open-source'],
    source_url: 'https://github.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#238636',
        secondary: '#161B22',
        accent: '#58A6FF',
        background: '#0D1117',
        textPrimary: '#E6EDF3',
        textSecondary: '#8B949E',
      },
      typography: {
        fontFamilies: { primary: '-apple-system', heading: '-apple-system' },
        fontSizes: { h1: '32px', h2: '24px', h3: '20px', body: '14px' },
      },
      spacing: { baseUnit: 8, borderRadius: '6px' },
    },
  },
  {
    name: 'Vercel Dashboard',
    description: 'Deployment dashboard with real-time build logs, domain management, and analytics charts. Stark black and white palette with status-color indicators. Features git integration previews, serverless function logs, and edge config panels.',
    category: 'dashboard',
    tags: ['deployment', 'dark-theme', 'monochrome', 'real-time', 'logs', 'analytics'],
    source_url: 'https://vercel.com/dashboard',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#FFFFFF',
        secondary: '#1A1A1A',
        accent: '#0070F3',
        background: '#000000',
        textPrimary: '#EDEDED',
        textSecondary: '#666666',
      },
      typography: {
        fontFamilies: { primary: 'Geist', heading: 'Geist' },
        fontSizes: { h1: '32px', h2: '24px', h3: '18px', body: '14px' },
      },
      spacing: { baseUnit: 8, borderRadius: '6px' },
    },
  },
  {
    name: 'Supabase Dashboard',
    description: 'Database management dashboard with a SQL editor, table viewer, and storage browser. Dark green-accented theme with sidebar project navigation. Features real-time subscription monitors, auth user tables, and edge function logs.',
    category: 'dashboard',
    tags: ['database', 'dark-theme', 'sql-editor', 'real-time', 'green', 'management'],
    source_url: 'https://supabase.com/dashboard',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#3ECF8E',
        secondary: '#1C1C1C',
        accent: '#3ECF8E',
        background: '#131313',
        textPrimary: '#EDEDED',
        textSecondary: '#6F6F6F',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '28px', h2: '22px', h3: '18px', body: '14px' },
      },
      spacing: { baseUnit: 4, borderRadius: '6px' },
    },
  },
  {
    name: 'Clerk Dashboard',
    description: 'Authentication management dashboard with user tables, session monitors, and organization trees. Light theme with purple accent badges. Features webhook logs, JWT template editors, and social connection configuration panels.',
    category: 'dashboard',
    tags: ['auth', 'light-theme', 'users', 'sessions', 'management', 'purple'],
    source_url: 'https://dashboard.clerk.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#6C47FF',
        secondary: '#F8F7FF',
        accent: '#1DA1F2',
        background: '#FFFFFF',
        textPrimary: '#131316',
        textSecondary: '#747686',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '28px', h2: '22px', h3: '18px', body: '14px' },
      },
      spacing: { baseUnit: 4, borderRadius: '8px' },
    },
  },
  {
    name: 'Retool Dashboard Builder',
    description: 'Internal tool builder with drag-and-drop components, query editors, and data source connectors. Light neutral theme with blue action buttons. Features table widgets, form builders, and JavaScript transform panels.',
    category: 'dashboard',
    tags: ['internal-tools', 'light-theme', 'drag-drop', 'low-code', 'data', 'builder'],
    source_url: 'https://retool.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#3D3D3D',
        secondary: '#F5F5F5',
        accent: '#2F80ED',
        background: '#FFFFFF',
        textPrimary: '#1A1A1A',
        textSecondary: '#737373',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '28px', h2: '22px', h3: '18px', body: '13px' },
      },
      spacing: { baseUnit: 4, borderRadius: '6px' },
    },
  },
  {
    name: 'Grafana Dashboard',
    description: 'Observability dashboard with time-series graphs, heatmaps, and alerting panels. Dark blue-gray theme with orange and green status colors. Features a flexible grid layout, query builder, and annotation overlay system.',
    category: 'dashboard',
    tags: ['observability', 'dark-theme', 'monitoring', 'graphs', 'time-series', 'alerts'],
    source_url: 'https://grafana.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#FF9830',
        secondary: '#1A1B1F',
        accent: '#73BF69',
        background: '#111217',
        textPrimary: '#CCCCDC',
        textSecondary: '#8E8EA0',
      },
      typography: {
        fontFamilies: { primary: 'Roboto', heading: 'Roboto' },
        fontSizes: { h1: '28px', h2: '22px', h3: '18px', body: '14px' },
      },
      spacing: { baseUnit: 8, borderRadius: '4px' },
    },
  },
  {
    name: 'PostHog Dashboard',
    description: 'Product analytics dashboard with funnel visualizations, session recordings, and feature flag panels. Light theme with playful hedgehog branding and blue charts. Features cohort builders, path analysis diagrams, and experiment results.',
    category: 'dashboard',
    tags: ['analytics', 'light-theme', 'product', 'funnels', 'session-replay', 'experiments'],
    source_url: 'https://posthog.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#1D4AFF',
        secondary: '#F1F3F5',
        accent: '#F54E00',
        background: '#FFFFFF',
        textPrimary: '#151515',
        textSecondary: '#6B6B6B',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '32px', h2: '24px', h3: '18px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Mixpanel Dashboard',
    description: 'Event analytics dashboard with trend charts, retention matrices, and flow diagrams. Clean white interface with purple data visualization accents. Features segmentation filters, cohort selectors, and real-time event streams.',
    category: 'dashboard',
    tags: ['analytics', 'light-theme', 'events', 'retention', 'segmentation', 'purple'],
    source_url: 'https://mixpanel.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#7856FF',
        secondary: '#F5F3FF',
        accent: '#FF5E8A',
        background: '#FFFFFF',
        textPrimary: '#1B0B3B',
        textSecondary: '#6E6E8B',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '28px', h2: '22px', h3: '18px', body: '14px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Datadog Dashboard',
    description: 'Infrastructure monitoring dashboard with dense multi-panel grid, sparklines, and topology maps. Dark purple-tinted theme with green/red/yellow status indicators. Features custom metric queries, anomaly detection badges, and SLO trackers.',
    category: 'dashboard',
    tags: ['monitoring', 'dark-theme', 'infrastructure', 'metrics', 'topology', 'dense'],
    source_url: 'https://datadoghq.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#632CA6',
        secondary: '#23202E',
        accent: '#49C5B6',
        background: '#191625',
        textPrimary: '#E4DFED',
        textSecondary: '#938CA5',
      },
      typography: {
        fontFamilies: { primary: 'Roboto', heading: 'Roboto' },
        fontSizes: { h1: '24px', h2: '20px', h3: '16px', body: '13px' },
      },
      spacing: { baseUnit: 4, borderRadius: '4px' },
    },
  },
  {
    name: 'Figma Dashboard',
    description: 'Design tool file browser with project thumbnails, team spaces, and recent file cards. Light theme with black iconography and subtle gray dividers. Features community hub, plugin browser, and design system library panels.',
    category: 'dashboard',
    tags: ['design-tool', 'light-theme', 'file-browser', 'thumbnails', 'teams', 'community'],
    source_url: 'https://figma.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#0D99FF',
        secondary: '#F5F5F5',
        accent: '#A259FF',
        background: '#FFFFFF',
        textPrimary: '#1E1E1E',
        textSecondary: '#757575',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '28px', h2: '22px', h3: '18px', body: '14px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },

  // =========================================
  // E-COMMERCE (12)
  // =========================================
  {
    name: 'Apple Store',
    description: 'Premium product showcase with full-bleed hero images, cinematic scroll animations, and product configuration carousels. Ultra-minimal white layout with precise typography and generous negative space.',
    category: 'e-commerce',
    tags: ['premium', 'light-theme', 'minimal', 'product-showcase', 'cinematic', 'tech'],
    source_url: 'https://apple.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#0071E3',
        secondary: '#F5F5F7',
        accent: '#0071E3',
        background: '#FFFFFF',
        textPrimary: '#1D1D1F',
        textSecondary: '#6E6E73',
      },
      typography: {
        fontFamilies: { primary: 'SF Pro Display', heading: 'SF Pro Display' },
        fontSizes: { h1: '80px', h2: '56px', h3: '28px', body: '17px' },
      },
      spacing: { baseUnit: 8, borderRadius: '12px' },
    },
  },
  {
    name: 'Shopify Storefront',
    description: 'Commerce platform with customizable product grid, variant selectors, and integrated checkout. Clean green-accented light theme. Features merchant-friendly layouts with collection filters, review widgets, and inventory badges.',
    category: 'e-commerce',
    tags: ['platform', 'light-theme', 'green', 'customizable', 'checkout', 'merchant'],
    source_url: 'https://shopify.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#008060',
        secondary: '#F6F6F7',
        accent: '#5C6AC4',
        background: '#FFFFFF',
        textPrimary: '#202223',
        textSecondary: '#6D7175',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '48px', h2: '32px', h3: '20px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Nike Store',
    description: 'Athletic brand store with bold full-width imagery, large product cards, and dynamic filtering. High-contrast black and white with red accents. Features size selectors, member exclusive badges, and athlete storytelling sections.',
    category: 'e-commerce',
    tags: ['athletic', 'light-theme', 'bold', 'imagery', 'brand', 'high-contrast'],
    source_url: 'https://nike.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#111111',
        secondary: '#F5F5F5',
        accent: '#FF3B30',
        background: '#FFFFFF',
        textPrimary: '#111111',
        textSecondary: '#707072',
      },
      typography: {
        fontFamilies: { primary: 'Helvetica Neue', heading: 'Nike Futura' },
        fontSizes: { h1: '64px', h2: '40px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '0px' },
    },
  },
  {
    name: 'Allbirds Store',
    description: 'Sustainable footwear store with earthy tones, material science callouts, and carbon footprint badges. Warm beige background with forest green accents. Features lifestyle photography, sustainability metrics, and comfort technology explainers.',
    category: 'e-commerce',
    tags: ['sustainable', 'light-theme', 'earthy', 'footwear', 'eco-friendly', 'warm'],
    source_url: 'https://allbirds.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#212A2F',
        secondary: '#F2EDE3',
        accent: '#3A6B35',
        background: '#FAF6EF',
        textPrimary: '#212A2F',
        textSecondary: '#6B7B6E',
      },
      typography: {
        fontFamilies: { primary: 'GT America', heading: 'GT America' },
        fontSizes: { h1: '52px', h2: '36px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '4px' },
    },
  },
  {
    name: 'Warby Parker Store',
    description: 'Eyewear store with virtual try-on previews, quiz-based recommendation flows, and side-by-side product comparisons. Sophisticated blue and cream palette with editorial-style photography and witty microcopy.',
    category: 'e-commerce',
    tags: ['eyewear', 'light-theme', 'virtual-try-on', 'quiz', 'editorial', 'sophisticated'],
    source_url: 'https://warbyparker.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#00487C',
        secondary: '#F5F0EB',
        accent: '#D4853B',
        background: '#FFFFFF',
        textPrimary: '#00263A',
        textSecondary: '#637380',
      },
      typography: {
        fontFamilies: { primary: 'Freight Text', heading: 'Garnett' },
        fontSizes: { h1: '48px', h2: '32px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '4px' },
    },
  },
  {
    name: 'Everlane Store',
    description: 'Transparent pricing fashion store with cost breakdowns, factory profiles, and ethical sourcing badges. Crisp white layout with black typography. Features "choose what you pay" sections and minimal product cards with hover-zoom.',
    category: 'e-commerce',
    tags: ['fashion', 'light-theme', 'transparent', 'ethical', 'minimal', 'pricing'],
    source_url: 'https://everlane.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#1A1A1A',
        secondary: '#F5F5F5',
        accent: '#C5A572',
        background: '#FFFFFF',
        textPrimary: '#1A1A1A',
        textSecondary: '#757575',
      },
      typography: {
        fontFamilies: { primary: 'Helvetica Neue', heading: 'Helvetica Neue' },
        fontSizes: { h1: '44px', h2: '32px', h3: '20px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '0px' },
    },
  },
  {
    name: 'Glossier Store',
    description: 'Beauty brand store with soft pink palette, user-generated content galleries, and shade-finder tools. Playful rounded UI with sticker-like badges. Features "skin first" editorial content, product bundles, and community reviews.',
    category: 'e-commerce',
    tags: ['beauty', 'light-theme', 'pink', 'playful', 'community', 'user-generated'],
    source_url: 'https://glossier.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#FE3E7E',
        secondary: '#FFF0F5',
        accent: '#FF7BAC',
        background: '#FFFFFF',
        textPrimary: '#2D2D2D',
        textSecondary: '#767676',
      },
      typography: {
        fontFamilies: { primary: 'Apercu', heading: 'Apercu' },
        fontSizes: { h1: '48px', h2: '32px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '20px' },
    },
  },
  {
    name: 'Away Travel Store',
    description: 'Premium luggage store with lifestyle travel imagery, size comparison tools, and color swatch selectors. Clean light layout with muted navy and blush accents. Features packing tips, travel guides, and personalization options.',
    category: 'e-commerce',
    tags: ['travel', 'light-theme', 'premium', 'lifestyle', 'navy', 'accessories'],
    source_url: 'https://awaytravel.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#1C2B4A',
        secondary: '#F7F5F2',
        accent: '#D4A574',
        background: '#FFFFFF',
        textPrimary: '#1C2B4A',
        textSecondary: '#7A8599',
      },
      typography: {
        fontFamilies: { primary: 'Maison Neue', heading: 'Maison Neue' },
        fontSizes: { h1: '48px', h2: '32px', h3: '20px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '4px' },
    },
  },
  {
    name: 'Casper Sleep Store',
    description: 'Mattress store with comfort comparison charts, sleep quiz recommendations, and trial period callouts. Soft blue-and-white palette with warm illustration style. Features cross-section diagrams, review highlights, and financing calculators.',
    category: 'e-commerce',
    tags: ['sleep', 'light-theme', 'soft', 'illustrations', 'quiz', 'blue'],
    source_url: 'https://casper.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#002E6D',
        secondary: '#EFF5FC',
        accent: '#FFD15C',
        background: '#FFFFFF',
        textPrimary: '#002E6D',
        textSecondary: '#5A7A99',
      },
      typography: {
        fontFamilies: { primary: 'Calibre', heading: 'Calibre' },
        fontSizes: { h1: '52px', h2: '36px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Patagonia Store',
    description: 'Outdoor apparel store with environmental activism banners, activity-based filtering, and repair/recycle programs. Rugged aesthetic with nature photography. Features Worn Wear used gear section and environmental grant applications.',
    category: 'e-commerce',
    tags: ['outdoor', 'light-theme', 'activism', 'rugged', 'nature', 'sustainable'],
    source_url: 'https://patagonia.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#1B1B1B',
        secondary: '#F0EFEB',
        accent: '#005691',
        background: '#FFFFFF',
        textPrimary: '#1B1B1B',
        textSecondary: '#666666',
      },
      typography: {
        fontFamilies: { primary: 'Helvetica Neue', heading: 'Helvetica Neue' },
        fontSizes: { h1: '44px', h2: '32px', h3: '20px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '2px' },
    },
  },
  {
    name: 'Mejuri Jewelry Store',
    description: 'Fine jewelry store with elegant gold-on-white aesthetic, 360-degree product viewers, and stacking guide tools. Refined serif typography with close-up macro photography. Features wishlist builders and gifting concierge sections.',
    category: 'e-commerce',
    tags: ['jewelry', 'light-theme', 'elegant', 'gold', 'serif', 'luxury'],
    source_url: 'https://mejuri.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#1A1A1A',
        secondary: '#F9F6F1',
        accent: '#C9A96E',
        background: '#FFFFFF',
        textPrimary: '#1A1A1A',
        textSecondary: '#8C8C8C',
      },
      typography: {
        fontFamilies: { primary: 'NB International', heading: 'Noe Display' },
        fontSizes: { h1: '44px', h2: '32px', h3: '20px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '0px' },
    },
  },
  {
    name: 'Aesop Store',
    description: 'Luxury skincare store with warm amber tones, ingredient-focused product pages, and apothecary-inspired layout. Rich editorial content with botanical illustrations. Features skin consultation quizzes and regimen builder tools.',
    category: 'e-commerce',
    tags: ['skincare', 'light-theme', 'luxury', 'amber', 'editorial', 'apothecary'],
    source_url: 'https://aesop.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#33302E',
        secondary: '#F6F3EB',
        accent: '#9E6B2C',
        background: '#FFFEF5',
        textPrimary: '#33302E',
        textSecondary: '#7A756F',
      },
      typography: {
        fontFamilies: { primary: 'Suisse Intl', heading: 'Suisse Intl' },
        fontSizes: { h1: '40px', h2: '28px', h3: '20px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '0px' },
    },
  },

  // =========================================
  // SAAS (12)
  // =========================================
  {
    name: 'Linear App',
    description: 'Project management app with streamlined issue views, cycle tracking, and roadmap timelines. Ultra-fast dark UI with pixel-perfect spacing. Features custom views, integrations panel, and team insights dashboards.',
    category: 'saas',
    tags: ['project-management', 'dark-theme', 'fast', 'pixel-perfect', 'issues', 'roadmap'],
    source_url: 'https://linear.app/product',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#5E6AD2',
        secondary: '#1F2023',
        accent: '#F2C94C',
        background: '#121316',
        textPrimary: '#EEEEEE',
        textSecondary: '#8A8F98',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '40px', h2: '28px', h3: '20px', body: '14px' },
      },
      spacing: { baseUnit: 4, borderRadius: '6px' },
    },
  },
  {
    name: 'Slack Workspace',
    description: 'Team messaging app with threaded conversations, channel sidebar, and rich message formatting. Aubergine-accented interface with an activity feed, file sharing drawers, and Slack Connect cross-org channels.',
    category: 'saas',
    tags: ['messaging', 'dark-theme', 'collaboration', 'channels', 'threads', 'aubergine'],
    source_url: 'https://slack.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#4A154B',
        secondary: '#1A1D21',
        accent: '#36C5F0',
        background: '#1A1D21',
        textPrimary: '#D1D2D3',
        textSecondary: '#ABABAD',
      },
      typography: {
        fontFamilies: { primary: 'Lato', heading: 'Lato' },
        fontSizes: { h1: '34px', h2: '24px', h3: '18px', body: '15px' },
      },
      spacing: { baseUnit: 4, borderRadius: '8px' },
    },
  },
  {
    name: 'Notion Workspace App',
    description: 'All-in-one workspace with nested pages, inline databases, and flexible content blocks. Light and airy with a warm off-white palette. Features wiki-style knowledge bases, project trackers, and custom template galleries.',
    category: 'saas',
    tags: ['workspace', 'light-theme', 'blocks', 'wiki', 'databases', 'flexible'],
    source_url: 'https://notion.so/product',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#000000',
        secondary: '#F7F6F3',
        accent: '#EB5757',
        background: '#FFFFFF',
        textPrimary: '#37352F',
        textSecondary: '#787774',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Georgia' },
        fontSizes: { h1: '40px', h2: '30px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '4px' },
    },
  },
  {
    name: 'Figma Design App',
    description: 'Collaborative design tool with real-time multiplayer editing, auto-layout, and component system. Light neutral canvas with rainbow-cursor collaboration indicators. Features design tokens, branching, and dev mode handoff.',
    category: 'saas',
    tags: ['design-tool', 'light-theme', 'collaborative', 'real-time', 'components', 'multiplayer'],
    source_url: 'https://figma.com/design',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#0D99FF',
        secondary: '#F5F5F5',
        accent: '#A259FF',
        background: '#FFFFFF',
        textPrimary: '#1E1E1E',
        textSecondary: '#757575',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '32px', h2: '24px', h3: '18px', body: '13px' },
      },
      spacing: { baseUnit: 4, borderRadius: '8px' },
    },
  },
  {
    name: 'Miro Whiteboard',
    description: 'Infinite canvas whiteboard with sticky notes, mind maps, and diagramming tools. Bright yellow accent on clean white. Features facilitation timers, voting dots, presentation mode, and 100+ template categories.',
    category: 'saas',
    tags: ['whiteboard', 'light-theme', 'collaboration', 'yellow', 'diagrams', 'templates'],
    source_url: 'https://miro.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#FFD02F',
        secondary: '#F5F5F5',
        accent: '#4262FF',
        background: '#FFFFFF',
        textPrimary: '#050038',
        textSecondary: '#6B6882',
      },
      typography: {
        fontFamilies: { primary: 'Roobert', heading: 'Roobert' },
        fontSizes: { h1: '48px', h2: '32px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Airtable Platform',
    description: 'Spreadsheet-database hybrid with rich field types, linked records, and automation triggers. Bright teal accent on light interface. Features gallery, kanban, calendar, and Gantt chart views with color-coded status labels.',
    category: 'saas',
    tags: ['database', 'light-theme', 'spreadsheet', 'teal', 'automations', 'views'],
    source_url: 'https://airtable.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#18BFFF',
        secondary: '#F2F2F2',
        accent: '#FCB400',
        background: '#FFFFFF',
        textPrimary: '#333333',
        textSecondary: '#666666',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '40px', h2: '28px', h3: '20px', body: '14px' },
      },
      spacing: { baseUnit: 8, borderRadius: '6px' },
    },
  },
  {
    name: 'Monday.com Platform',
    description: 'Work OS with colorful board views, timeline charts, and workload dashboards. Vibrant multi-color palette on dark charcoal. Features pulse-based work items, custom automations, and integration marketplace.',
    category: 'saas',
    tags: ['work-management', 'dark-theme', 'colorful', 'boards', 'automations', 'vibrant'],
    source_url: 'https://monday.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#6161FF',
        secondary: '#292F4C',
        accent: '#00CA72',
        background: '#181B34',
        textPrimary: '#D5D8DF',
        textSecondary: '#9699A6',
      },
      typography: {
        fontFamilies: { primary: 'Figtree', heading: 'Figtree' },
        fontSizes: { h1: '44px', h2: '32px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Loom Video App',
    description: 'Async video messaging app with an inline recording widget, transcript viewer, and engagement analytics. Purple-tinted light theme with warm gradients. Features emoji reactions, time-stamped comments, and auto-generated chapters.',
    category: 'saas',
    tags: ['video', 'light-theme', 'async', 'recording', 'transcripts', 'purple'],
    source_url: 'https://loom.com/product',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#625DF5',
        secondary: '#F4F2FF',
        accent: '#E04F75',
        background: '#FFFFFF',
        textPrimary: '#1B1340',
        textSecondary: '#625B71',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Loom Sans' },
        fontSizes: { h1: '44px', h2: '32px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '12px' },
    },
  },
  {
    name: 'Pitch Presentation App',
    description: 'Collaborative presentation tool with real-time co-editing, smart templates, and brand-consistent decks. Clean dark interface with subtle blue accents. Features slide analytics, version history, and custom font uploads.',
    category: 'saas',
    tags: ['presentations', 'dark-theme', 'collaborative', 'templates', 'brand', 'slides'],
    source_url: 'https://pitch.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#7B68EE',
        secondary: '#1C1C2E',
        accent: '#44D7B6',
        background: '#121220',
        textPrimary: '#FFFFFF',
        textSecondary: '#9191A0',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '40px', h2: '28px', h3: '20px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Coda Document App',
    description: 'Doc-meets-app platform with tables, buttons, and automations inside documents. Warm coral accent on clean white. Features pack integrations, formula language, cross-doc syncing, and interactive publishing.',
    category: 'saas',
    tags: ['documents', 'light-theme', 'interactive', 'coral', 'formulas', 'automations'],
    source_url: 'https://coda.io',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#F46A54',
        secondary: '#FFF5F3',
        accent: '#6B4FBB',
        background: '#FFFFFF',
        textPrimary: '#252128',
        textSecondary: '#726E76',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '40px', h2: '28px', h3: '20px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'ClickUp Platform',
    description: 'All-in-one productivity platform with nested spaces, folder hierarchies, and custom task statuses. Vibrant gradient purple-to-pink branding on white. Features whiteboards, docs, goals, time tracking, and AI writing assistant.',
    category: 'saas',
    tags: ['productivity', 'light-theme', 'gradient', 'all-in-one', 'hierarchy', 'vibrant'],
    source_url: 'https://clickup.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#7B68EE',
        secondary: '#F7F6FF',
        accent: '#FF4081',
        background: '#FFFFFF',
        textPrimary: '#1B1B2F',
        textSecondary: '#6C6C80',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '48px', h2: '32px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '10px' },
    },
  },
  {
    name: 'Asana Work Management',
    description: 'Work management platform with portfolio views, workload charts, and timeline dependencies. Soft coral-pink accent on clean white interface. Features custom fields, rules engine, goals tracking, and cross-project reporting.',
    category: 'saas',
    tags: ['work-management', 'light-theme', 'coral', 'portfolio', 'timelines', 'goals'],
    source_url: 'https://asana.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#F06A6A',
        secondary: '#F9F8F8',
        accent: '#4573D2',
        background: '#FFFFFF',
        textPrimary: '#1E1F21',
        textSecondary: '#6D6E6F',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '44px', h2: '32px', h3: '22px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },

  // =========================================
  // PORTFOLIO (10)
  // =========================================
  {
    name: 'Minimal Dark Portfolio',
    description: 'Ultra-minimal portfolio with large project thumbnails on a pure black background. Monospace type for captions and smooth fade-in transitions on scroll. Single-column layout with generous vertical rhythm.',
    category: 'portfolio',
    tags: ['minimal', 'dark-theme', 'monospace', 'photography', 'single-column', 'fade-in'],
    source_url: 'https://minimal.gallery',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#FFFFFF',
        secondary: '#1A1A1A',
        accent: '#FF4444',
        background: '#000000',
        textPrimary: '#FFFFFF',
        textSecondary: '#666666',
      },
      typography: {
        fontFamilies: { primary: 'JetBrains Mono', heading: 'JetBrains Mono' },
        fontSizes: { h1: '48px', h2: '32px', h3: '20px', body: '14px' },
      },
      spacing: { baseUnit: 8, borderRadius: '0px' },
    },
  },
  {
    name: 'Colorful Creative Portfolio',
    description: 'Vibrant multi-color portfolio with playful hover animations, scattered layout, and custom cursor effects. Each project card uses a different accent color with bold sans-serif headlines and diagonal compositions.',
    category: 'portfolio',
    tags: ['colorful', 'light-theme', 'playful', 'creative', 'animations', 'custom-cursor'],
    source_url: 'https://www.awwwards.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#FF3366',
        secondary: '#FFF0F3',
        accent: '#33CCFF',
        background: '#FFFDF7',
        textPrimary: '#1A1A1A',
        textSecondary: '#888888',
      },
      typography: {
        fontFamilies: { primary: 'Space Grotesk', heading: 'Space Grotesk' },
        fontSizes: { h1: '72px', h2: '48px', h3: '28px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '16px' },
    },
  },
  {
    name: 'Typographic Portfolio',
    description: 'Typography-driven portfolio where text is the primary visual element. Oversized variable-weight headlines with expressive kerning. Black and white with a single accent color revealed on interaction.',
    category: 'portfolio',
    tags: ['typography', 'light-theme', 'variable-font', 'expressive', 'monochrome', 'editorial'],
    source_url: 'https://type.lol',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#000000',
        secondary: '#F0F0F0',
        accent: '#0055FF',
        background: '#FFFFFF',
        textPrimary: '#000000',
        textSecondary: '#999999',
      },
      typography: {
        fontFamilies: { primary: 'Instrument Serif', heading: 'Instrument Serif' },
        fontSizes: { h1: '120px', h2: '64px', h3: '32px', body: '18px' },
      },
      spacing: { baseUnit: 8, borderRadius: '0px' },
    },
  },
  {
    name: 'Photo-Heavy Portfolio',
    description: 'Photography portfolio with edge-to-edge image grids, lightbox viewers, and category-based filtering. Dark background to maximize image contrast. Features EXIF data overlays and lazy-loaded high-resolution galleries.',
    category: 'portfolio',
    tags: ['photography', 'dark-theme', 'grid', 'lightbox', 'full-bleed', 'high-res'],
    source_url: 'https://unsplash.com/@portfolio',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#FFFFFF',
        secondary: '#1A1A1A',
        accent: '#FF5757',
        background: '#111111',
        textPrimary: '#FFFFFF',
        textSecondary: '#888888',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Playfair Display' },
        fontSizes: { h1: '56px', h2: '36px', h3: '22px', body: '15px' },
      },
      spacing: { baseUnit: 4, borderRadius: '4px' },
    },
  },
  {
    name: 'Brutalist Portfolio',
    description: 'Raw brutalist portfolio with monospaced type, visible grid lines, and deliberately unpolished aesthetics. High-contrast black and white with system-default fonts. Features exposed HTML structure elements and ASCII art dividers.',
    category: 'portfolio',
    tags: ['brutalist', 'light-theme', 'raw', 'monospace', 'high-contrast', 'system-font'],
    source_url: 'https://brutalistwebsites.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#000000',
        secondary: '#EEEEEE',
        accent: '#FF0000',
        background: '#FFFFFF',
        textPrimary: '#000000',
        textSecondary: '#555555',
      },
      typography: {
        fontFamilies: { primary: 'Courier New', heading: 'Arial' },
        fontSizes: { h1: '48px', h2: '32px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '0px' },
    },
  },
  {
    name: 'Editorial Portfolio',
    description: 'Magazine-style portfolio with multi-column text layouts, pull quotes, and dropcap details. Sophisticated serif typography with careful leading and measure. Cream paper-like background with ink-black text and subtle rules.',
    category: 'portfolio',
    tags: ['editorial', 'light-theme', 'serif', 'magazine', 'multi-column', 'sophisticated'],
    source_url: 'https://editorial.design',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#1A1A1A',
        secondary: '#F5F0E8',
        accent: '#C9302C',
        background: '#FAF7F2',
        textPrimary: '#1A1A1A',
        textSecondary: '#6E6A62',
      },
      typography: {
        fontFamilies: { primary: 'EB Garamond', heading: 'EB Garamond' },
        fontSizes: { h1: '56px', h2: '40px', h3: '24px', body: '18px' },
      },
      spacing: { baseUnit: 8, borderRadius: '0px' },
    },
  },
  {
    name: '3D WebGL Portfolio',
    description: 'Immersive portfolio with Three.js 3D scenes, particle effects, and shader-driven transitions. Dark background with luminous accent elements. Projects appear as interactive 3D objects that rotate and reveal details on hover.',
    category: 'portfolio',
    tags: ['3d', 'dark-theme', 'webgl', 'three-js', 'immersive', 'particles'],
    source_url: 'https://threejs.org/examples',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#00AAFF',
        secondary: '#0A0A0F',
        accent: '#FF66AA',
        background: '#050505',
        textPrimary: '#F0F0F0',
        textSecondary: '#666677',
      },
      typography: {
        fontFamilies: { primary: 'Space Grotesk', heading: 'Space Grotesk' },
        fontSizes: { h1: '64px', h2: '40px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Grid-Based Portfolio',
    description: 'Masonry grid portfolio with asymmetric card sizes, category filtering tabs, and smooth layout shifts. Clean white background with project-specific color accents per card. Features hover-reveal titles and subtle scale animations.',
    category: 'portfolio',
    tags: ['grid', 'light-theme', 'masonry', 'filtering', 'cards', 'asymmetric'],
    source_url: 'https://dribbble.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#EA4C89',
        secondary: '#F8F7F4',
        accent: '#1769FF',
        background: '#FFFFFF',
        textPrimary: '#0D0C22',
        textSecondary: '#6E6D7A',
      },
      typography: {
        fontFamilies: { primary: 'Haas Grotesk', heading: 'Haas Grotesk' },
        fontSizes: { h1: '44px', h2: '28px', h3: '20px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '12px' },
    },
  },
  {
    name: 'Single-Page Portfolio',
    description: 'One-page scrolling portfolio with full-viewport project sections and horizontal scroll galleries. Sticky navigation with active section indicators. Features smooth snap-scrolling between projects and parallax background layers.',
    category: 'portfolio',
    tags: ['single-page', 'dark-theme', 'scroll-snap', 'parallax', 'full-viewport', 'sticky-nav'],
    source_url: 'https://onepagelove.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#E8E8E8',
        secondary: '#1E1E24',
        accent: '#FFD700',
        background: '#0F0F14',
        textPrimary: '#E8E8E8',
        textSecondary: '#8888A0',
      },
      typography: {
        fontFamilies: { primary: 'Sora', heading: 'Sora' },
        fontSizes: { h1: '72px', h2: '44px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Interactive Portfolio',
    description: 'Highly interactive portfolio with custom cursors, magnetic buttons, text distortion effects, and GSAP-powered transitions. Dark theme with neon green accents. Each project section features unique micro-interactions and scroll triggers.',
    category: 'portfolio',
    tags: ['interactive', 'dark-theme', 'gsap', 'micro-interactions', 'neon', 'cursor'],
    source_url: 'https://www.sbs.com.au/theboat',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#39FF14',
        secondary: '#111111',
        accent: '#FF00FF',
        background: '#0A0A0A',
        textPrimary: '#FFFFFF',
        textSecondary: '#777777',
      },
      typography: {
        fontFamilies: { primary: 'Space Mono', heading: 'Space Grotesk' },
        fontSizes: { h1: '80px', h2: '48px', h3: '28px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '0px' },
    },
  },

  // =========================================
  // BLOG (8)
  // =========================================
  {
    name: 'Medium Blog',
    description: 'Content-first reading platform with clap reactions, highlighted passages, and follow recommendations. Warm serif typography on clean white with a focus on readability. Features reading time estimates, series collections, and audio narration.',
    category: 'blog',
    tags: ['reading', 'light-theme', 'serif', 'content-first', 'social', 'readability'],
    source_url: 'https://medium.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#000000',
        secondary: '#F2F2F2',
        accent: '#1A8917',
        background: '#FFFFFF',
        textPrimary: '#242424',
        textSecondary: '#6B6B6B',
      },
      typography: {
        fontFamilies: { primary: 'Georgia', heading: 'Sohne' },
        fontSizes: { h1: '42px', h2: '32px', h3: '22px', body: '20px' },
      },
      spacing: { baseUnit: 8, borderRadius: '4px' },
    },
  },
  {
    name: 'Substack Blog',
    description: 'Newsletter-first blog with email subscription CTAs, discussion threads, and paid content gates. Clean white layout with traditional serif headlines. Features podcast player, community notes, and recommendation networks.',
    category: 'blog',
    tags: ['newsletter', 'light-theme', 'subscription', 'serif', 'discussions', 'community'],
    source_url: 'https://substack.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#FF6719',
        secondary: '#F7F5F2',
        accent: '#FF6719',
        background: '#FFFFFF',
        textPrimary: '#1A1A1A',
        textSecondary: '#7C7C7C',
      },
      typography: {
        fontFamilies: { primary: 'Charter', heading: 'Charter' },
        fontSizes: { h1: '40px', h2: '28px', h3: '22px', body: '18px' },
      },
      spacing: { baseUnit: 8, borderRadius: '4px' },
    },
  },
  {
    name: 'Ghost Blog',
    description: 'Headless CMS blog with membership tiers, dark mode toggle, and newsletter integration. Minimalist design with focus on long-form reading. Features tag-based archives, author profiles, and built-in SEO cards.',
    category: 'blog',
    tags: ['cms', 'dark-theme', 'membership', 'headless', 'long-form', 'minimal'],
    source_url: 'https://ghost.org',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#FFFFFF',
        secondary: '#1D1D1F',
        accent: '#15171A',
        background: '#0F1014',
        textPrimary: '#EEEEEE',
        textSecondary: '#A0A0A0',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Cardo' },
        fontSizes: { h1: '44px', h2: '32px', h3: '24px', body: '18px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Hashnode Blog',
    description: 'Developer blogging platform with syntax-highlighted code blocks, article series, and GitHub-backed publishing. Blue-accented light theme with markdown-first editing. Features custom domains, analytics dashboards, and tech-tag discovery.',
    category: 'blog',
    tags: ['developer', 'light-theme', 'code', 'markdown', 'series', 'blue'],
    source_url: 'https://hashnode.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#2962FF',
        secondary: '#F0F4FF',
        accent: '#2962FF',
        background: '#FFFFFF',
        textPrimary: '#1E2735',
        textSecondary: '#6B7A90',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '40px', h2: '28px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Dev.to Blog',
    description: 'Community-driven developer blog with reaction badges, comment threads, and tag-based feeds. Friendly light theme with playful illustrations. Features reading lists, podcast episodes, listings board, and organization profiles.',
    category: 'blog',
    tags: ['developer', 'light-theme', 'community', 'tags', 'reactions', 'friendly'],
    source_url: 'https://dev.to',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#3B49DF',
        secondary: '#F5F5F5',
        accent: '#3B49DF',
        background: '#F5F5F5',
        textPrimary: '#090909',
        textSecondary: '#575757',
      },
      typography: {
        fontFamilies: { primary: 'Segoe UI', heading: 'Segoe UI' },
        fontSizes: { h1: '36px', h2: '28px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '6px' },
    },
  },
  {
    name: 'CSS-Tricks Blog',
    description: 'Web development blog with inline CodePen embeds, almanac reference sections, and tutorial guides. Distinctive orange accent on dark background. Features trick snippets, community-contributed articles, and video screencasts.',
    category: 'blog',
    tags: ['web-dev', 'dark-theme', 'tutorials', 'codepen', 'orange', 'snippets'],
    source_url: 'https://css-tricks.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#FF7A18',
        secondary: '#1D1E22',
        accent: '#E8C547',
        background: '#151519',
        textPrimary: '#E0DCCE',
        textSecondary: '#8D8877',
      },
      typography: {
        fontFamilies: { primary: 'MD Primer', heading: 'Rubik' },
        fontSizes: { h1: '40px', h2: '28px', h3: '22px', body: '18px' },
      },
      spacing: { baseUnit: 8, borderRadius: '4px' },
    },
  },
  {
    name: 'Smashing Magazine Blog',
    description: 'Front-end development magazine with long-form technical articles, book excerpts, and conference previews. Warm red accent on light cream background. Features checklists, comparison tables, and author bio cards with expertise tags.',
    category: 'blog',
    tags: ['magazine', 'light-theme', 'technical', 'long-form', 'red', 'front-end'],
    source_url: 'https://smashingmagazine.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#D33A2C',
        secondary: '#F5F1E8',
        accent: '#D33A2C',
        background: '#FFFFFF',
        textPrimary: '#2E2E2E',
        textSecondary: '#6E6E6E',
      },
      typography: {
        fontFamilies: { primary: 'Elena', heading: 'Mija' },
        fontSizes: { h1: '44px', h2: '32px', h3: '24px', body: '18px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'The Verge Blog',
    description: 'Tech news publication with bold headline stacking, embedded media players, and score card reviews. High-energy dark theme with saturated accent colors. Features live blogs, product databases, and immersive feature story layouts.',
    category: 'blog',
    tags: ['tech-news', 'dark-theme', 'bold', 'media', 'reviews', 'publication'],
    source_url: 'https://theverge.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#EC008C',
        secondary: '#1E1E1E',
        accent: '#3CFFD0',
        background: '#121212',
        textPrimary: '#FFFFFF',
        textSecondary: '#A0A0A0',
      },
      typography: {
        fontFamilies: { primary: 'Polysans', heading: 'Polysans' },
        fontSizes: { h1: '52px', h2: '36px', h3: '24px', body: '17px' },
      },
      spacing: { baseUnit: 8, borderRadius: '4px' },
    },
  },

  // =========================================
  // MARKETING (8)
  // =========================================
  {
    name: 'Mailchimp Marketing',
    description: 'Email marketing platform with playful Freddie mascot illustrations, campaign builders, and audience segmentation. Yellow brand accent on white with hand-drawn illustration style. Features template galleries and A/B test result cards.',
    category: 'marketing',
    tags: ['email', 'light-theme', 'playful', 'illustrations', 'yellow', 'campaigns'],
    source_url: 'https://mailchimp.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#FFE01B',
        secondary: '#F6F6F4',
        accent: '#007C89',
        background: '#FFFFFF',
        textPrimary: '#241C15',
        textSecondary: '#6B6B6B',
      },
      typography: {
        fontFamilies: { primary: 'Graphik', heading: 'Means' },
        fontSizes: { h1: '52px', h2: '36px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'HubSpot Marketing',
    description: 'Inbound marketing platform with CRM integration, pipeline visualizations, and content hub. Orange-accented corporate design with clean card layouts. Features ROI calculators, certification badges, and marketing automation flowcharts.',
    category: 'marketing',
    tags: ['crm', 'light-theme', 'orange', 'inbound', 'automation', 'corporate'],
    source_url: 'https://hubspot.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#FF7A59',
        secondary: '#F5F8FA',
        accent: '#00BDA5',
        background: '#FFFFFF',
        textPrimary: '#33475B',
        textSecondary: '#7C98B6',
      },
      typography: {
        fontFamilies: { primary: 'Lexend Deca', heading: 'Lexend Deca' },
        fontSizes: { h1: '48px', h2: '32px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Intercom Marketing',
    description: 'Customer messaging platform with chatbot flow diagrams, inbox previews, and resolution time metrics. Clean white design with blue accents and friendly illustration style. Features product tour builders and help center templates.',
    category: 'marketing',
    tags: ['messaging', 'light-theme', 'chatbot', 'blue', 'illustrations', 'customer-support'],
    source_url: 'https://intercom.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#286EFA',
        secondary: '#F5F7FA',
        accent: '#1B1B1D',
        background: '#FFFFFF',
        textPrimary: '#1B1B1D',
        textSecondary: '#65676B',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '56px', h2: '36px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '12px' },
    },
  },
  {
    name: 'Webflow Marketing',
    description: 'Visual web builder with drag-and-drop demos, CMS showcases, and interaction timeline previews. Blue-accented dark theme with glass-morphism effects. Features responsive design breakpoint previews and no-code logic flow diagrams.',
    category: 'marketing',
    tags: ['no-code', 'dark-theme', 'visual-builder', 'blue', 'interactions', 'glass'],
    source_url: 'https://webflow.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#4353FF',
        secondary: '#1A1A2E',
        accent: '#FFCD4B',
        background: '#0E0E1A',
        textPrimary: '#FFFFFF',
        textSecondary: '#A0A0B4',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '56px', h2: '40px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '12px' },
    },
  },
  {
    name: 'Squarespace Marketing',
    description: 'Website builder landing with cinematic template previews and full-screen video backgrounds. Elegant black-on-white with serif headlines. Features industry-specific template carousels, domain search, and scheduling integration showcases.',
    category: 'marketing',
    tags: ['website-builder', 'light-theme', 'elegant', 'templates', 'video', 'serif'],
    source_url: 'https://squarespace.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#000000',
        secondary: '#F3F3F3',
        accent: '#000000',
        background: '#FFFFFF',
        textPrimary: '#000000',
        textSecondary: '#767676',
      },
      typography: {
        fontFamilies: { primary: 'Helvetica Neue', heading: 'Clarkson' },
        fontSizes: { h1: '56px', h2: '40px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '0px' },
    },
  },
  {
    name: 'Wix Marketing',
    description: 'Website builder with AI site generation demos, drag-and-drop editor previews, and app marketplace showcases. Vibrant blue with multi-color section accents. Features industry template galleries and business solution packages.',
    category: 'marketing',
    tags: ['website-builder', 'light-theme', 'ai', 'vibrant', 'blue', 'app-marketplace'],
    source_url: 'https://wix.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#0C6EFC',
        secondary: '#F0F4FF',
        accent: '#FF6B4A',
        background: '#FFFFFF',
        textPrimary: '#20303C',
        textSecondary: '#577083',
      },
      typography: {
        fontFamilies: { primary: 'Madefor', heading: 'Madefor' },
        fontSizes: { h1: '52px', h2: '36px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Carrd Landing Builder',
    description: 'Single-page site builder with a hyper-minimal interface, one-column templates, and instant publishing. Clean white with subtle gray accents. Features profile cards, link-in-bio layouts, and simple form integrations.',
    category: 'marketing',
    tags: ['landing-builder', 'light-theme', 'minimal', 'single-page', 'link-in-bio', 'simple'],
    source_url: 'https://carrd.co',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#2D2D2D',
        secondary: '#F5F5F5',
        accent: '#4A8CFF',
        background: '#FFFFFF',
        textPrimary: '#2D2D2D',
        textSecondary: '#999999',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '40px', h2: '28px', h3: '20px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '6px' },
    },
  },
  {
    name: 'Typedream Marketing',
    description: 'No-code Notion-style website builder with block-based editing and AI content generation. Soft purple gradients on white with rounded UI elements. Features template marketplace, custom domain setup, and SEO optimization panels.',
    category: 'marketing',
    tags: ['no-code', 'light-theme', 'purple', 'notion-style', 'ai', 'blocks'],
    source_url: 'https://typedream.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#7C5CFC',
        secondary: '#F8F5FF',
        accent: '#FF6B8A',
        background: '#FFFFFF',
        textPrimary: '#1A1A1A',
        textSecondary: '#6B6B8D',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '52px', h2: '36px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '12px' },
    },
  },

  // =========================================
  // DOCUMENTATION (8)
  // =========================================
  {
    name: 'Stripe Docs',
    description: 'API documentation with multi-language code samples, interactive request builders, and collapsible parameter tables. Dark sidebar with light content area. Features webhook event simulators, API changelog, and versioned endpoint references.',
    category: 'documentation',
    tags: ['api', 'light-theme', 'code-samples', 'interactive', 'multi-language', 'reference'],
    source_url: 'https://docs.stripe.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#635BFF',
        secondary: '#F6F9FC',
        accent: '#0A2540',
        background: '#FFFFFF',
        textPrimary: '#2A2F45',
        textSecondary: '#697386',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '32px', h2: '24px', h3: '18px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '6px' },
    },
  },
  {
    name: 'MDN Web Docs',
    description: 'Comprehensive web platform documentation with browser compatibility tables, interactive examples, and specification links. Clean light theme with purple navigation sidebar. Features live code playgrounds and community contribution badges.',
    category: 'documentation',
    tags: ['web-standards', 'light-theme', 'reference', 'compatibility', 'interactive', 'community'],
    source_url: 'https://developer.mozilla.org',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#1B1B1B',
        secondary: '#F9F9FB',
        accent: '#3584E4',
        background: '#FFFFFF',
        textPrimary: '#1B1B1B',
        textSecondary: '#696969',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '36px', h2: '28px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '4px' },
    },
  },
  {
    name: 'Tailwind CSS Docs',
    description: 'Utility-first CSS framework docs with searchable class reference, responsive preview tables, and copy-paste examples. Dark sidebar navigation with light content panels. Features visual spacing and color palette references.',
    category: 'documentation',
    tags: ['css', 'dark-theme', 'utility', 'searchable', 'class-reference', 'preview'],
    source_url: 'https://tailwindcss.com/docs',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#38BDF8',
        secondary: '#1E293B',
        accent: '#F472B6',
        background: '#0F172A',
        textPrimary: '#E2E8F0',
        textSecondary: '#94A3B8',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '32px', h2: '24px', h3: '18px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '6px' },
    },
  },
  {
    name: 'Next.js Docs',
    description: 'React framework docs with file-based routing diagrams, data fetching pattern guides, and deployment checklists. Dark theme with clean hierarchy and breadcrumb navigation. Features App Router vs Pages Router toggle and TypeScript examples.',
    category: 'documentation',
    tags: ['react', 'dark-theme', 'framework', 'routing', 'typescript', 'file-based'],
    source_url: 'https://nextjs.org/docs',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#FFFFFF',
        secondary: '#1A1A1A',
        accent: '#0070F3',
        background: '#000000',
        textPrimary: '#EDEDED',
        textSecondary: '#888888',
      },
      typography: {
        fontFamilies: { primary: 'Geist', heading: 'Geist' },
        fontSizes: { h1: '36px', h2: '24px', h3: '18px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '6px' },
    },
  },
  {
    name: 'Supabase Docs',
    description: 'Backend-as-a-service docs with database setup guides, auth flow diagrams, and real-time subscription examples. Dark theme with green brand accents and tabbed code samples. Features SQL snippets, client library references, and migration guides.',
    category: 'documentation',
    tags: ['backend', 'dark-theme', 'database', 'auth', 'real-time', 'green'],
    source_url: 'https://supabase.com/docs',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#3ECF8E',
        secondary: '#1C1C1C',
        accent: '#3ECF8E',
        background: '#131313',
        textPrimary: '#EDEDED',
        textSecondary: '#8F8F8F',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '32px', h2: '24px', h3: '18px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '6px' },
    },
  },
  {
    name: 'Vercel Docs',
    description: 'Platform docs with deployment configuration guides, serverless function references, and framework-specific quickstarts. Monochrome dark theme with blue link accents. Features project structure diagrams and environment variable tables.',
    category: 'documentation',
    tags: ['platform', 'dark-theme', 'deployment', 'serverless', 'monochrome', 'quickstart'],
    source_url: 'https://vercel.com/docs',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#FFFFFF',
        secondary: '#1A1A1A',
        accent: '#0070F3',
        background: '#000000',
        textPrimary: '#EDEDED',
        textSecondary: '#666666',
      },
      typography: {
        fontFamilies: { primary: 'Geist', heading: 'Geist' },
        fontSizes: { h1: '32px', h2: '24px', h3: '18px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '6px' },
    },
  },
  {
    name: 'Remix Docs',
    description: 'Full-stack React framework docs with loader/action pattern tutorials, nested routing visualizations, and progressive enhancement guides. Dark blue-gray theme with warm accents. Features migration guides and web-standard API references.',
    category: 'documentation',
    tags: ['react', 'dark-theme', 'full-stack', 'routing', 'progressive-enhancement', 'web-standards'],
    source_url: 'https://remix.run/docs',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#E8F2FF',
        secondary: '#1F2028',
        accent: '#3992FF',
        background: '#121317',
        textPrimary: '#F0F6FF',
        textSecondary: '#8990A0',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '36px', h2: '24px', h3: '18px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Prisma Docs',
    description: 'ORM documentation with schema modeling guides, query builder references, and migration workflow tutorials. Dark teal-accented theme with entity relationship diagram examples. Features multi-database adapter guides and TypeScript integration patterns.',
    category: 'documentation',
    tags: ['orm', 'dark-theme', 'database', 'schema', 'typescript', 'teal'],
    source_url: 'https://prisma.io/docs',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#5A67D8',
        secondary: '#1A202C',
        accent: '#16A394',
        background: '#0D1117',
        textPrimary: '#E2E8F0',
        textSecondary: '#A0AEC0',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Barlow' },
        fontSizes: { h1: '36px', h2: '24px', h3: '18px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },

  // =========================================
  // CORPORATE (10)
  // =========================================
  {
    name: 'Google Corporate',
    description: 'Clean corporate site with Material Design system, product suite navigation, and Google Fonts typography. White background with signature multi-color logo accents. Features product cards, blog grids, and enterprise solution pages.',
    category: 'corporate',
    tags: ['tech', 'light-theme', 'material-design', 'multi-color', 'enterprise', 'clean'],
    source_url: 'https://about.google',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#4285F4',
        secondary: '#F8F9FA',
        accent: '#34A853',
        background: '#FFFFFF',
        textPrimary: '#202124',
        textSecondary: '#5F6368',
      },
      typography: {
        fontFamilies: { primary: 'Google Sans', heading: 'Google Sans' },
        fontSizes: { h1: '48px', h2: '36px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Microsoft Corporate',
    description: 'Enterprise corporate site with product ecosystem navigation, case study highlights, and cloud solution showcases. Clean light theme with Fluent Design touches. Features accessibility commitments, sustainability reports, and partner program sections.',
    category: 'corporate',
    tags: ['enterprise', 'light-theme', 'fluent-design', 'cloud', 'accessibility', 'ecosystem'],
    source_url: 'https://microsoft.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#0078D4',
        secondary: '#F3F2F1',
        accent: '#0078D4',
        background: '#FFFFFF',
        textPrimary: '#1B1A19',
        textSecondary: '#605E5C',
      },
      typography: {
        fontFamilies: { primary: 'Segoe UI', heading: 'Segoe UI' },
        fontSizes: { h1: '46px', h2: '32px', h3: '22px', body: '15px' },
      },
      spacing: { baseUnit: 8, borderRadius: '4px' },
    },
  },
  {
    name: 'Amazon Corporate',
    description: 'E-commerce giant corporate site with AWS service showcase, sustainability initiatives, and innovation stories. Orange-accented dark header with white content sections. Features press releases, job listings, and fulfillment center stories.',
    category: 'corporate',
    tags: ['e-commerce', 'light-theme', 'orange', 'aws', 'innovation', 'press'],
    source_url: 'https://aboutamazon.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#FF9900',
        secondary: '#F2F2F2',
        accent: '#146EB4',
        background: '#FFFFFF',
        textPrimary: '#0F1111',
        textSecondary: '#565959',
      },
      typography: {
        fontFamilies: { primary: 'Amazon Ember', heading: 'Amazon Ember' },
        fontSizes: { h1: '44px', h2: '32px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Salesforce Corporate',
    description: 'CRM platform corporate site with Trailhead learning paths, customer success stories, and product tower navigation. Blue-accented light theme with friendly character illustrations. Features event listings and industry solution pages.',
    category: 'corporate',
    tags: ['crm', 'light-theme', 'blue', 'illustrations', 'trailhead', 'customer-success'],
    source_url: 'https://salesforce.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#1798C1',
        secondary: '#EEF4F7',
        accent: '#0176D3',
        background: '#FFFFFF',
        textPrimary: '#181818',
        textSecondary: '#706E6B',
      },
      typography: {
        fontFamilies: { primary: 'Salesforce Sans', heading: 'Salesforce Sans' },
        fontSizes: { h1: '48px', h2: '32px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Adobe Corporate',
    description: 'Creative cloud corporate site with product previews, artist spotlight galleries, and creative challenge showcases. Dark theme with red accent and media-rich layouts. Features Behance integration, stock library previews, and font discovery.',
    category: 'corporate',
    tags: ['creative', 'dark-theme', 'red', 'media-rich', 'artists', 'cloud'],
    source_url: 'https://adobe.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#FA0F00',
        secondary: '#2C2C2C',
        accent: '#1473E6',
        background: '#1B1B1B',
        textPrimary: '#FFFFFF',
        textSecondary: '#B3B3B3',
      },
      typography: {
        fontFamilies: { primary: 'Adobe Clean', heading: 'Adobe Clean' },
        fontSizes: { h1: '52px', h2: '36px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'IBM Corporate',
    description: 'Enterprise technology corporate site with Carbon Design System, research paper highlights, and quantum computing showcases. Cool blue palette with structured grid layouts. Features thought leadership articles and sustainability commitments.',
    category: 'corporate',
    tags: ['enterprise', 'light-theme', 'carbon-design', 'blue', 'research', 'structured'],
    source_url: 'https://ibm.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#0F62FE',
        secondary: '#F4F4F4',
        accent: '#0F62FE',
        background: '#FFFFFF',
        textPrimary: '#161616',
        textSecondary: '#525252',
      },
      typography: {
        fontFamilies: { primary: 'IBM Plex Sans', heading: 'IBM Plex Sans' },
        fontSizes: { h1: '54px', h2: '36px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '0px' },
    },
  },
  {
    name: 'Atlassian Corporate',
    description: 'Team software corporate site with product suite navigation, teamwork philosophy content, and customer stories. Blue-accented light design with bold illustration style. Features Jira, Confluence, and Trello integration showcases.',
    category: 'corporate',
    tags: ['teamwork', 'light-theme', 'blue', 'illustrations', 'product-suite', 'collaboration'],
    source_url: 'https://atlassian.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#0052CC',
        secondary: '#F4F5F7',
        accent: '#FF5630',
        background: '#FFFFFF',
        textPrimary: '#172B4D',
        textSecondary: '#6B778C',
      },
      typography: {
        fontFamilies: { primary: 'Charlie Display', heading: 'Charlie Display' },
        fontSizes: { h1: '48px', h2: '32px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '4px' },
    },
  },
  {
    name: 'Twilio Corporate',
    description: 'Communications API corporate site with code-first messaging, SendGrid email integration, and Segment data platform. Red-accented light theme with developer documentation links. Features API endpoint showcases and customer engagement metrics.',
    category: 'corporate',
    tags: ['communications', 'light-theme', 'red', 'api', 'developer', 'messaging'],
    source_url: 'https://twilio.com',
    tokens: {
      colorScheme: 'light',
      colors: {
        primary: '#F22F46',
        secondary: '#F4F4F6',
        accent: '#0D122B',
        background: '#FFFFFF',
        textPrimary: '#121C2D',
        textSecondary: '#606B85',
      },
      typography: {
        fontFamilies: { primary: 'Whitney', heading: 'Whitney' },
        fontSizes: { h1: '48px', h2: '32px', h3: '22px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Cloudflare Corporate',
    description: 'Internet infrastructure corporate site with network map visualizations, DDoS mitigation dashboards, and performance benchmarks. Orange-accented dark theme with technical diagrams. Features developer platform, Workers showcase, and security reports.',
    category: 'corporate',
    tags: ['infrastructure', 'dark-theme', 'orange', 'security', 'network', 'performance'],
    source_url: 'https://cloudflare.com',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#F6821F',
        secondary: '#1A1A2E',
        accent: '#FBAD41',
        background: '#0D0D1A',
        textPrimary: '#FFFFFF',
        textSecondary: '#A5A5BA',
      },
      typography: {
        fontFamilies: { primary: 'Inter', heading: 'Inter' },
        fontSizes: { h1: '48px', h2: '36px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '8px' },
    },
  },
  {
    name: 'Datadog Corporate',
    description: 'Observability platform corporate site with monitoring dashboard previews, integration logos grid, and pricing comparison tables. Purple-accented dark theme with data visualization samples. Features case studies, partner ecosystem, and compliance certifications.',
    category: 'corporate',
    tags: ['observability', 'dark-theme', 'purple', 'monitoring', 'integrations', 'enterprise'],
    source_url: 'https://datadoghq.com/about',
    tokens: {
      colorScheme: 'dark',
      colors: {
        primary: '#632CA6',
        secondary: '#23202E',
        accent: '#49C5B6',
        background: '#130F25',
        textPrimary: '#E4DFED',
        textSecondary: '#938CA5',
      },
      typography: {
        fontFamilies: { primary: 'Roboto', heading: 'Roboto' },
        fontSizes: { h1: '48px', h2: '36px', h3: '24px', body: '16px' },
      },
      spacing: { baseUnit: 8, borderRadius: '6px' },
    },
  },
];

// =============================================
// HELPERS
// =============================================

async function generateEmbedding(
  text: string
): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1536,
  });
  return response.data[0].embedding;
}

function buildSearchText(pattern: SeedPattern): string {
  const parts = [
    pattern.name,
    pattern.description,
    `Category: ${pattern.category}`,
    `Tags: ${pattern.tags.join(', ')}`,
    `Color scheme: ${pattern.tokens.colorScheme}`,
    `Primary color: ${pattern.tokens.colors.primary}`,
    `Fonts: ${pattern.tokens.typography.fontFamilies.primary}, ${pattern.tokens.typography.fontFamilies.heading}`,
  ];
  return parts.join('. ');
}

// =============================================
// SEED RUNNER
// =============================================

async function seed() {
  console.log(
    `Seeding ${SEED_PATTERNS.length} design patterns...\n`
  );

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < SEED_PATTERNS.length; i++) {
    const pattern = SEED_PATTERNS[i];
    const label = `[${String(i + 1).padStart(3)}/${SEED_PATTERNS.length}]`;
    console.log(`${label} ${pattern.name}`);

    try {
      const searchText = buildSearchText(pattern);
      const embedding = await generateEmbedding(searchText);

      const { error } = await supabase
        .from('design_patterns')
        .upsert(
          {
            name: pattern.name,
            description: pattern.description,
            category: pattern.category,
            tags: pattern.tags,
            source_url: pattern.source_url,
            tokens: pattern.tokens,
            embedding,
          },
          { onConflict: 'source_url' }
        );

      if (error) {
        console.error(`       Error: ${error.message}`);
        failed++;
      } else {
        console.log(`       Done`);
        succeeded++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`       Error: ${msg}`);
      failed++;
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(
    `\nSeeding complete: ${succeeded} succeeded, ${failed} failed out of ${SEED_PATTERNS.length} total.`
  );
}

seed().catch(console.error);
