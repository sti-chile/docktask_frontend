/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        /* Paleta oficial DockTI — Manual de Identidad Visual v1.0 (Junio 2026).
           Los nombres siguen al manual; no inventar colores nuevos aca. */
        brand: {
          blue: '#0D47A1', // Azul Cobalto Profundo — titulares, estabilidad, software
          lime: '#A3C614', // Verde Lima / Musgo Vivo — acentos; NUNCA parrafos largos
          red: '#E57373', // Terracota / Calafate Seco — acentos cineticos, sinapsis
          pearl: '#CFD8DC', // Gris Perla / Piedra Tundra — lineas y fondos limpios
          slate: '#546E7A', // Gris Pizarra — submarca STI Chile y texto secundario
          ink: '#1A1A1A', // Tinta — cuerpo de texto y monocromatico
          /* Derivado, NO esta en el manual: tinte claro tomado de la portada
             para superficies amplias (fondo del footer). */
          surface: '#F5F7F1',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        /* Colores personalizados para música */
        music: {
          bg: 'hsl(var(--music-bg))',
          card: 'hsl(var(--music-card))',
          border: 'hsl(var(--music-border))',
          text: 'hsl(var(--music-text))',
          wave: 'hsl(var(--music-wave))',
          waveSecondary: 'hsl(var(--music-wave-secondary))',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
