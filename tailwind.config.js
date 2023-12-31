/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        screens: {
            mobile: '600px',
            tablet: '900px',
            desktop: '1200px',
        },
        extend: {},
    },
    plugins: [require('daisyui')],
};
