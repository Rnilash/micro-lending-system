/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './examples/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom color palette for micro-lending system
      colors: {
        // Primary brand colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Main brand color
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        
        // Success colors (for payments, profits)
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        
        // Warning colors (for overdue payments)
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        
        // Danger colors (for defaults, errors)
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        
        // Neutral grays
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        
        // Currency/money specific colors
        currency: {
          gold: '#ffd700',
          silver: '#c0c0c0',
          copper: '#b87333',
        },
        
        // Status-specific colors
        status: {
          active: '#10b981',
          inactive: '#6b7280',
          pending: '#f59e0b',
          completed: '#059669',
          defaulted: '#dc2626',
          overdue: '#ea580c',
        }
      },
      
      // Font families with Sinhala support
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sinhala: ['Noto Sans Sinhala', 'Iskoola Pota', 'sans-serif'],
        english: ['Inter', 'Arial', 'sans-serif'],
        bilingual: ['Noto Sans Sinhala', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      
      // Custom font sizes for Sinhala text
      fontSize: {
        'sinhala-xs': ['12px', { lineHeight: '1.6' }],
        'sinhala-sm': ['14px', { lineHeight: '1.6' }],
        'sinhala-base': ['16px', { lineHeight: '1.6' }],
        'sinhala-lg': ['18px', { lineHeight: '1.6' }],
        'sinhala-xl': ['20px', { lineHeight: '1.6' }],
        'sinhala-2xl': ['24px', { lineHeight: '1.5' }],
        'sinhala-3xl': ['30px', { lineHeight: '1.4' }],
        'sinhala-4xl': ['36px', { lineHeight: '1.3' }],
      },
      
      // Spacing for mobile-friendly interfaces
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
        '176': '44rem',
        '192': '48rem',
      },
      
      // Screen sizes optimized for tablets and mobile
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        'tablet': '768px',
        'laptop': '1024px',
        'desktop': '1280px',
      },
      
      // Container sizes
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      
      // Border radius
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      
      // Box shadows
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
        'hard': '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      
      // Animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      
      // Keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      
      // Background gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      },
      
      // Z-index scale
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      // Typography
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            lineHeight: '1.7',
            p: {
              marginTop: '1.25em',
              marginBottom: '1.25em',
            },
            'h1, h2, h3, h4': {
              fontFamily: 'inherit',
              fontWeight: '600',
            },
            code: {
              backgroundColor: '#f3f4f6',
              padding: '0.25rem 0.375rem',
              borderRadius: '0.375rem',
              fontSize: '0.875em',
            },
          },
        },
      },
    },
  },
  
  // Plugins
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    
    // Custom plugin for Sinhala text utilities
    function({ addUtilities, theme }) {
      const sinhalaUtilities = {
        '.text-sinhala': {
          fontFamily: theme('fontFamily.sinhala'),
          lineHeight: '1.6',
        },
        '.text-bilingual': {
          fontFamily: theme('fontFamily.bilingual'),
          lineHeight: '1.6',
        },
        '.direction-auto': {
          direction: 'auto',
        },
        '.writing-mode-horizontal': {
          writingMode: 'horizontal-tb',
        },
      };
      
      addUtilities(sinhalaUtilities);
    },
    
    // Custom plugin for touch-friendly components
    function({ addUtilities, theme }) {
      const touchUtilities = {
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },
        '.touch-padding': {
          padding: '12px 16px',
        },
        '.mobile-safe': {
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingTop: 'env(safe-area-inset-top)',
        },
      };
      
      addUtilities(touchUtilities);
    },
  ],
  
  // Dark mode
  darkMode: ['class', '[data-mode="dark"]'],
  
  // Important selector
  important: false,
  
  // Prefix
  prefix: '',
  
  // Separator
  separator: ':',
  
  // Core plugins
  corePlugins: {
    preflight: true,
  },
  
  // Future flags
  future: {
    hoverOnlyWhenSupported: true,
  },
};