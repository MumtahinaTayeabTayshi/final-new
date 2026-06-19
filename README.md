# Olive Food Ordering React App

A complete React.js food ordering frontend rebuilt as a standalone project. It includes restaurant information, search, categories, food cards, add-to-cart customization, add-ons, quantity controls, desktop cart, mobile bottom cart, checkout form, localStorage cart persistence, and order success state.

## How to run

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal, usually `http://localhost:5173`.

## Build for production

```bash
npm run build
npm run preview
```

## Main files

- `src/App.jsx` — application state and main layout
- `src/data/menu.js` — restaurant details, categories, menu items, sizes, add-ons
- `src/components/` — reusable React components
- `src/styles.css` — responsive UI styling

## Notes

This is a React frontend-only project. Checkout and order placement are simulated in the browser. No backend, database, real payment gateway, or private API credentials are included.
