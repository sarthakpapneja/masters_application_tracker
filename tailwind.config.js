/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'german-red': '#DE0002',
                'german-gold': '#FFCC00',
                'german-black': '#000000',
                'uni-blue': '#003366',
            },
        },
    },
    plugins: [],
}
