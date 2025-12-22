/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#F7F9FC",
                primary: "#1F2937",
                secondary: "#6B7280",
                feedback: {
                    success: "#22C55E",
                    warning: "#F59E0B",
                    error: "#EF4444",
                },
                chapter1: {
                    gold: "#F4D06F",
                    sky: "#7DD3FC",
                    accent: "#FBBF24",
                },
                chapter2: {
                    moss: "#4ADE80",
                    bark: "#92400E",
                    accent: "#22C55E",
                },
                chapter3: {
                    river: "#38BDF8",
                    mist: "#E0F2FE",
                    accent: "#60A5FA",
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // We'll need to import Inter in index.css
            },
            borderRadius: {
                'card': '16px',
            }
        },
    },
    plugins: [],
}
