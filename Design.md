---
name: ProTask Enterprise
colors:
  surface: '#faf9ff'
  surface-dim: '#ccdaff'
  surface-bright: '#faf9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8ff'
  surface-container-highest: '#d8e2ff'
  on-surface: '#051a3e'
  on-surface-variant: '#434654'
  inverse-surface: '#1d3054'
  inverse-on-surface: '#edf0ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#525f74'
  on-secondary: '#ffffff'
  secondary-container: '#d6e3fc'
  on-secondary-container: '#58657a'
  tertiary: '#004b59'
  on-tertiary: '#ffffff'
  tertiary-container: '#006477'
  on-tertiary-container: '#76e2ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#d6e3fc'
  secondary-fixed-dim: '#bac7df'
  on-secondary-fixed: '#0f1c2e'
  on-secondary-fixed-variant: '#3b475b'
  tertiary-fixed: '#afecff'
  tertiary-fixed-dim: '#48d7f9'
  on-tertiary-fixed: '#001f27'
  on-tertiary-fixed-variant: '#004e5d'
  background: '#faf9ff'
  on-background: '#051a3e'
  surface-variant: '#d8e2ff'
typography:
  display:
    fontFamily: IBM Plex Sans
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: IBM Plex Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

# TaskSync Enterprise (ProTask) Design System Specification

## 1. Brand & Aesthetic Philosophy
The design system focuses on productivity, clarity, and institutional trust. It is tailored for high-stakes enterprise environments where information density and task management efficiency are paramount. The style is **Corporate / Modern**, emphasizing a systematic approach to UI that feels reliable and unobtrusive.

The visual language avoids unnecessary decoration, instead using precision and structure to guide the user through complex workflows. The emotional response is one of **"focused calm"**—providing the user with a sense of control over their data through a clean, organized, and high-performance interface.

---

## 2. Color Palette & Token System

### Core Brand & Surface Tokens
| Token Name | Hex Code | Role / Usage |
| :--- | :--- | :--- |
| `primary` | `#003d9b` | Deep Trustworthy Blue for primary buttons, active tabs, header titles |
| `primary-container` | `#0052cc` | Primary container fill, highlighted hero cards, progress bars |
| `on-primary` | `#ffffff` | High-contrast text on primary background |
| `secondary` | `#525f74` | Slate Grey for secondary controls, sub-labels, and icons |
| `secondary-container` | `#d6e3fc` | Light slate blue background for active navigation pills |
| `tertiary` | `#004b59` | Dark Cyan/Teal for operational badges, approval locks, completed indicators |
| `tertiary-fixed` | `#afecff` | Light cyan chip background for "In Progress" statuses |
| `background` | `#faf9ff` | Level 0 soft off-white application background |
| `surface-container-lowest` | `#ffffff` | Pure white cards, task rows, and header shells |
| `surface-container-low` | `#f1f3ff` | Soft tinted containers, secondary table headers, inputs |
| `surface-container-high` | `#e1e8ff` | Hover states, pill containers, and active chips |
| `outline` | `#737685` | Medium grey for borders, sub-icons, and tertiary captions |
| `outline-variant` | `#c3c6d6` | Low-contrast hairline dividers and table row borders |
| `error` | `#ba1a1a` | High-visibility warning for blocked tasks and destructive actions |
| `error-container` | `#ffdad6` | Light red background for critical status chips and alerts |

### Status Indicators
- **In Progress / Active:** `#003D9B` (Blue) or `#004B59` (Teal) / Chip fill `#AFECFF` (`tertiary-fixed`).
- **Done / Approved:** `#1B5E20` (Vibrant Dark Green) with `#E8F5E9` light green background.
- **Blocked / Overdue:** `#BA1A1A` (Red) with `#FFDAD6` light red background.
- **Closed / Archived:** `#737685` (Muted Grey) on `#F1F3FF` low-surface background.

---

## 3. Typography Scale & Font Pairing

The system utilizes a tri-font hierarchy to balance character with functional utility:
1. **IBM Plex Sans:** Headings and display titles (industrial, structured, modern executive authority).
2. **Inter:** Body copy, task descriptions, form labels, and general readability.
3. **JetBrains Mono:** Technical metadata, system IDs, statuses, timestamps, and statistics tags.

```
+---------------------------------------------------------------------------------------+
| Style         | Font Family      | Size  | Weight | Line Height | Letter Spacing      |
+---------------+------------------+-------+--------+-------------+---------------------+
| display       | IBM Plex Sans    | 36px  | 600    | 44px        | -0.02em             |
| headline-lg   | IBM Plex Sans    | 28px  | 600    | 36px        | normal              |
| headline-md   | IBM Plex Sans    | 20px  | 500    | 28px        | normal              |
| body-lg       | Inter            | 16px  | 400    | 24px        | normal              |
| body-md       | Inter            | 14px  | 400    | 20px        | normal              |
| body-sm       | Inter            | 12px  | 400    | 16px        | normal              |
| label-md      | JetBrains Mono   | 12px  | 500    | 16px        | 0.05em (Monospace)  |
| label-sm      | JetBrains Mono   | 10px  | 500    | 12px        | 0.05em (Monospace)  |
+---------------------------------------------------------------------------------------+
```

---

## 4. Layout, Grid, & Spacing Framework

- **Base Spacing Unit:** `4px`
- **Spacing Scale:**
  - `xs`: 4px
  - `sm`: 8px
  - `md`: 16px
  - `lg`: 24px
  - `xl`: 32px
- **Desktop Grid:** 12-column grid with `32px` outer margins, `16px` gutters, max-width `1440px`. Fixed left sidebar at `260px`.
- **Tablet Grid:** 8-column layout with `24px` outer margins.
- **Mobile Layout:** Single-column layout with `16px` outer margins and persistent bottom navigation bar.

---

## 5. Elevation, Depth, & Shape Language

Hierarchy is driven by **tonal layering** and **subtle hairline outlines** rather than heavy drop shadows:
- **Level 0 (App Shell):** Off-white canvas (`#FAF9FF`).
- **Level 1 (Cards & Data Grids):** Pure white background (`#FFFFFF`) with `1px` solid border (`#C3C6D6`).
- **Level 2 (Modals & Flyouts):** Pure white background with `0px 4px 8px rgba(9, 30, 66, 0.08)` shadow and `1px` outline.
- **Border Radius Standards:**
  - `sm` (`2px`): Checkboxes, badge tags.
  - `DEFAULT` / `md` (`4px`–`6px`): Action buttons, input controls, table headers.
  - `lg` / `xl` (`8px`–`12px`): Content cards, containers, flyout drawers, bento blocks.
  - `full`: Avatars, status chips, segmented pills.

---

## 6. Key Application Views & User Roles

### View 1: Employee Task Dashboard (`Today's Focus`)
Designed for individual contributors to monitor daily tasks, track weekly completion velocity, and interact with task lists.

![Employee Dashboard Avatar](https://lh3.googleusercontent.com/aida-public/AB6AXuBEq76iuQsLyUs8bB6bkkJFy1ErwbD9Wsg9pQOkqCBGKQA2S92GzCUHsUXfgvl5Z3yNh67tRN1bD-rKprzr13zg9SYjCq9qe-B3aJ-A-IQmQUQ04C7iaAWz1EbYNsV2T3FY-YJVMnFTTSB2xdiO_qwxwn3xi4fGjgb8dBM_44urlZufp3RTbT_1eXPNnFjhIb2P9-xF2iiDIjPeumRV8vmFmo_Ml5vizDHvc7uC9ivwtbPbYykHwS0H1-saiQ-u8VfyWIHwxwr5_A)
*Profile: Alex Rivera — Employee*

**Features:**
- Hero greeting with completion rate progress (e.g., **82%**).
- High-density task row list with custom 16px interactive checkboxes.
- Quick status badge pills (`In Progress`, `Done`).
- Floating Action Button (FAB) for rapid task creation.

---

### View 2: Manager Team Oversight Grid
Designed for operations leads and department managers to track team productivity, review active workloads, and manage task lifecycles.

![Marcus Thorne - Operations Manager](https://lh3.googleusercontent.com/aida-public/AB6AXuBSDB39SPu4xKj3IjUJ8WuwN5JFCUw6u1XkGAMnp1tcb1yC7z_CpP_3d5p_-cJkDwM1YiCpkQzbuE_jNeDaq6z5wmqrJM9QeQ5Hci8FJHkpyprj0PplOqfcGKUBfx3giEefj0cZjz_jzrCG2DZCuZuGH1LPIAA0u1o0WVXktA5sCfaJSxcAnWnNYTRQxpAxXNroF7ADbly7fSGOc5eLrCVxB9rrvjss273wMMBZ-6_i8GkBTNB8iKo1SeIWT8AdK3EaogPTt9KUmA)
*Profile: Marcus Thorne — Operations Lead*

![Enterprise Workflow Preview](https://lh3.googleusercontent.com/aida-public/AB6AXuB3iYV6JVJKb4u0-BK97cc9RFWQ5T7YlVpyhy4-jTWDb9b1wz3ddzWHhVbYHDqtAfG70aAqzTs5pdVzQncVLEqfWZTDfsOWKrJMhdBI-FZ6-pKW0Gitdzt5mPfjcpkOctnR9_KrryM5E_40SDRmZ-avYKM-rNz_lDeeh_axZDI7x5mjVc1PpJQ_zcAr4OmB6g_UqP7t9VvPGJURcGrmTXSQECas3MeWSWGOS_HZ0Z8y4OhcEqE6dmowua7mHj4zLEeD3JyFy-gyEw)

**Features:**
- Real-time team metrics (Active Tasks: 142, Pending Reviews: 28, Team Velocity: 84%).
- High-density data grid with multi-column sorting (Task Description, Assignee, Status, Action controls).
- One-click task closure and approval triggers.

---

### View 3: Task Details & Audit Trail Panel
Rich task editing view featuring breadcrumb navigation, dynamic markdown editor, priority selection, story point estimation, and continuous activity history log.

![Executive Headshot](https://lh3.googleusercontent.com/aida-public/AB6AXuAkp9cUwsNBVmAJyX1y1a-Afhm7Mc6btH8qoavNZBMWqANTrBmmRx6QItM2z2szKmQogHFl9Hym_d-SAkfSQ1RDZ2NNWeFWffj34tpewe5EdxbM0m6SUM-dFjr3_tz6o9Liu5NJGLzSAaGkfov-pDIeFO0JBGC-QNUB1gUDjD0ca4X9lDffUkYpbSAjtjsLfwB0l3_qBfkKfDlglYcA_gS3MmXx8u6eUPPfCyWBGahNOVPRw6oaQ_e5m-6FRIrEHaoPjJ7PZ0AsXA)
*Project Manager / Reviewer*

![Sarah Jenkins Headshot](https://lh3.googleusercontent.com/aida-public/AB6AXuA4mtWeJvaYklfGnWf9wso-4zuwbJkC4JQvLRVqLeo06Ve4yRs_07yPG4XG91qOoEYQYQT7eb1qKJCgb5fj2ydBU-qrumj1u3iEwd3eI0fmlX7zA7qWlVU091d7wFYQGna93GldsH4Ub-IT4mli3fHtnMNMLRSdE5Z1ZzYNuQktvWwh3lHCwH9WBmKBCPLPSB8qDhPg0z9Qt4K64DnTcPssG89syXDAM5yaF3sRFPOK7M8ep3xVY_JXsTBsKVsxXTbYg31BVEhCGA)
*Lead Reviewer: Sarah Jenkins*

---

### View 4: Admin Console & Role-Based Access Control (RBAC)
User management table with role quick-settings bento cards for configuring system permissions across `Employee`, `Manager`, and `Admin` tiers.

![Senior Admin Headshot](https://lh3.googleusercontent.com/aida-public/AB6AXuCb0gyQip8UjYMa__7vmVGEC4ATmuWqHzCFCcy-g_-BvWNtgl5OS2T9goTwQEBRyhDTlHq87-yAhlYOkzq8fzdiXVrZOvFtZQG5fzC1awpCnMNe-EveUFEYIRQxyqL-m9b1ysElJjwmA7qV8ehb33vyOK6aBLnji5WihsthRm3jcFNMaNsS3eSKlzb5ZuI84CBYnqKiIOTzUe5RvjQ8tTZn_987hoWizVndglBpNrFpIf3yf_s1CLha94dNxBT1ruzQNj2T-EGUaw)
*Profile: System Administrator*

#### Organization Members Directory:
- **Elena Rodriguez** (`Systems Architecture`)
  ![Elena Rodriguez](https://lh3.googleusercontent.com/aida-public/AB6AXuDPSs5SKdfEUkIUdSDsYfzdZz_cUIhYFrNz_DAleIMmWSFM3qrN3KANzuqPfk4G4d-eeoIUS969FKvoqws3P4I8hVxN0HHgIGnU4ZkBCF5GXMloAj792WOhhSHk0j6jF0A3Xlix9PzmEktSmevwH0X7pA_D52icJAfhrFYYfke4Luc9Al9oycQVULsDZMFV7wAnrNPD9xRVEUjkPPbL1bTCo_xDZeeb0ODnV1rmNpl62oTzpEsPB6iOuD-IVWcm975aktahVLTZPw)
- **Marcus Chen** (`Data Science`)
  ![Marcus Chen](https://lh3.googleusercontent.com/aida-public/AB6AXuC10xYoctzoNeX6ux-hj4W2Lo3b6SQzdycjt-7yx7kbLWu_MRjfrdbb-9cZrkUMpsQRFtJOv_7Ps9nnSm3RDDTqHrdGom7CuN6-EcN_bucoS4YnhzNBr6d6vlrYvE1zEL4bCIx0FTibZdWKoHFmZ7ZxN7CluW9znGF2AHuNaTRWCs8PPmCNGzIFxEtMINM6ZK-MX8fraYk7G4gFXiYcNpqTy5MToMl-0CPsDasYlzz0QOmYTzEJGLBoorDgIjCkT3JBxJKHYoPktw)
- **Julian Vance** (`Operations Lead`)
  ![Julian Vance](https://lh3.googleusercontent.com/aida-public/AB6AXuCRAmV5qwRw1BgeQp82eDrqXMX4cZBvB7G6BHwIdCulg287GUXfzIBb0_xA82xzjHEMYrgRjznYt9OB5oW5Fjb89aRBJhfq0R41KXa8NRCM5P1Unl8FFFTgJeAAJdIk9WK6QzKM6VCFE3vXDJqWvb8tMN8fxdLFUzRQBkaD81rtwn-CxRrm_ASZtQc1A15hlxk-N76fLQppGlNaFsqIhaVlOgqYR-t1SdL_4cOGzvFXBEwM79yfcvw91dsnC-ZZAaH315u56h2hXg)
- **Sarah Jenkins** (`Product Design`)
  ![Sarah Jenkins](https://lh3.googleusercontent.com/aida-public/AB6AXuDsHD37rKAKVXip0QuvGUUMtqhsvkBDrTdXV3e13hvfSHzLWvq6ZbtFvOBwgU3msDuYsVPBB7O79wS_d42r2jYPz8B1brQedVbHS2oKp7aBMg4IQTxaDPwbpn3hG20zTIq_Ig46mtkI8ScUO91KoxHEJ8w8tXcuNETEcIc2JdihkclvPYFBsCKZtkMG804Ert7Uh0s-HIL2jW6wB3UihgQuy9v2HR0IwkGYqu3rGr93XbptOYB5UDa3hkLOqd_8VUfPtRnsEWrrYw)
- **Kevin Zhang** (`Frontend Engineering`)
  ![Kevin Zhang](https://lh3.googleusercontent.com/aida-public/AB6AXuDs5vWkjeJsQi2GW7BoNjkWymG3j5MChfgGW1LOjSguq_3iDzspeEeU9BuHYkLBAIq4B0tjEtdySbsSkLJr1gasQ3eFWsYpgYjteHxGEBUV4HBxiWfzKyfvKWfD4SII7_SiuCS_n3hFLD7p748UuughIIbyYOEcIB39-nLI0yqY5F18bG6oARrJUFaMLFOTGNN8oXlT-JMBHsUzm72fZXAXeOxsJQ_Wr94CPFEmDOyfKh2sQVo7MGoKWvaao602xFQE0rpzcArrTQ)

---

### View 5: Authentication & SSO Login Suite
Enterprise login and registration flows supporting single sign-on via Google Workspace and Azure AD.

![Google SSO Icon](https://lh3.googleusercontent.com/aida-public/AB6AXuDKTZqJNEoqbHDHgKHXikqwSmb8uNT58mYLjLriHn_2W-Vx9QoBaEuJNcrixsX5XrSLSyIowczyuVLRACcc3o4Nz6CHcI3pAd1nCKtefQbEJglTIi_tlndF7AXjcLCKosFbiFGAsJDSc2QaxSC-JjuZ3OLQAnBj0AAU2kzuLLGZ-5TmSPVb0Fy0FmTO0bBumvFWPvt7hiyaiHdPZp6pLMMoJbiC9G8nGT_jgsFxLQsrPa80i34hPvO9p8zlEx3swxAjpHRnD80cKg)
![Azure AD Icon](https://lh3.googleusercontent.com/aida-public/AB6AXuC6TKRDs7gPsoWRlT6a8JuJi_apto5O6yq0XhzyKzMI3Wub9Wtj9eZjqTgh7BMjYn3ICFiGUoZgCqtJlLJbuSkqmNIv7oFTVMlXfxl_oLztNsz1aVuwhQhNoOlGuitLY-akyhqO6mcTY8i5Fv97jV1RZfNoIVws4WJszo2f5scGszvjSVsXVpm5JZi0soVrkKuROtIOE1RYVv630NRgUPKC2GXkuLxgg-I0bifl6XtNRuFrduGb2KtGJM6sx7lWc1zHg6h8V0wZrw)

---

## 7. Interaction & Motion Principles

1. **Micro-interactions:**
   - Buttons: `active:scale-95` on press with 150ms transition.
   - Checkboxes: Smooth background scale and border color shift to green (`#1B5E20`) upon completion.
   - Table Rows: `bg-primary/5` background fill on hover for high-density horizontal row tracking.
2. **Page & Route Transitions:**
   - Smooth slide-in for flyout drawers (`translate-y-full` to `translate-y-0` in 300ms cubic-bezier).
   - Subtle opacity fade-in for tab changes (150ms duration).
3. **Accessibility (WCAG AA):**
   - High contrast ratio (minimum 4.5:1 for body text, 3:1 for large display elements).
   - Clear focus ring styling (`focus:ring-2 focus:ring-primary`).
   - Touch targets on mobile at least `44px x 44px`.
