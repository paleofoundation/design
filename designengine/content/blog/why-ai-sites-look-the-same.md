---
title: "Why Every AI-Built Site Looks the Same (and How to Fix It)"
slug: "why-ai-sites-look-the-same"
date: "2026-02-20"
excerpt: "AI coding tools produce 'visual elevator music' — sites that converge on identical layouts, fonts, and spacing. Here's why it happens and what design-first developers can do about it."
author: "Refine Design"
tags: ["design theory", "AI", "web design"]
---

There's a new aesthetic emerging across the web, and it's not a good one.

Open any site built with Cursor, Bolt, Lovable, or v0 in the last six months and you'll notice it: the same Inter or Geist font. The same 16px body text. The same indigo-to-purple gradient on the hero. The same rounded-lg cards with shadow-md. The same feel.

Designers call it **visual elevator music** — inoffensive, forgettable, and everywhere.

## Why does this happen?

AI models learn from the same corpus of popular templates and component libraries. When you ask "build me a landing page," the model reaches for the statistical center of what a landing page looks like. That center is Tailwind's default palette, Shadcn's component shapes, and whatever Inter-based layout appeared most often in the training data.

The result isn't bad per se — it's just not *yours*.

## The dead giveaways

Once you know what to look for, AI-built sites are immediately recognizable:

- **Generic stock imagery** that doesn't match the brand palette
- **Uniform spacing** — everything is `p-4` or `gap-6`, with no intentional rhythm
- **Default favicon** (or none at all) — the single biggest "I didn't care" signal
- **No micro-interactions** — everything is static
- **Cookie-cutter typography** — Inter + whatever, no custom pairing logic
- **No motion or delight** — the site feels like a document, not an experience

## What custom-built sites do differently

The sites that feel hand-crafted share a few traits:

1. **Branded micro-interactions**: hover animations, cursor effects, loading states with personality
2. **Custom typography**: intentional font pairings with variable weights and proper hierarchy
3. **Color coherence**: every element — illustrations, shadows, borders — derives from the same token system
4. **Motion design**: scroll-triggered animations, parallax, purposeful transitions
5. **Whimsical details**: small creative touches that signal a human made deliberate choices

## The fix

The answer isn't to stop using AI — it's to give AI better instructions.

That's why we built Refine Design. Instead of letting your AI pick defaults, you complete a 5-minute design interview that captures your actual intent: your colors, typography scale, spacing density, corner radii, shadow style, and animation preferences.

The output is a structured design profile that your AI coding tools read via MCP before writing a single line of code. Every `className`, every CSS variable, every component pattern comes from *your* design system, not the model's training data.

The result: sites that are still built in minutes, but look like they took months.

[Start your design interview →](/onboarding)
