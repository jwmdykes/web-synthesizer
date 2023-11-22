/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        screens: {
            mobile: '600px',
            tablet: '800px',
            desktop: '1100px',
        },
        extend: {},
    },
    plugins: [require('daisyui')],
};
