# Frontend Context Document

## 1. Project Frontend Overview
- **Type of Frontend Application:** Public-facing Service Portal & Web App (features landing pages, interactive maps, forms, and informational sections).
- **Design Philosophy:** Modern, dark-themed, and highly interactive. The UI focuses on glassmorphism, depth, and smooth micro-interactions to create a premium, engaging user experience.
- **UI Goals:** Provide intuitive access to civic services (e.g., reporting potholes), build trust through testimonials and team showcases, and ensure a seamless, high-conversion user journey from landing to action.
- **Target User Interaction Patterns:** Scrolling narratives, animated hover states for discovery, interactive map explorations, and straightforward form submissions.

---

## 2. Design Language & Visual Style
The styling system heavily utilizes Tailwind CSS with a strong emphasis on dark mode aesthetics and glowing accents.

- **Design Style:** Modern Dark Mode / Cyberpunk-lite / SaaS
- **Primary Colors:** 
  - **Backgrounds:** Deep darks (`bg-black`, `bg-gray-900`, `bg-slate-800`).
  - **Accents:** Indigo, Blue, and Purple (`text-indigo-500`, `bg-indigo-500`, `from-blue-500 via-indigo-500 to-purple-300`).
  - **Text:** High contrast white (`text-white`) and soft muted cool-grays (`text-slate-400`, `text-gray-300`).
- **Typography:** Clean sans-serif (Tailwind default), using distinct font weights (`font-medium`, `font-semibold`, `font-bold`) to establish clear hierarchy.
- **Spacing Philosophy:** Generous white-space (e.g., `py-16`, `gap-8`) with content often constrained using `max-w-*` classes for optimal readability on large screens.
- **Border Radius & Shadows:** 
  - **Pill shapes (`rounded-full`)** for dynamic elements like Navbars, Buttons, and Inputs.
  - **Soft rectangles (`rounded-xl` or `rounded-[11px]`)** for Cards and containers.
  - **Shadows:** Intense glowing shadows (e.g., `shadow-[0px_0px_30px_7px] shadow-white/50`) and soft backdrop blur (`backdrop-blur-md`) define depth.
- **Animation Style:** Elegant and responsive. Uses CSS transitions for transform (`translate-y-full`, `translate-x-1`), opacity fades, and accordion expansions (`max-h-0` to `max-h-[300px]`). Javascript is used for mouse-tracking glow effects and tooltips.

---

## 3. Component Inventory

### Navigation & Layout
- **Navbar:** Sticky or relative top navigation. Features pill-shaped glassmorphic container, animated links, and mobile hamburger menu.
- **Logo:** Standardized branding component.
- **Footer:** Page bottom links and copyright.
- **Hero / PrivacyPolicyHero:** Large, high-impact top sections with bold typography and primary Call-To-Action (CTA) buttons.

### Data Display & Spatial
- **PotholeMap / ComplaintMap:** Interactive map interfaces using `react-leaflet` to display heatmaps and clustered location markers of civic issues.
- **ProfileCard:** Glassmorphic card displaying team member data with a dynamic, mouse-tracking background glow.
- **Testimonial / TestimonialCard:** Displays user feedback. Cards utilize a custom mouse-tracking tooltip.

### Content & Informational
- **About / AboutUs:** Sections detailing features with text, images, and feature lists.
- **FAQ / FAQSection:** Accordion-style list of questions and answers.
- **TeamMembers:** Wrapper for displaying multiple `ProfileCard`s.

### Input & Interaction
- **ContactForm:** Form layout featuring rounded-full input fields with SVG icons, focusing states (`focus-within:ring-indigo-400`), and a submit button.
- **HomeBtn:** Utility button for navigation.

### State & Utility
- **Loading:** Universal loading state/spinner component.

---

## 4. Component Behavior

### Buttons (Implied explicitly in components like Hero, Navbar, ContactForm)
- **Primary Button (e.g., Submit Form):** Indigo background (`bg-indigo-500`), pill shape (`rounded-full`), white text. 
  - *States:* `hover:bg-indigo-600`, translates embedded icon.
- **Secondary Button (e.g., Get Started):** Transparent with white border, pill or `rounded-xl` shape.
- **Ghost/Link Button (e.g., Learn More):** Text with an adjacent SVG arrow.
  - *States:* `group-hover:translate-x-1` on the icon.
- **Highlight Button (e.g., Login in Nav):** White background, black text.
  - *States:* Intense white glowing shadow on hover (`hover:shadow-white/50`).

### ProfileCard
- **Behavior:** Interactive 3D/Glow feel. Uses React `onMouseMove` to calculate coordinates and update the `top`/`left` styling of a blurred gradient div that acts as a "flashlight" behind the card content.

### FAQ (Accordion)
- **Behavior:** Controlled component state (`openIndex`). Clicking a question toggles the answer section's visibility by animating `max-h` and `opacity`, while rotating the chevron icon 180 degrees.

### PotholeMap
- **Behavior:** Fetches data from Next.js API route (`/api/department/getPotholeLocations`). Renders a dynamic Leaflet map with a Heatmap layer (adjusting radius based on zoom level) and clustered Marker popups.

---

## 5. Component Hierarchy
Typical structural flow of the application:

**Standard Page Layout (e.g., Landing Page):**
1. `Navbar` (Global)
2. `Hero` (Primary Hook & CTAs)
3. `About` / Features Section (Value proposition)
4. `PotholeMap` (Core spatial data visualization)
5. `Testimonial` (Social proof)
6. `TeamMembers` (containing multiple `ProfileCard`s)
7. `FAQ` (Objection handling)
8. `ContactForm` (Final conversion point)
9. `Footer` (Global)

---

## 6. Page-Level Component Usage

- **Landing/Home Page:** `Navbar`, `Hero`, `About`, `PotholeMap`, `Testimonial`, `Footer`.
- **About/Company Page:** `Navbar`, `AboutUs`, `TeamMembers` (with `ProfileCard`s), `Footer`.
- **Support/Help Center:** `Navbar`, `FAQSection`, `ContactForm`, `Footer`.
- **Dashboard/App (Implied):** `ComplaintMap`, `Loading`, Sidebar (to be created), Data Layouts.

---

## 7. UI Patterns
- **Glassmorphic Cards:** Used for profiles, testimonials, and floating navbars. Provides depth against plain dark backgrounds.
- **Mouse-Tracking Interactions:** Custom tooltips on `TestimonialCard` and flashlight glow effects on `ProfileCard`. Should be used for high-value interactive elements to delight the user.
- **Pill-shaped Inputs & Controls:** Search bars, email inputs, and buttons are consistently fully rounded (`rounded-full`), keeping the UI soft despite the stark dark mode colors.
- **Icon-Prefixed Inputs:** Inputs in `ContactForm` use left-aligned SVGs inside a flex container to denote input type clearly.
- **Spacious Feature Lists:** Displaying features using a left-aligned icon box (`size-9 p-2 bg-indigo-50 border-indigo-200`) next to a title and description.

---

## 8. Responsiveness Strategy
- The application uses Tailwind's mobile-first breakpoints (`md:`, `lg:`).
- **Mobile Layout:** Hamburger menus (`Navbar`), stacked columns (`flex-col`), full-width buttons, and relaxed padding.
- **Tablet/Desktop Layout:** Row-based flex layouts (`md:flex-row`), horizontal navigation links, max-width constraints on text, and grid/wrap layouts for cards (`ProfileCard`, `TestimonialCard`).

---

## 9. Accessibility Considerations
- **Focus States:** Forms utilize `focus-within:ring-2 focus-within:ring-indigo-400` to clearly indicate the active input field.
- **Semantic HTML:** Use of `<nav>`, `<form>`, `<label>`, and `<button>` elements.
- **Alt text:** `Image` components consistently include `alt` attributes.
- *(Improvement Opportunity: Ensure interactive SVGs and custom tooltips have proper ARIA labels and `aria-expanded` states for screen readers).*

---

## 10. Styling System
- **Framework:** Tailwind CSS (v4) via Utility Classes.
- **Approach:** Inline utility classes are used exclusively. No CSS modules or Styled Components are evident. Global styles (`globals.css`) only contain Tailwind imports. Highly complex classes (like glowing shadows or gradients) are written directly on the elements.

---

## 11. Component Reuse Guidelines
- **Containers/Cards:** Always use the established glassmorphic classes (`bg-gray-900 backdrop-blur-md rounded-xl border border-slate-700` or similar) rather than inventing new backgrounds.
- **Buttons:** Avoid custom styling on new buttons. Extract the Primary (Indigo), Secondary (Bordered), or Ghost (Text+Arrow) Tailwind class strings and reuse them.
- **Forms:** Replicate the `ContactForm` input wrapper (`flex items-center h-10 pl-3 border border-slate-300 rounded-full focus-within:ring-2`) for any new data entry fields.

---

## 12. Suggested Component Expansion
To mature this design system, the following components should be decoupled and created:
- **`Button`**: A reusable component handling `variant` (primary, secondary, ghost) and `size`.
- **`Input` / `TextArea`**: Reusable form fields with built-in icon support and validation states.
- **`Card`**: A generic wrapper component for the glassmorphic styling to prevent class duplication across `ProfileCard`, `TestimonialCard`, etc.
- **`Modal` / `Dialog`**: For displaying forms or map details without leaving the page.
- **`ToastNotifications`**: For success/error feedback (e.g., after `ContactForm` submission). 

---

## 13. AI Summary for Frontend Generation
**System:** Next.js App Router, React 19, Tailwind CSS v4.
**Design Style:** Premium Dark Mode, Glassmorphic, Neon/Indigo Accents (`bg-gray-900`, `text-indigo-500`).
**Pillars of UI:** 
1. Pill-shaped buttons and inputs (`rounded-full`).
2. Soft rectangular cards (`rounded-xl`) with backdrop blur and glowing shadows.
3. Smooth micro-interactions (mouse-tracking glows, hover transforms, expanding accordions).
**Layout:** Spacious, centered max-width content blocks. Responsive layouts shift from mobile stack (`flex-col`) to desktop rows (`md:flex-row`).
**Reuse Rule:** Stick to utility classes. Do not introduce new colors outside the black/slate/white/indigo palette. Maintain the glassmorphism aesthetic for any new containers. Use `react-leaflet` for any spatial data needs.
