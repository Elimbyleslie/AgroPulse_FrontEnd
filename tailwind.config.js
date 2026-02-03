/** @type {import('tailwindcss').Config} */
export default {
   content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
   extend: {
      colors: {
        text: "#5A5A5A",
        vert: "#16A34A",
        jaune: "#E3BA3E",
        modalBg: "#264555",
        bleu: "#607FE2",
        rouge: "#EC1313",
        dark_vert: "#084C29",
        // bg_dash: "#FBFCFC",
        btn: "#D6D6D6",
        bg_dash:"#F8FAFC",
        news: "#E9E4CB",
        white: "#FFFFFF",
        darkText: "#2B2B2B",
        darkVert: "#0D8821",
        darkJaune: "#D9B139",
        darkBleu: "#607FE2",
        darkRouge: "#EC1313",
        darkBleuVert: "#0D8849",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    container: {
      // center: true, // centre le container
      padding: {
        DEFAULT: '0.75rem', // pour les écrans < sm (par défaut)
        sm: '1rem',         // ≥ 640px
        md: '2rem',         // ≥ 768px
        lg: '3rem',         // ≥ 1024px
        xl: '5rem',         // ≥ 1280px
        '2xl': '6rem',      // ≥ 1536px
      },
      screens: {
        xs: '360px',  // ajout d'un breakpoint personnalisé "xs"
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
},
    },
  },
  plugins: [],
}

