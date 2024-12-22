// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      transitionProperty: {
        'all': 'all',
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
      },
      transitionDuration: {
        '300': '300ms',
        '500': '500ms',
        '1000': '1000ms',
      },
    },
  },
};
