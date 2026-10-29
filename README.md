# clock it

A calendar made of clocks, built on the **MERN** stack (MongoDB, Express, React, Node.js).
Every day is a 24-hour dial: midnight at the top, noon at the bottom. Sign up, open a day, drag around the clock (or type exact times), name it, pick a colour, and press ✓. Overlapping tasks float on separate orbits. Browse by week, month or year, in light or dark mode, with 12h or 24h time.

## Project requirements → where they live

| Requirement | Implementation |
| --- | --- |
| MERN stack | `server/` = Node + Express + MongoDB (Mongoose). `client/` = React (Vite). |
| Home page | `client/src/pages/HomePage.jsx`: hero with a live demo clock, features, how-it-works. |
| At least 3 forms with validation | **Sign up** (`RegisterPage`), **Log in** (`LoginPage`) and the **time-block form** (`Composer`: typed times, label, preset, colour). Each validates in the browser (`lib/validators.js`, `hooks/useForm.js`, `TimeField`) *and* on the server (`server/src/validation/schemas.js`, zod). Server field errors show under the matching field. |
| HTML5 | Semantic elements, `type="email"` / `password`, `required`, `minLength`, `maxLength`, `autocomplete`, `<select>`, `<textarea>`, checkbox. |
| CSS | Hand-written CSS with design tokens, light/dark themes, responsive down to 375px. |
| JavaScript / React | React 19 components and hooks, React Router, Motion for animation. |
| Database | MongoDB collections: `users`, `blocks`. |
| Deployment | Not done yet. See [Deploying](#deploying). |

## Running locally

Requires Node 22.9+ (developed on Node 24).

```bash
npm run install:all   # installs root, server and client
npm run dev           # API on :5000, site on :5173
```

Open http://localhost:5173.

**No MongoDB install needed for development.** If `MONGODB_URI` isn't set, the server starts an embedded MongoDB (`mongodb-memory-server`). Its data is kept in `~/.clock-it/mongo` (override with `EMBEDDED_DB_PATH`). The first start downloads a MongoDB binary, so it can take a minute.

To use a real database, copy `server/.env.example` to `server/.env` and set `MONGODB_URI` (MongoDB Atlas works) and `JWT_SECRET`.

## API

All responses are JSON. Validation failures return `400 { message, errors: { field: message } }`.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | – | Server and database status |
| POST | `/api/auth/register` | – | Create account → `{ token, user }` |
| POST | `/api/auth/login` | – | Log in → `{ token, user }` |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/blocks?from=YYYY-MM-DD&to=YYYY-MM-DD` | ✓ | Blocks in a date range |
| POST | `/api/blocks` | ✓ | Create a block |
| PUT | `/api/blocks/:id` | ✓ | Update a block |
| DELETE | `/api/blocks/:id` | ✓ | Delete a block |
| DELETE | `/api/blocks?date=YYYY-MM-DD` | ✓ | Clear a day |
| POST | `/api/blocks/copy` | ✓ | Replace day `to` with a copy of day `from` |

Auth is a JWT sent as `Authorization: Bearer <token>`. Passwords are hashed with bcrypt. Users can only read or change their own blocks. Auth routes are rate-limited, and `helmet` sets security headers.

## Structure

```
client/                 React app (Vite)
  src/pages/            Home, Calendar, Login, Register, 404
  src/components/       Reusable UI built from scratch (below)
  src/hooks/            useForm, useAuth, useSchedule, useRingDrag, useClockFormat, …
  src/lib/              api client, validators, dates, colours, categories
server/                 Express API
  src/models/           User, Block (Mongoose)
  src/routes/           auth, blocks
  src/middleware/       auth (JWT), validate (zod), errors
  src/validation/       zod schemas shared by routes and models
```

### Reusable components (built from scratch)

| Component | Used in |
| --- | --- |
| `OrbitClock` | Full-screen day clock and the home page demo: hour face, duration track, drag-to-pick, labelled pills on four orbits. |
| `Dial` | Every small clock: logo, week cards, month grid, year grid. |
| `DayCell` | Week, month and year views. |
| `Field` | Every form control: input, select, textarea, checkbox, with label, hint and error. |
| `FormCard` | Shell for the sign up and log in forms. |
| `Composer` | Names a picked time range. Nothing is saved until ✓. |
| `TimeField` | Typed time input (`945`, `9:45`, `21:45`, `9:45pm`); ↑ / ↓ moves 15 min. |
| `ColorPicker` | 10-colour swatch radio group. |
| `SegmentedControl` | View switcher, 12h/24h switch, preset picker. |
| `Button` / `Icon` | Every button in the app. |
| `Overlay` | Full-screen day view. |
| `SiteHeader` | Site navigation, theme toggle, account actions. |
| `Legend` | Hour totals per category. |

`client/src/components/reactbits/` holds `CountUp` and `BlurText`, vendored unmodified from [React Bits](https://reactbits.dev) (MIT + Commons Clause).

## Deploying

GitHub Pages only serves static files, so it can host the **React client** but not the Express API or the database. The plan:

1. **Database:** a free MongoDB Atlas cluster. Copy its connection string.
2. **API:** a Node host such as Render or Railway. Set `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production` and `CLIENT_ORIGIN=https://<user>.github.io`.
3. **Client:** GitHub Pages, built with `VITE_API_URL=https://<your-api-host>`. The app uses hash URLs (`/#/calendar`) so page refreshes work on Pages.
