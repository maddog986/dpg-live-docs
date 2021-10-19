const { colors } = require(`tailwindcss/defaultTheme`)
const plugin = require('tailwindcss/plugin')

module.exports = {
  mode: "jit", // see https://tailwindcss.com/docs/just-in-time-mode
  purge: ["./components/**/*.js", "./components/**/*.jsx", "./pages/**/*.js", "./docs/**/*.mdx"],
  darkMode: false, // or "media" or "class"
  theme: {
    extend: {
      animation: {
        'fadein': 'fadein 500ms ease-in-out'
      },
      borderWidth: {
        3: 3
      },
      colors: {
        aurora: {
          '100': '#BF616A',
          '200': '#D08770',
          '300': '#EBCB8B',
          '400': '#A3BE8C',
          '500': '#B48EAD'
        },
        facebook: '#3b5998',
        frost: {
          '100': '#8FBCBB',
          '200': '#88C0D0',
          '300': '#81A1C1',
          '400': '#5E81AC'
        },
        github: '#333',
        gray: colors.trueGray,
        linkedin: '#0077b5',
        // https://www.nordtheme.com/
        night: {
          '100': '#4C566A',
          '200': '#434C5E',
          '300': '#3B4252',
          '400': '#2E3440'
        },
        snow: {
          '100': '#ECEFF4',
          '200': '#E5E9F0',
          '300': '#D8DEE9'
        },
        // gray: colors.trueGray,
        twitter: '#1DA1F2'
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          md: "2rem"
        }
      },
      gridTemplateColumns: {
        'site-lg': '260px minmax(0px, 1fr) 260px',
        'site-sm': '260px minmax(0px, 1fr)'
      },
      keyframes: {
        fadein: {
          '0%': {
            opacity: 0
          },
          '100%': {
            opacity: 1
          }
        }
      },
      maxHeight: {
        '1/2': '50vh',
        'none': 'none'
      },
      minWidth: {
        'screen': '100vw'
      },
      typography: {
        DEFAULT: {
          css: {
            lineHeight: 1.3,

            '> :first-child': {
              paddingTop: 0
            },
            a: {
              color: '#4C566A',
              textDecoration: null,
              lineHeight: 1.1,
              letterSpacing: '-.5px',

              '&:hover': {
                textDecoration: 'underline',
                color: '#2E3440'
              }
            },
            h1: {
              color: '#3B4252',
              marginBottom: '1.25rem',
              marginTop: null,
              lineHeight: 1.1
            },
            h2: {
              color: '#3B4252',
              marginBottom: '1.25rem',
              marginTop: null,
              lineHeight: 1.1
            },
            h3: {
              color: '#4C566A',
              marginBottom: '.5rem',
              fontWeight: 500,
              marginTop: null,
              lineHeight: 1.1
            },
            h4: {
              borderBottom: '2px dashed #D8DEE9',
              color: '#4C566A',
              marginBottom: '.5rem',
              fontSize: "1.25em",
              fontWeight: 500,
              marginTop: null,
              lineHeight: 1.1
            },
            p: {
              color: '#4C566A',
              marginTop: 0,
              marginBottom: '1.25rem',
              lineHeight: 1.5
            },
            "p + div": {
              marginBottom: '1.25rem',
            },
            "p + h2, div + h2, div + h3, div + h4": {
              marginTop: '2.5rem',
            }
          }
        }
      }
    },
    screens: {
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
    fill: theme => (theme('colors', {})) // add all colors to fill
  },
  plugins: [
    require("@tailwindcss/typography"),

    plugin(function ({ theme, addComponents }) {
      addComponents(Object.entries(theme('screens', {})).map(([name, value]) => ({ [`.min-w-screen-${name}`]: { minWidth: value } })))
    }),

  ],
}
