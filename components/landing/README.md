# Saksham Landing Page Components

Professional, modern, and animated landing page components for the Saksham AI Interview Preparation Platform.

## Features

### 🎨 Design System
- **Color Palette**: Based on Disha's brand colors (Dark Blue #1b52a4, Bright Blue #00a2e5, Orange #f58020)
- **Dark Mode**: Full support with smooth transitions
- **Responsive**: Mobile-first design with breakpoints for all screen sizes
- **Animations**: Framer Motion animations with scroll reveals

### 🌍 Internationalization (i18n)
- **Languages Supported**: English, Hindi, Odia
- **Easy Extension**: Simple to add more languages
- **Persistent Storage**: Language preference saved in localStorage
- **Context-based**: Uses React Context for global state

### 🎭 Components

#### 1. **LandingNavbar**
- Fixed position with scroll effects
- Logo (HireKarma branding)
- Language selector (English/Hindi/Odia)
- Theme toggle (Light/Dark)
- Profile dropdown with login/signup options

#### 2. **LandingSidebar**
- Collapsible sidebar (280px → 80px)
- Smooth animations
- Section navigation with scroll-to
- Quick actions at bottom
- Desktop only (hidden on mobile)

#### 3. **HeroSection**
- Animated gradient background
- Statistics badges
- Gradient text heading
- Dual CTA buttons
- Scroll indicator
- Trust indicators (university logos)

#### 4. **FeatureCards**
- 6 feature cards in a grid
- Hover effects with scaling
- Color-coded by feature type
- Icon + title + description
- "Learn More" on hover

#### 5. **WhyChooseUs**
- 4 reason cards with benefits
- Checkmark bullet points
- Statistics row
- Alternating animations

#### 6. **HowItWorks**
- 4-step process
- Numbered badges
- Horizontal flow (desktop)
- Vertical flow with arrows (mobile)
- Step-by-step animations

#### 7. **Testimonials**
- 6 testimonial cards
- Star ratings
- User avatars (gradient circles)
- Company information
- Quote styling

#### 8. **Partners**
- Partner logos grid
- 12 companies (placeholder)
- Hover effects
- CTA for partnership

#### 9. **FAQ**
- Accordion-style interface
- Category filtering
- Smooth expand/collapse
- 10 common questions
- Plus/Minus icons

#### 10. **Footer**
- Comprehensive footer links
- Product, Company, Support, Legal sections
- Contact information
- Social media links
- Newsletter signup
- Made with ❤️ in India

### 🎯 Layout Structure

```
LandingLayout
├── LandingNavbar (Fixed top)
├── Main Content Area
│   ├── LandingSidebar (Fixed left, desktop only)
│   └── Content (Scrollable)
│       ├── HeroSection
│       ├── FeatureCards
│       ├── WhyChooseUs
│       ├── HowItWorks
│       ├── Testimonials
│       ├── Partners
│       └── FAQ
└── Footer
```

## Usage

### Basic Implementation

```tsx
import {
  LandingLayout,
  HeroSection,
  FeatureCards,
  WhyChooseUs,
  HowItWorks,
  Testimonials,
  Partners,
  FAQ,
} from '@/components/landing';

export default function Home() {
  return (
    <LandingLayout>
      <HeroSection />
      <FeatureCards />
      <WhyChooseUs />
      <HowItWorks />
      <Testimonials />
      <Partners />
      <FAQ />
    </LandingLayout>
  );
}
```

### Language Support

```tsx
import { useTranslation } from '@/lib/i18n/useTranslation';

function MyComponent() {
  const { t, language, setLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <button onClick={() => setLanguage('hi')}>Switch to Hindi</button>
    </div>
  );
}
```

## Performance Optimizations

### 1. **Lazy Loading**
- Uses `framer-motion`'s viewport detection
- Components animate only when in view
- Prevents unnecessary rendering

### 2. **Image Optimization**
- Next.js Image component
- Lazy loading with blur placeholder
- Responsive srcset generation

### 3. **Code Splitting**
- Component-based architecture
- Dynamic imports where needed
- Reduced initial bundle size

### 4. **Scroll Optimization**
- Intersection Observer API
- Debounced scroll events
- CSS transforms for animations

## Customization

### Colors
Edit `tailwind.config.js` to modify the color palette:

```js
primary: {
  500: '#1b52a4', // Change this
},
```

### Animations
Modify animation durations in component props:

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6 }} // Adjust here
>
```

### Translations
Add new languages in `lib/i18n/index.ts`:

```ts
const translations: Translations = {
  en: { ... },
  hi: { ... },
  or: { ... },
  // Add new language here
  es: { ... },
};
```

## Best Practices

1. **Keep components focused**: Each component has a single responsibility
2. **Use semantic HTML**: Proper heading hierarchy and landmarks
3. **Accessibility**: ARIA labels, keyboard navigation, focus states
4. **Performance**: Lazy load images, debounce scroll events
5. **Maintainability**: Consistent naming, clear file structure
6. **Responsive**: Mobile-first approach with progressive enhancement

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- `next`: 14.0.4
- `react`: 18.2.0
- `framer-motion`: 10.16.16
- `next-themes`: 0.2.1
- `lucide-react`: 0.303.0
- `tailwindcss`: 3.4.0

## Future Enhancements

- [ ] Add video backgrounds
- [ ] Implement A/B testing
- [ ] Add more language options
- [ ] Create admin panel for content management
- [ ] Add analytics tracking
- [ ] Implement skeleton loaders
- [ ] Add micro-interactions
- [ ] Create interactive demos

## Contributing

When adding new components:
1. Follow the existing naming convention
2. Add proper TypeScript types
3. Include i18n support
4. Add animations with `framer-motion`
5. Ensure responsive design
6. Test dark mode compatibility
7. Update this README

## License

© 2025 HireKarma. All rights reserved.

