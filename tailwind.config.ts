import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            // الخط الأساسي - IBM Plex Arabic
            fontFamily: {
                arabic: ["IBM Plex Sans Arabic", "sans-serif"],
            },
            // ألوان المشروع
            colors: {
                // ألوان الـ Gradient الأساسي
                hub: {
                    red: "#E63E32",
                    orange: "#F18A21",
                    yellow: "#F8C033",
                },
                // ألوان Workspace (احترافي)
                workspace: {
                    primary: "#1a1a2e",
                    secondary: "#16213e",
                    accent: "#0f3460",
                    text: "#eaeaea",
                },
                // ألوان Entertainment (مطرقعة)
                entertainment: {
                    primary: "#E63E32",
                    secondary: "#F18A21",
                    accent: "#F8C033",
                },
                // ألوان Glassmorphism
                glass: {
                    white: "rgba(255, 255, 255, 0.1)",
                    dark: "rgba(0, 0, 0, 0.3)",
                    border: "rgba(255, 255, 255, 0.2)",
                },
            },
            // تأثيرات الـ Glassmorphism
            backdropBlur: {
                glass: "20px",
            },
            // ظلال مخصصة
            boxShadow: {
                glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                glow: "0 0 20px rgba(230, 62, 50, 0.5)",
            },
            // أنيميشن
            animation: {
                "fade-in": "fadeIn 0.5s ease-in-out",
                "slide-up": "slideUp 0.3s ease-out",
                "pulse-glow": "pulseGlow 2s infinite",
                "fill-up": "fillUp 2s ease-in-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                pulseGlow: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(230, 62, 50, 0.5)" },
                    "50%": { boxShadow: "0 0 40px rgba(241, 138, 33, 0.8)" },
                },
                fillUp: {
                    "0%": { clipPath: "inset(100% 0 0 0)" },
                    "100%": { clipPath: "inset(0 0 0 0)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
