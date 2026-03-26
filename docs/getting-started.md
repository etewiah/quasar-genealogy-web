# Getting Started

## Prerequisites

- **Node.js** `^16`, `^18`, or `^20`
- **npm** `>= 6.13.4` or **yarn** `>= 1.21.1`
- **Quasar CLI** (install globally if not already present):
  ```bash
  npm install -g @quasar/cli
  ```

---

## Installation

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd quasar-genealogy-web
yarn
# or
npm install
```

---

## Development Server

Start the app with hot-reloading:

```bash
quasar dev
```

The app will be available at `http://localhost:9000` (or the next available port).

---

## Building for Production

```bash
quasar build
```

Output is placed in `dist/spa/` (for SPA mode) or `dist/ssr/` (for SSR mode).

---

## Running with SSR

The project includes an SSR server in `src-ssr/`. To develop with SSR:

```bash
quasar dev -m ssr
```

To build for SSR:

```bash
quasar build -m ssr
```

Note: Components that access `window` must guard against SSR using `<q-no-ssr>` or `typeof window !== 'undefined'` checks. See `QrCodeShare.vue` for an example.

---

## Linting and Formatting

```bash
# Lint
yarn lint

# Format (Prettier)
yarn format
```

---

## Routes

| Path | Name | Description |
|---|---|---|
| `/` | `rLandingPage` | Project intro / landing page |
| `/static-data` | `rTopolaStaticDataPage` | Interactive family tree viewer |
| `/static-data?personID=I1` | — | Viewer focused on person with ID `I1` |

---

## Configuration

Quasar build configuration is in `quasar.config.js`. See [Quasar docs](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js) for all available options.

Path aliases are configured in `jsconfig.json`. The `src/` directory is aliased as `src/` throughout the project (e.g. `import ... from 'src/compose/useTopolaData'`).
