# SkillVerse Design System & UI Specifications

This document outlines the visual tokens, typography, component patterns, and styling conventions utilized throughout the SkillVerse user interface.

---

## 1. Color Palette & Theme Tokens

### Core Semantic Colors
| Token Name | Hex Code | Visual Role | Usage |
|---|---|---|---|
| `--bg-primary` | `#0a0f1d` | Deep Space Navy | Full application background |
| `--bg-secondary` | `#0f172a` | Slate Surface | Header bar, card borders, modals |
| `--bg-card` | `#0e1526` | Elevated Card Dark | Content cards, widgets, form cards |
| `--bg-card-hover` | `#162035` | Hovered Surface | Interactive card hover state |
| `--primary` | `#10b981` | Emerald Green | Primary actions, success badges, verified status |
| `--primary-hover` | `#059669` | Darker Emerald | Button hover state |
| `--accent-blue` | `#3b82f6` | Royal Sky Blue | Secondary highlights, AI widgets, info badges |
| `--accent-amber` | `#f59e0b` | Warm Amber | Admin key accents, pending alerts, career gold tier |
| `--accent-rose` | `#f43f5e` | Crimson Rose | Rejections, cancellation tags, logout icon |
| `--text-primary` | `#f8fafc` | Crisp White | Headings, primary content text |
| `--text-secondary` | `#94a3b8` | Muted Silver | Subtitles, meta descriptions, form labels |
| `--text-muted` | `#64748b` | Dim Gray | Footnotes, timestamps, placeholder text |
| `--border-color` | `rgba(255, 255, 255, 0.08)` | Glass Border | Card outlines, dividers |

---

## 2. Typography

- **Display & Headings Font**: `Plus Jakarta Sans`, `Inter`, sans-serif.
  - Weight: 700 (Bold), 800 (Extra Bold)
  - Letter Spacing: `-0.02em` for modern tech aesthetic
- **Body & Controls Font**: `Inter`, system-ui, -apple-system, sans-serif.
  - Weight: 400 (Regular), 500 (Medium), 600 (Semi-Bold)
  - Line Height: `1.6` for readable documentation and body copy

---

## 3. UI Component Patterns

### Glassmorphism Cards (`.glass-card`)
```css
.glass-card {
  background: rgba(14, 21, 38, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Action Buttons
- **Primary Button (`.btn-primary`)**:
  - Gradient: `linear-gradient(135deg, #10b981 0%, #059669 100%)`
  - Text: High contrast `#ffffff`, font-weight 600.
  - Glow on hover: `box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35)`.
- **Secondary Button (`.btn-secondary`)**:
  - Background: `rgba(255, 255, 255, 0.05)`
  - Border: `1px solid rgba(255, 255, 255, 0.12)`
  - Hover: `background: rgba(255, 255, 255, 0.1)`.
- **Admin Authentication Button**:
  - Gradient: `linear-gradient(135deg, #f59e0b, #d97706)` with deep black `#000` text.

### Badges & Pill Tags
- **Verified Badge**: Emerald pill with ShieldCheck icon (`background: rgba(16, 185, 129, 0.15)`, `color: #10b981`).
- **Rating Tag**: Star icon with gold score (`color: #f59e0b`).
- **Notification Counter**: Rose pill with pulsating aura.

---

## 4. Animation & Interaction Tokens

- **Hover Transforms**: `transform: translateY(-4px)` with smooth shadow bloom.
- **Pulse Indicators**: `@keyframes pulse-dot` for real-time live availability.
- **Shimmer Gradients**: Dynamic AI diagnostic widgets with animated gradient borders.

---

## 5. Responsive Breakpoints

| Breakpoint | Target Devices | Layout Behavior |
|---|---|---|
| **Mobile (`< 768px`)** | Phones | Single column stack, hidden desktop nav, full-width cards |
| **Tablet (`768px - 1024px`)** | iPads / Tablets | 2-column grids, collapsed sidebar |
| **Desktop (`> 1024px`)** | Laptops & Desktops | Multi-column layouts (Map + Sidebar, 4-column service cards) |
