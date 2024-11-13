import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: {
                    DEFAULT: "hsl(var(--background))",
                    overlay: 'rgba(0, 0, 0, 0.25)', // black/25
                },
                foreground: "hsl(var(--foreground))",
                neutral: {
                    DEFAULT: "hsl(var(--neutral))",
                    primary: '#2A2A2A',
                    secondary: '#191919',
                    border: 'rgba(255, 255, 255, 0.13)', // white/[0.13]
                    hover: '#FFFFFF1B',  // white/[0.17]
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                    primary: '#5D55FE',
                    light: '#A39EFF',
                    bg: '#5D55FE3B',
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                text: {
                    primary: '#EEEEEE',
                    secondary: '#7B7B7B',
                    tertiary: '#B4B4B4',
                },
                borders: {  // renamed from 'border' to 'borders' to avoid conflict
                    light: 'rgba(255, 255, 255, 0.2)', // white/20
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    plugins: [require("tailwindcss-animate"), require('tailwind-scrollbar')],
};

export default config;
