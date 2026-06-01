---
name: Warm Anonymous Mailbox
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#54433d'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#87736c'
  outline-variant: '#dac1ba'
  surface-tint: '#934a2e'
  primary: '#934a2e'
  on-primary: '#ffffff'
  primary-container: '#d27c5c'
  on-primary-container: '#511902'
  inverse-primary: '#ffb59b'
  secondary: '#8e4e14'
  on-secondary: '#ffffff'
  secondary-container: '#ffab69'
  on-secondary-container: '#783d01'
  tertiary: '#6c5b4e'
  on-tertiary: '#ffffff'
  tertiary-container: '#a28f80'
  on-tertiary-container: '#36291e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59b'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#753319'
  secondary-fixed: '#ffdcc4'
  secondary-fixed-dim: '#ffb780'
  on-secondary-fixed: '#2f1400'
  on-secondary-fixed-variant: '#6f3800'
  tertiary-fixed: '#f5dece'
  tertiary-fixed-dim: '#d8c3b3'
  on-tertiary-fixed: '#25190f'
  on-tertiary-fixed-variant: '#534438'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.5'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.7'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 720px
  gutter: 24px
  margin-xs: 0.5rem
  margin-sm: 1rem
  margin-md: 2rem
  margin-lg: 4rem
  section-padding: 80px
---

## Brand & Style

This design system centers on the concept of an "anonymous mailbox"—a digital sanctuary for sharing thoughts and receiving warmth. The personality is quiet, empathetic, and unassuming. It draws from **Soft Minimalism**, prioritizing emotional resonance over complex functionality. 

The aesthetic avoids the coldness of traditional tech by using organic tones and generous negative space, creating a "breathable" interface that encourages reflection. Visual elements are intentional and sparse, ensuring that user messages remain the focal point. The goal is to evoke a feeling of safety, like opening a physical letter in a sunlit room.

## Colors

The palette is anchored in earthy, baked tones that radiate warmth. 

- **Primary (Terracotta):** Used for significant actions and branding moments. It represents the "clay" or "soil"—something grounded and real.
- **Secondary (Soft Coral):** An accent for interactive highlights or subtle feedback, providing a gentler alternative to the primary terracotta.
- **Neutral (Cream Background):** Unlike stark white, this off-white base reduces eye strain and feels more like paper or parchment.
- **Typography:** Deep Charcoal (#333333) ensures high legibility for body text, while Muted Brown (#8D7B6D) is reserved for metadata, timestamps, and secondary labels to maintain a low-stress visual hierarchy.

## Typography

This design system utilizes soft, rounded sans-serifs to maintain a friendly and approachable tone. 

- **Plus Jakarta Sans** is used for headlines. Its modern, rounded geometry feels optimistic and clean.
- **Be Vietnam Pro** handles the body and label text. It offers exceptional legibility with a contemporary warmth that fits the "anonymous mailbox" narrative.

Line heights are intentionally generous (1.6x to 1.7x for body text) to increase readability and contribute to the overall sense of spaciousness. Large display sizes should use tighter letter spacing to maintain a cohesive look, while smaller labels use a slight positive tracking for clarity.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** approach, optimized for a centered content experience. On desktop, the main content area is capped at **720px** to mimic the proportions of a physical letter or a narrow journal page, which prevents text lines from becoming too long and difficult to read.

- **Centered Focus:** All primary interactions happen in the central column, with wide margins on the left and right to eliminate distractions.
- **Rhythm:** An 8px base unit drives all spacing. For vertical rhythm, use larger gaps (`margin-lg`) between distinct content blocks to reinforce the "quiet" atmosphere.
- **Responsive Adaption:** On mobile devices, the container stretches to fill the screen with a standard 20px side margin, maintaining the same vertical rhythm.

## Elevation & Depth

To maintain a soft and organic feel, this design system avoids heavy shadows or high-contrast borders. Instead, it utilizes **Ambient Shadows** and **Tonal Layering**:

- **Surface Tiers:** Most content sits on the Cream (#FFFDF9) background. Cards and floating elements use a pure white surface with an extremely subtle, diffused shadow (Blur: 20px, Opacity: 4%, Color: Primary Terracotta).
- **Interactive Depth:** When a user interacts with a card or button, the shadow expands slightly while remaining soft, creating a "lifting" effect rather than a "floating" one.
- **Glassmorphism (Optional):** For navigation bars or overlays, a light backdrop blur (12px) with a semi-transparent cream fill can be used to maintain context of what is underneath without cluttering the view.

## Shapes

The shape language is defined by **rounded corners**, which remove the "sharpness" often associated with digital platforms. 

- **Standard Elements:** Buttons and input fields use a medium-high roundedness (`0.5rem`) to feel tactile and soft.
- **Containers:** Content cards and modals utilize larger radii (`1.5rem`) to emphasize their role as "envelopes" or "containers of care."
- **Icons & Illustrations:** Line drawings should feature rounded end-caps and smooth curves, avoiding any 90-degree angles.

## Components

### Buttons
Primary buttons are solid Terracotta with white or cream text, using a large border-radius for a friendly appearance. Secondary buttons use a ghost style with a Muted Brown border and text. All buttons should have a minimum height of 48px to ensure they are "touch-friendly" and feel substantial.

### Cards
Cards are the primary vehicle for messages. They should have a soft pure-white background, no border, and a very subtle ambient shadow. Padding inside cards should be generous (min 32px) to give the content room to breathe.

### Input Fields
Inputs are styled with a Soft Coral or Muted Brown outline. The focus state should transition smoothly to a thicker Terracotta border. Placeholders use Muted Brown at a lower opacity to feel unobtrusive.

### Chips & Tags
Used for categories or "mood tags." These should be pill-shaped with a light Soft Coral background and Terracotta text, maintaining a low-contrast, harmonious look.

### Checkboxes & Radios
These components should be larger than standard (24px) with rounded corners for checkboxes, making them feel like hand-drawn marks rather than rigid UI elements.

### Illustrations
Incorporate minimal line drawings or "emotional emojis" that use the primary and secondary color palette. These should be used sparingly to celebrate milestones or empty states, acting as warm visual "stamps" on the page.