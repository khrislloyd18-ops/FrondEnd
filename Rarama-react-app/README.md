# Rarama React App

University Management Dashboard — frontend for UMTC built with React and a Laravel backend.

- **Overview**

Two separate codebases:

| Layer | Location |
|-------|----------|
| Frontend (this folder) | `FrondEnd/Rarama-react-app` |
| Backend | `BackEnd_RaramaKhris/BackEnd` |

- **Tech Stack**

**Frontend**
- React 18 (Create React App / `react-scripts` 5)
- React Router v6
- Tailwind CSS
- Framer Motion
- Recharts
- Axios
- React Hot Toast

**Backend**
- Laravel 12
- Laravel Sanctum (token auth)
- MySQL 8+

- **Features**

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Stats cards, enrollment/attendance/course charts, weather widget, recent activity |
| Students | `/students` | Student list with search, filters, pagination, attendance progress bars, detail modal |
| Courses | `/courses` | Course management |
| Reports | `/reports` | Analytics and reports |
| School Days | `/school-days` | Interactive monthly calendar with Philippine academic calendar (2025–2027) |
| Weather | `/weather` | Detailed weather station — current conditions and 5-day forecast |
| Login | `/login` | Authentication — supports demo mode without backend |

  - **School Days Calendar**

The calendar ships with a built-in seeder covering January 2025 through December 2027:

- All Philippine public holidays (fixed and moving: Easter, National Heroes Day)
- University academic milestones: registration, semester openings, midterms, finals, Christmas break, midyear term
- University events: Research Congress, Student Org Fair, Foundation Day, Intramurals, University Week, Commencement
- Priority-aware merge: backend API data overrides seed data automatically
- Year navigation is restricted to 2025–2027

  - **Demo Mode**

The app runs fully without a backend. Use the built-in demo account:

- **Email:** `admin@university.edu`
- **Password:** `password123`

---

- **Prerequisites**

- Node.js 18+ and npm
- PHP 8.2+
- Composer 2+
- MySQL 8+ (or MariaDB)
- Git

Verify versions:

```bash
node -v && npm -v && php -v && composer -V && mysql --version
```

---

- **Backend Setup (Laravel API)**

```bash
# 1. Navigate to the backend folder
cd C:/Users/Khris/Documents/GitHub/BackEnd_RaramaKhris/BackEnd

# 2. Install PHP dependencies
composer install

# 3. Create environment file
cp .env.example .env          # bash
# Copy-Item .env.example .env  # PowerShell

# 4. Configure database in .env
```

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=backend
DB_USERNAME=root
DB_PASSWORD=
```

```bash
# 5. Generate app key
php artisan key:generate

# 6. Run migrations and seed
php artisan migrate --seed

# 7. Create storage symlink
php artisan storage:link

# 8. Start the server
php artisan serve --host=127.0.0.1 --port=8000
```

API base URL: `http://127.0.0.1:8000/api`

> **Tip:** `composer dev` runs the server, queue listener, and Vite for backend assets together.

---

- **Frontend Setup (React App)**

```bash
# 1. Navigate to this folder
cd C:/Users/Khris/Documents/GitHub/FrondEnd/Rarama-react-app

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env          # bash
# Copy-Item .env.example .env  # PowerShell
```

4. Edit `.env` with your values:

```env
REACT_APP_API_URL=http://127.0.0.1:8000/api
REACT_APP_WEATHER_API_URL=https://api.openweathermap.org/data/2.5
REACT_APP_WEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY_HERE
```

> All environment variables **must** start with `REACT_APP_` — this is a Create React App requirement. Variables with any other prefix (e.g. `VITE_`) are silently ignored.

```bash
# 5. Start the dev server
npm start
```

App URL: `http://localhost:3000`

> Restart the dev server after any change to `.env` — CRA bakes env vars in at compile time.

  - **Weather Widget**

Requires a free [OpenWeatherMap](https://openweathermap.org/api) API key. Add it to `.env` as `REACT_APP_WEATHER_API_KEY`, then restart the dev server.

---

- **Quick Run Checklist**

```bash
# Terminal 1 — backend
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2 — frontend
cd C:/Users/Khris/Documents/GitHub/FrondEnd/Rarama-react-app
npm start
```

Open `http://localhost:3000` and log in.

---

- **Seeded Login Accounts**

These accounts are created by `php artisan migrate --seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@university.edu` | `password123` |
| User | `john.doe@university.edu` | `password123` |

---

- **Useful Commands**

**Frontend**

```bash
npm start        # development server
npm run build    # production build
npm test         # run test suite
```

**Backend**

```bash
php artisan serve
php artisan migrate --seed
php artisan db:seed --class=StudentSeeder
php artisan test
php artisan config:clear
```

---

- **API and Auth Notes**

- Public endpoints: `POST /api/signin`, `POST /api/register`
- All other endpoints require a Sanctum token: `Authorization: Bearer <token>`
- The frontend stores the token in `localStorage` and injects it via an Axios request interceptor
- The frontend falls back to mock/demo data when the backend is unreachable

---

- **CORS Notes**

Backend CORS is configured in `config/cors.php`. Currently allowed frontend origins:

- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5173`
- `http://127.0.0.1:3001`

Add your origin if you run the frontend on a different host or port, then run `php artisan config:clear`.

---

- **Troubleshooting**

**CORS errors in browser console**
- Confirm the backend is running.
- Confirm the frontend origin is in `allowed_origins`.
- Run `php artisan config:clear` after editing `config/cors.php`.

**401 Unauthorized after login**
- Verify `REACT_APP_API_URL` points to the correct running backend.
- Confirm `APP_KEY` is set in the backend `.env`.
- Re-login to obtain a fresh token.

**Weather widget not loading**
- Add `REACT_APP_WEATHER_API_KEY` to the frontend `.env`.
- Restart the dev server — env changes require a restart.

**School calendar shows wrong data**
- The calendar uses `localStorage` cache key `umtc-school-days-cache-v2`. Clear it in DevTools → Application → Local Storage to force a reload.

**Environment variables not picked up**
- Ensure all frontend variables start with `REACT_APP_` (not `VITE_` or any other prefix).
- Restart the dev server after editing `.env`.

---

- **Security Checklist**

- Store all secrets in `.env` — never hard-code them in source files.
- Add `.env` to `.gitignore` — never commit real credentials or API keys.
- Use HTTPS for API URLs in production.
- Validate and sanitize all inputs on the backend.
- Restrict backend CORS `allowed_origins` to known frontend domains only.
