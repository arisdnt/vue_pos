/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Windows 10 theme colors
                win: {
                    bg: '#f3f3f3',
                    panel: '#ffffff',
                    border: '#cccccc',
                    text: '#000000',
                    'text-secondary': '#666666',
                    accent: '#0078d4',
                    'accent-hover': '#106ebe',
                    'accent-active': '#005a9e',
                }
            },
            borderRadius: {
                // No rounded corners for Windows 10 feel
                'none': '0',
                DEFAULT: '0',
            },
            fontFamily: {
                sans: ['Segoe UI', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
