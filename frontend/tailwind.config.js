/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // <-- ESTA LÍNEA ES VITAL
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    navy: '#062044',
                    primary: '#0D47A1',
                    blue: '#1976D2',
                    red: '#E53935',
                    green: '#2E7D32',
                    yellow: '#FFC107',
                },
            },
            fontFamily: {
                sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
