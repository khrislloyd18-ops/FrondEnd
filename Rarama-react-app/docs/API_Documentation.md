# API documentation (endpoints and expected responses)

- **List of technologies used with versions**
	- **React** `18.2.0` — UI library
	- **React DOM** `18.2.0` — DOM rendering
	- **React Router DOM** `6.8.0` — client-side routing
	- **React Scripts (Create React App)** `5.0.1` — build tooling
	- **Axios** `1.3.0` — HTTP client for backend API calls
	- **Recharts** `2.4.3` — chart components (enrollment, attendance, distribution)
	- **Chart.js** `4.2.0` — charting library (peer dependency of react-chartjs-2)
	- **react-chartjs-2** `5.2.0` — Chart.js React wrapper
	- **Framer Motion** `9.0.2` — animations and transitions
	- **React Hot Toast** `2.4.0` — toast notifications
	- **React Icons** `4.7.1` — icon set
	- **@headlessui/react** `1.7.7` — accessible UI primitives
	- **@heroicons/react** `2.0.13` — Heroicons icon set
	- **date-fns** `2.29.3` — date utility functions
	- **jsPDF** `4.2.0` — PDF export
	- **jspdf-autotable** `5.0.7` — table plugin for jsPDF
	- **react-intersection-observer** `9.16.0` — scroll-based visibility detection
	- **Tailwind CSS** `3.2.4` — utility-first CSS framework
	- **PostCSS** `8.4.21` — CSS processing
	- **Autoprefixer** `10.4.13` — CSS vendor prefixes
	- **eslint-plugin-react-hooks** `7.0.1` — React Hooks lint rules
	- **Backend**: Laravel `12` + Sanctum (token auth) + MySQL `8+`
	- **External API**: OpenWeatherMap (free tier)

- **Purpose**
	- This document describes the API surface currently consumed by the Rarama React frontend.
	- Response shapes below are based on what the frontend actually reads from the backend and external weather services.
	- For collection endpoints, the frontend accepts either a raw array or a Laravel-style wrapper such as `{ "data": [...] }`.

- **Base URLs**
	- Backend API base URL: `REACT_APP_API_URL`
	- Default backend API URL: `http://127.0.0.1:8000/api`
	- Weather API base URL: `REACT_APP_WEATHER_API_URL`
	- Default weather API URL: `https://api.openweathermap.org/data/2.5`

- **.env.example file with required environment variables**
	- The frontend currently reads these environment variables.
	- This is documentation only. Copy the template to `.env` and replace placeholder values where needed.
	- All frontend environment variables must start with `REACT_APP_`.

```env
# Copy this file to .env and replace placeholder values where needed.
# All frontend environment variables must start with REACT_APP_.

# Laravel backend API base URL
REACT_APP_API_URL=http://127.0.0.1:8000/api

# OpenWeather API base URL
REACT_APP_WEATHER_API_URL=https://api.openweathermap.org/data/2.5

# OpenWeather API key required for live weather data
REACT_APP_WEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY_HERE
```

	- `REACT_APP_API_URL`: backend API base URL used by auth, profile, students, courses, reports, and dashboard requests.
	- `REACT_APP_WEATHER_API_URL`: weather API base URL used by the weather service and widget.
	- `REACT_APP_WEATHER_API_KEY`: required for live weather search, current conditions, forecast, and location weather.

- **Authentication Behavior**
	- Protected backend requests send `Authorization: Bearer <token>`.
	- The frontend reads the token from `localStorage.getItem('token')`.
	- On `401 Unauthorized`, the frontend clears `token` and `user` from local storage and redirects to `/login`.
	- On `422 Unprocessable Entity`, the frontend expects validation errors in this shape:

```json
{
	"message": "The given data was invalid.",
	"errors": {
		"email": ["The email field is required."],
		"password": ["The password field is required."]
	}
}
```

- **General Response Patterns**
	- Collection endpoints can return either:

```json
[
	{ "id": 1 }
]
```

	- Or:

```json
{
	"data": [
		{ "id": 1 }
	]
}
```

	- Profile and user endpoints can return a user record in any of these shapes:

```json
{ "user": { "id": 1, "name": "Admin" } }
```

```json
{ "data": { "user": { "id": 1, "name": "Admin" } } }
```

```json
{ "data": { "id": 1, "name": "Admin" } }
```

```json
{ "id": 1, "name": "Admin" }
```

- **Backend Endpoints**
	- **Auth Endpoints**
		- `POST /signin`
			- Purpose: authenticate a user.
			- Request body:

```json
{
	"email": "admin@university.edu",
	"password": "password123"
}
```

			- Expected success response:

```json
{
	"token": "access_token_here",
	"user": {
		"id": 1,
		"name": "Admin User",
		"email": "admin@university.edu",
		"avatar_url": "/storage/avatars/admin.jpg"
	}
}
```

			- Required by frontend: both `token` and `user` must be present.
			- Common errors: `401`, `422`.

		- `POST /register`
			- Purpose: create a new user account and log the user in.
			- Request body:

```json
{
	"name": "New User",
	"email": "new.user@university.edu",
	"password": "password123",
	"password_confirmation": "password123"
}
```

			- Expected success response:

```json
{
	"token": "access_token_here",
	"user": {
		"id": 2,
		"name": "New User",
		"email": "new.user@university.edu"
	}
}
```

			- Common errors: `422` with `errors.name`, `errors.email`, or `errors.password`.

		- `POST /logout`
			- Purpose: invalidate the current session token.
			- Request body: none.
			- Expected success response: any `2xx` response is accepted by the frontend.

		- `GET /me`
			- Purpose: fetch the currently authenticated user.
			- Expected user fields used by the frontend:
				- `id`
				- `name`
				- `email`
				- `avatar_url` or `profile_picture` or `avatar` or `image`
				- `contact_number` or `phone_number`
				- `birth_date` or `date_of_birth`

	- **Profile Endpoints**
		- The frontend supports multiple route variants for compatibility. The backend only needs to support one working variant in each group.

		- Update profile routes tried by the frontend:
			- `PUT /profile`
			- `PATCH /profile`
			- `PUT /me`
			- `POST /profile/update`

			- Request body:

```json
{
	"name": "Admin User",
	"contact_number": "+639001234567",
	"phone_number": "+639001234567",
	"birth_date": "2000-01-15"
}
```

			- Expected success response: any user-shaped payload matching one of the accepted user response patterns.

		- Avatar upload routes tried by the frontend:
			- `POST /profile/avatar`
			- `POST /profile/photo`
			- `POST /me/avatar`
			- `POST /profile/upload-avatar`

			- Request type: `multipart/form-data`
			- Uploaded form fields:
				- `avatar`
				- `profile_picture`
			- Expected success response: user payload or an object containing `avatar_url`.

		- Password change routes tried by the frontend:
			- `POST /profile/password`
			- `PUT /profile/password`
			- `PATCH /profile/password`
			- `POST /user/password`
			- `PUT /user/password`
			- `PATCH /user/password`
			- `POST /me/password`
			- `PUT /me/password`
			- `PATCH /me/password`
			- `POST /change-password`
			- `POST /update-password`
			- `POST /profile/change-password`
			- `POST /settings/password`
			- `POST /password/change`

			- Accepted request payload variants:

```json
{
	"current_password": "old-password",
	"password": "new-password",
	"password_confirmation": "new-password"
}
```

```json
{
	"current_password": "old-password",
	"new_password": "new-password",
	"new_password_confirmation": "new-password"
}
```

```json
{
	"currentPassword": "old-password",
	"newPassword": "new-password",
	"confirmPassword": "new-password"
}
```

			- Expected success response: any `2xx` response is accepted.

	- **Dashboard Endpoints**
		- `GET /dashboard/stats`
			- Purpose: summary cards on the dashboard.
			- Expected response:

```json
{
	"total_students": 500,
	"active_students": 450,
	"total_courses": 25,
	"average_attendance": 87.5,
	"graduated_students": 50
}
```

		- `GET /dashboard/enrollment-trends`
			- Purpose: monthly enrollment chart.
			- Expected response:

```json
[
	{ "year": 2025, "month": 1, "total": 35 },
	{ "year": 2025, "month": 2, "total": 42 }
]
```

			- Required fields: `month`, `year`, `total`.
			- `month` must be `1` to `12`.

		- `GET /dashboard/course-distribution`
			- Purpose: course distribution pie chart.
			- Expected response:

```json
[
	{
		"course_code": "CS101",
		"course_name": "Bachelor of Science in Computer Science",
		"students_count": 125,
		"department": "Computer Studies"
	}
]
```

			- The frontend also accepts `code` instead of `course_code`, and `name` instead of `course_name`.

		- `GET /dashboard/attendance-patterns`
			- Purpose: attendance trend chart.
			- Expected response:

```json
[
	{ "date": "2025-03-01", "attendance_percentage": 88 },
	{ "date": "2025-03-02", "attendance_percentage": 84 }
]
```

			- The frontend also accepts `attendance` instead of `attendance_percentage`.

		- `GET /dashboard/school-days`
			- Purpose: school calendar page.
			- Expected response:

```json
[
	{
		"date": "2025-08-18",
		"day_type": "event",
		"description": "Opening of classes",
		"attendance_percentage": 95
	}
]
```

			- Accepted date keys: `date`, `school_date`, `attendance_date`
			- Accepted type keys: `day_type`, `type`
			- Accepted description keys: `description`, `title`
			- Accepted attendance keys: `attendance_percentage`, `attendance`
			- Allowed day types used by the frontend: `holiday`, `event`, `exam`, `break`, `regular`
			- If this endpoint is unavailable, the frontend falls back to `GET /dashboard/attendance-patterns` and merges that data into the seeded calendar.

		- `GET /dashboard/department-stats`
		- `GET /dashboard/gender-demographics`
		- `GET /dashboard/course-analytics`
			- These routes are exported in the service layer but are not currently consumed by the visible UI in this workspace.

	- **Student Endpoints**
		- `GET /students`
			- Purpose: student list page and reports export.
			- Common query params used by frontend:

```text
per_page=500
per_page=1000
```

			- Expected response item shape:

```json
{
	"id": 1,
	"student_id": "STU-00001",
	"name": "Juan Dela Cruz",
	"first_name": "Juan",
	"last_name": "Dela Cruz",
	"email": "juan.delacruz@university.edu",
	"phone_number": "+639001234567",
	"address": "Tagum City",
	"gender": "male",
	"birth_date": "2004-06-12",
	"status": "enrolled",
	"enrollment_year": 2024,
	"semester": "1st",
	"year_level": "1st Year",
	"gpa": 1.75,
	"attendance": 92,
	"course": {
		"course_code": "CS101",
		"course_name": "Bachelor of Science in Computer Science"
	}
}
```

			- The frontend can also accept `course` as a plain string instead of an object.

		- `GET /students/{id}`
			- Purpose: fetch a single student record.
			- Expected fields: same core fields as the student list item.

		- `GET /students/demographics`
			- Exported in the service layer.
			- Not currently consumed by the visible UI in this workspace.

	- **Course Endpoints**
		- `GET /courses`
			- Purpose: courses page, reports export, and course count fallback.
			- Expected response item shape:

```json
{
	"id": 1,
	"course_code": "CS101",
	"course_name": "Bachelor of Science in Computer Science",
	"department": "Computer Studies",
	"description": "Program description",
	"duration_years": 4,
	"total_credits": 142,
	"degree_level": "bachelor",
	"is_active": true,
	"students_count": 245,
	"instructor": "Dr. Sarah Johnson",
	"schedule": "Mon-Wed-Fri, 9:00 AM - 5:00 PM"
}
```

			- Minimum fields the frontend relies on most often: `id`, `course_code`, `course_name`, `department`.
			- If `students_count`, `instructor`, `schedule`, or `is_active` are missing, the frontend applies defaults.

		- `GET /courses/{id}`
			- Purpose: fetch a single course record.
			- Expected fields: same core fields as the course list item.

		- `GET /departments`
			- Exported in the service layer.
			- Not currently consumed by the visible UI in this workspace.

	- **Legacy Chart Endpoints**
		- The service layer still exports these routes:
			- `GET /charts/enrollment-trends`
			- `GET /charts/course-distribution`
			- `GET /charts/attendance-patterns`
			- `GET /charts/stats`
			- `GET /charts/department-stats`
			- `GET /charts/recent-activities`
		- They are not used by the main dashboard page in the current workspace, but they should follow shapes similar to the `/dashboard/*` endpoints.

- **External Weather API Endpoints**
	- Some weather features use raw OpenWeather responses, while the weather page also uses a normalized wrapper from `weatherService.js`.

	- **Raw OpenWeather endpoints used by the frontend**
		- `GET /geo/1.0/direct?q={query}&limit=7&appid={key}`
			- Purpose: city/autocomplete suggestions.
			- Expected response:

```json
[
	{
		"name": "Manila",
		"state": "Metro Manila",
		"country": "PH",
		"lat": 14.5995,
		"lon": 120.9842
	}
]
```

		- `GET /weather?q={city}&appid={key}&units=metric`
		- `GET /weather?lat={lat}&lon={lon}&appid={key}&units=metric`
			- Purpose: current conditions.
			- The widget reads fields such as:
				- `name`
				- `weather[0].main`
				- `weather[0].description`
				- `weather[0].icon`
				- `main.temp`
				- `main.temp_min`
				- `main.temp_max`
				- `wind.speed`
				- `sys.sunrise`
				- `sys.sunset`
				- `timezone`

		- `GET /forecast?q={city}&appid={key}&units=metric&cnt=40`
		- `GET /forecast?lat={lat}&lon={lon}&appid={key}&units=metric&cnt=40`
			- Purpose: 5-day forecast.
			- The widget reads `list[]`, especially `dt`, `dt_txt`, `main.temp`, `main.temp_min`, `main.temp_max`, `weather[0].description`, and `weather[0].icon`.

		- `GET /air_pollution?lat={lat}&lon={lon}&appid={key}`
			- Purpose: AQI data in `weatherService.js`.
			- Expected fields used by frontend:
				- `list[0].main.aqi`
				- `list[0].components`
				- `list[0].dt`

	- **Normalized weatherService return shapes**
		- `weatherService.getCurrentWeather(city)` returns:

```json
{
	"location": "Manila",
	"country": "PH",
	"temperature": 31,
	"feelsLike": 35,
	"humidity": 74,
	"pressure": 1008,
	"visibility": 10,
	"windSpeed": 4.2,
	"windDirection": 180,
	"description": "broken clouds",
	"icon": "04d",
	"sunrise": "Date object",
	"sunset": "Date object",
	"timestamp": "Date object"
}
```

		- `weatherService.getWeatherByCoords(lat, lon)` returns the same shape as `getCurrentWeather`.

		- `weatherService.getForecast(city)` returns a simplified 5-day array:

```json
[
	{
		"date": "Date object",
		"tempMin": 26,
		"tempMax": 32,
		"tempAvg": 29,
		"humidity": 76,
		"description": "light rain",
		"icon": "10d"
	}
]
```

		- `weatherService.getComprehensiveWeather(lat, lon)` returns current weather plus placeholders for `minutely`, `hourly`, and `alerts`.
		- `weatherService.getUVIndex(lat, lon)` currently returns `uvIndex: null` because the free OpenWeather plan does not expose a standalone UV endpoint used here.