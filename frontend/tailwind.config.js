/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ember: "#f97316",
        mist: "#cbd5f5",
        night: "#020617",
        frost: "#7dd3fc"
      },
      boxShadow: {
        glow: "0 0 40px rgba(125, 211, 252, 0.15)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.18), transparent 30%), radial-gradient(circle at 80% 0%, rgba(249, 115, 22, 0.14), transparent 28%), linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 1))"
      }
    }
  },
  plugins: []
}

