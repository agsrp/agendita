/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0F1115", // Midnight Void
                surface: {
                    DEFAULT: "#1A1D23", // Deep Metal
                    glass: "rgba(255, 255, 255, 0.05)",
                },
                primary: {
                    DEFAULT: "#6366F1", // Indigo
                    action: "#6366F1",
                },
                secondary: "#64748B", // Slate 500
                text: {
                    primary: "#F8FAFC",
                    secondary: "#94A3B8",
                },
                accent: {
                    success: "#10B981", // Emerald
                    urgent: "#F43F5E", // Rose
                },
                border: "rgba(255, 255, 255, 0.05)",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Satoshi', 'Inter', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            scale: {
                '102': '1.02',
            }
        },
    },
    plugins: [],
}
