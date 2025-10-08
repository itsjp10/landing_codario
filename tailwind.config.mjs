import plugin from 'tailwindcss/plugin';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '80rem',
      },
    },
    extend: {
      colors: {
        brand: {
          dark: '#0A2540',
          cyan: '#3BAFDA',
          lime: '#9BE564',
          gray: '#F4F6F8',
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        heading: ['Poppins', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        brand: '0 14px 30px rgba(10, 37, 64, 0.16)',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [
    plugin(({ addComponents, theme }) => {
      const baseButton = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme('spacing.2'),
        borderRadius: theme('borderRadius.full'),
        fontFamily: theme('fontFamily.heading'),
        fontWeight: theme('fontWeight.semibold'),
        paddingInline: theme('spacing.5'),
        paddingBlock: theme('spacing.3'),
        transitionProperty: 'transform, box-shadow, background-color, border-color, color',
        transitionDuration: '200ms',
        transitionTimingFunction: theme('transitionTimingFunction.out-soft'),
        lineHeight: theme('lineHeight.tight'),
        whiteSpace: 'nowrap',
      };

      addComponents({
        '.btn-primary': {
          ...baseButton,
          backgroundColor: theme('colors.brand.dark'),
          color: theme('colors.white'),
          boxShadow: theme('boxShadow.brand'),
          borderWidth: '1px',
          borderColor: 'transparent',
          '&:hover, &:focus-visible': {
            transform: 'translateY(-2px)',
            boxShadow: '0 18px 38px rgba(10, 37, 64, 0.22)',
            backgroundColor: theme('colors.brand.cyan'),
          },
          '&:focus-visible': {
            outline: '2px solid transparent',
            outlineOffset: '2px',
            boxShadow: `0 0 0 3px rgba(59, 175, 218, 0.45)`,
          },
        },
        '.btn-secondary': {
          ...baseButton,
          backgroundColor: theme('colors.brand.cyan'),
          color: theme('colors.brand.dark'),
          borderWidth: '1px',
          borderColor: theme('colors.brand.cyan'),
          '&:hover, &:focus-visible': {
            transform: 'translateY(-2px)',
            backgroundColor: theme('colors.brand.lime'),
            borderColor: theme('colors.brand.lime'),
          },
          '&:focus-visible': {
            outline: '2px solid transparent',
            outlineOffset: '2px',
            boxShadow: `0 0 0 3px rgba(155, 229, 100, 0.45)`,
          },
        },
        '.btn-ghost': {
          ...baseButton,
          backgroundColor: 'transparent',
          color: theme('colors.brand.dark'),
          borderWidth: '1px',
          borderColor: `rgba(10, 37, 64, 0.16)`,
          '&:hover, &:focus-visible': {
            backgroundColor: 'rgba(10, 37, 64, 0.08)',
            borderColor: 'rgba(10, 37, 64, 0.16)',
            transform: 'translateY(-1px)',
          },
          '&:focus-visible': {
            outline: '2px solid transparent',
            outlineOffset: '2px',
            boxShadow: `0 0 0 3px rgba(10, 37, 64, 0.25)`,
          },
        },
      });
    }),
  ],
};
