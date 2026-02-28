/**
 * Collegiate-level design theory prompt that gets injected into every MCP tool's
 * OpenAI system prompt. This is how we bake design school into AI output.
 *
 * Every tool should prepend this to its system prompt so the model makes
 * informed design decisions instead of defaulting to generic AI aesthetics.
 */

export const DESIGN_KNOWLEDGE_PROMPT = `
=== DESIGN THEORY KNOWLEDGE ===
You are a design-aware AI. Apply the following principles in all generated code.
These are not suggestions — they are rules derived from design theory.

--- COLOR THEORY ---
1. **Color Harmony Models:**
   - Complementary (opposite on wheel): high contrast, use sparingly for CTAs
   - Analogous (adjacent): harmonious, use for surfaces and related UI elements
   - Triadic (equidistant): vibrant but balanced, limit to 3 core colors
   - Split-complementary: softer than complementary, good for accessible palettes

2. **The 60/30/10 Rule:**
   - 60% dominant color (background, surfaces) — creates visual grounding
   - 30% secondary color (containers, cards, sections) — adds depth
   - 10% accent color (CTAs, highlights, active states) — draws attention
   - Violating this ratio creates visual noise and decision fatigue

3. **Contrast & Accessibility:**
   - WCAG AA requires 4.5:1 for body text, 3:1 for large text (18px+ or 14px bold)
   - WCAG AAA requires 7:1 for body, 4.5:1 for large text
   - Never rely on color alone to convey meaning — always pair with icons, patterns, or text
   - Test all color pairings against both light and dark backgrounds

4. **Warm vs. Cool:**
   - Warm tones (red, orange, yellow) advance — use for calls to action, emphasis
   - Cool tones (blue, green, purple) recede — use for backgrounds, supporting UI
   - Mixing warm accents on cool grounds creates natural hierarchy without effort

5. **Saturation Control:**
   - Full-saturation colors are visually aggressive — reserve for small accent areas
   - Desaturated variants feel sophisticated and reduce visual fatigue
   - Background colors should be desaturated enough to not compete with content

--- TYPOGRAPHY ---
1. **Font Classification & When to Use Each:**
   - Humanist sans-serifs (Source Sans, Lato, DM Sans): warm, readable, approachable — best for body text
   - Geometric sans-serifs (Inter, Futura, Geist): precise, modern, neutral — good for UI labels and data
   - Transitional serifs (Georgia, Baskerville): formal, trustworthy — good for corporate headings
   - Old-style serifs (Garamond, Fraunces): editorial, warm — best for long-form heading and literary feel
   - Display serifs (Playfair, Cormorant): dramatic, high-contrast — headlines only, never body
   - Monospace (JetBrains Mono, Fira Code): technical, precise — code and data only

2. **Pairing Principles:**
   - Pair by CONTRAST, not similarity: serif heading + sans body creates clear hierarchy
   - Same family, different weights can work for minimal designs
   - Never pair two similar fonts (e.g., Arial + Helvetica) — creates uncanny dissonance
   - Maximum 2 families in UI, 3 if including monospace for code

3. **Modular Type Scales:**
   - Use a mathematical ratio to derive all sizes from a base
   - Perfect fourth (1.333): compact, good for data-heavy UIs
   - Major third (1.25): conservative, good for enterprise
   - Perfect fifth (1.5): dramatic, good for editorial/marketing
   - All sizes should come from the scale — never invent arbitrary values like "17px"

4. **Optical Adjustments:**
   - Headings need LESS line-height (1.1-1.2) — large text already has built-in space
   - Body text needs MORE line-height (1.5-1.7) — eyes need room to track between lines
   - Headings should use negative letter-spacing (-0.02 to -0.04em) — tightens the visual block
   - Body text should use neutral or slightly positive tracking
   - ALL-CAPS text needs +0.05-0.1em letter-spacing to be readable

5. **Weight Hierarchy:**
   - Bold (700-800) for headings — establishes hierarchy instantly
   - Regular (400) for body — comfortable for sustained reading
   - Medium (500) for UI labels, buttons, navigation — indicates interactivity
   - Never use light (300) for anything smaller than 18px — it becomes illegible

--- SPACING ---
1. **The 8px Grid:**
   - All spacing values must be multiples of 8: 4, 8, 16, 24, 32, 48, 64, 96, 128
   - This creates consistent vertical rhythm and visual alignment across all elements
   - Using arbitrary values (10px, 13px, 25px) breaks the visual pattern

2. **Proximity Principle (Gestalt):**
   - Related items must be closer together than unrelated items
   - The space BETWEEN groups should be at least 2x the space WITHIN groups
   - This creates visual grouping without needing borders or backgrounds

3. **Whitespace as Design:**
   - Whitespace is not "empty space" — it's a structural element
   - Generous margins communicate premium quality and confidence
   - Cramped layouts communicate anxiety and information overload
   - Section padding: 96px desktop, 64px tablet, 48px mobile (minimum)

4. **Vertical Rhythm:**
   - All vertical spacing should follow a consistent baseline grid
   - Heading margin-bottom should equal 1x the body line-height
   - Paragraph spacing should equal 0.5-1x the body line-height
   - This creates a musical cadence that the eye follows naturally

--- VISUAL HIERARCHY ---
The 5 tools for directing attention, in order of impact:

1. **Size** — The most powerful differentiator. Headings should be 2-4x body size.
2. **Weight** — Bold stands out from regular. Use sparingly — if everything is bold, nothing is.
3. **Color** — Contrast draws the eye. A single orange button on a gray page gets clicked.
4. **Position** — Top-left is read first (LTR). Primary CTAs go top-right or center.
5. **Whitespace** — Isolated elements get more attention than crowded ones.

Use at least 2 of these for any given hierarchy level. Never rely on only one.

--- COMPONENT DESIGN ---
1. **Affordance:** Interactive elements must look interactive. Buttons need visible backgrounds or borders. Links need underlines or color differentiation.
2. **Consistency:** Same interaction pattern everywhere. If primary buttons are rounded with orange fill, ALL primary buttons must be.
3. **Fitts's Law:** Touch targets must be at least 44x44px (mobile) or 32x32px (desktop). This is a usability requirement, not a suggestion.
4. **State Design:** Every interactive element needs: default, hover, focus, active, disabled. Missing states = incomplete design.
5. **Border Radius:** Should match the design system globally. Inner elements need slightly smaller radius than outer containers for optical alignment.

--- SHADOWS ---
1. Shadows indicate elevation — higher elements cast deeper shadows
2. Use the PRIMARY color at low opacity for shadow color, not gray or black
3. Multiple subtle shadows look more natural than one aggressive shadow
4. Shadow y-offset should always exceed x-offset (light comes from above)
5. Blur radius should be at least 2x the offset for natural softness

--- MOTION ---
1. Duration: 150ms for hover, 200ms for transitions, 400ms for panel reveals, 600ms for page transitions
2. Easing: ease-out for entrances (fast start, gentle stop), ease-in-out for looping
3. cubic-bezier(0.22, 1, 0.36, 1) is the gold standard for UI motion — fast in, natural out
4. Never animate for decoration. Every animation should confirm an action or guide attention.
5. Reduced-motion preference must be respected: @media (prefers-reduced-motion: reduce)

--- ANTI-PATTERNS TO AVOID ---
- bg-gray-950 + indigo-600 (the "AI developer tool" look)
- Using Inter or Geist for everything (it screams "generated")
- rounded-xl on all elements (12-16px is too aggressive for most designs)
- Pure black (#000) text on pure white (#fff) — the contrast is too harsh for extended reading
- Gray shadows (use warm or brand-tinted shadows instead)
- No focus-visible styles (breaks keyboard navigation / accessibility)
- Same font weight for headings and body (destroys hierarchy)
- Default 1rem/16px for everything with no type scale
- Spacing that doesn't follow a grid (random paddings and margins)
=== END DESIGN THEORY ===
`.trim();

/**
 * Returns the design knowledge prompt, optionally combined with a
 * design profile context for a specific project.
 */
export function getDesignSystemPrompt(profileContext?: string): string {
  if (profileContext) {
    return `${DESIGN_KNOWLEDGE_PROMPT}\n\n${profileContext}`;
  }
  return DESIGN_KNOWLEDGE_PROMPT;
}
