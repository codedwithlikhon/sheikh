/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'code-bg': '#1e1e1e',
        'code-sidebar': '#252526',
        'code-border': '#3c3c3c',
        'code-text': '#cccccc',
        'code-accent': '#007acc',
        'code-success': '#4caf50',
        'code-error': '#f44336',
        'code-warning': '#ff9800',
      }
    },
  },
  plugins: [],
}
