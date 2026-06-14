# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Backend and Firebase Integration

This React frontend connects to the shared backend in `../backend/`. Both the web app and mobile app use the same backend server.

### Development Setup

1. **Start the shared backend** (see `../backend/README.md`):
   ```bash
   cd ../backend
   npm install
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

2. **Configure the web frontend** (this directory):
   ```bash
   cp .env.example .env
   # .env should have: VITE_API_BASE=http://localhost:5000
   ```

3. **Start the frontend dev server**:
   ```bash
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

The Vite dev server proxies `/api/*` requests to the backend at `http://localhost:5000`.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
