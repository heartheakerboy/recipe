export const siteConfig = {
  name: 'FlavorNest',
  tagline: 'Simple Recipes. Big Flavor.',
  description:
    'Discover dependable, flavor-packed recipes for real home cooks. From quick 30-minute weeknight dinners to comforting slow cooker classics, we make homemade cooking approachable, vibrant, and delicious.',
  domain: 'flavornest.xyz',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://flavornest.xyz',
  author: {
    name: 'FlavorNest Editorial Team',
    url: 'https://flavornest.xyz/about',
  },
  social: {
    pinterest: 'https://pinterest.com/flavornestrecipes',
  },
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'All Recipes', href: '/recipes/' },
    { label: 'Collections', href: '/collections/' },
    { label: 'Quick & Easy', href: '/category/quick-and-easy/' },
    { label: 'Chicken', href: '/category/chicken/' },
    { label: 'Pasta', href: '/category/pasta/' },
    { label: 'Desserts', href: '/category/desserts/' },
  ],
  footerLinks: {
    explore: [
      { label: 'All Recipes', href: '/recipes/' },
      { label: 'Curated Collections', href: '/collections/' },
      { label: '30-Minute Dinners', href: '/category/30-minute-meals/' },
      { label: 'Quick & Easy', href: '/category/quick-and-easy/' },
      { label: 'Chicken Recipes', href: '/category/chicken/' },
      { label: 'Pasta Dishes', href: '/category/pasta/' },
    ],
    categories: [
      { label: 'Dinner', href: '/category/dinner/' },
      { label: 'One-Pot Meals', href: '/category/one-pot-meals/' },
      { label: 'Breakfast & Brunch', href: '/category/breakfast/' },
      { label: 'Desserts & Sweets', href: '/category/desserts/' },
      { label: 'Air Fryer Favorites', href: '/category/air-fryer/' },
    ],
    company: [
      { label: 'About FlavorNest', href: '/about' },
      { label: 'Editorial Policy', href: '/about#editorial' },
      { label: 'Contact Us', href: '/contact' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Recipe Disclaimer', href: '/disclaimer' },
    ],
  },
};
