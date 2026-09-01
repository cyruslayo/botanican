import tailwindcss from '@tailwindcss/vite';

/** @type {import('@ladle/react').Config} */
export default {
  stories: 'src/**/*.stories.{ts,tsx}',
  build: 'build-ladle',
  addons: {
    a11y: true,
  },
  viteConfig: {
    plugins: [tailwindcss()],
  },
};
