# MediFind

MediFind is a healthcare discovery project with three working parts:

- A Node.js + Express backend API
- A React Native mobile app built with Expo
- A static web frontend in `web/` that is served by the backend

The current backend uses MongoDB with Mongoose. 

## Current Status

- Backend API is implemented and wired to MongoDB
- Mobile app supports auth, symptom-based doctor discovery, hospital browsing, doctor and hospital detail pages, and bookmarks
- Static web client is implemented and consumes the same API
- Seed data is available for local demos
- Some profile-area items are still placeholders: appointments, notifications, privacy/security, and help/support
- A few legacy Sequelize-era files still exist in the repo but are not used by the running server

## Tech Stack

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs

### Mobile App

- React Native
- Expo
- React Navigation
- AsyncStorage
- Expo Location
- Axios

### Web

- HTML
- CSS
- Vanilla JavaScript

## Key Features

- Register and log in with JWT-based authentication
- Persist auth state in mobile using AsyncStorage
- Recommend doctors from symptom input plus user location
- Browse hospitals with emergency filtering
- View detailed doctor profiles with hospital visit schedules
- View detailed hospital profiles with facilities and doctor rosters
- Bookmark doctors and hospitals for a signed-in user
- Access a separate browser-based web UI powered by the same backend

## Data Snapshot

The current seed file populates:

- 30 doctors
- 12 hospitals
- 16+ specializations

The backend auto-seeds on startup if the doctors collection is empty.

## Project Structure

```text
medifind/
|-- backend/
|   |-- config/
|   |   `-- database.js          # MongoDB connection via Mongoose
|   |-- controllers/
|   |   |-- authController.js
|   |   |-- doctorController.js
|   |   `-- hospitalController.js
|   |-- middleware/
|   |   `-- auth.js              # JWT auth middleware
|   |-- models/
|   |   |-- Doctor.js
|   |   |-- Hospital.js
|   |   |-- User.js
|   |   |-- DoctorHospital.js    # Legacy Sequelize file, not used by current server
|   |   `-- index.js
|   |-- routes/
|   |   |-- authRoutes.js        # Active route file
|   |   |-- doctorRoutes.js      # Active route file
|   |   |-- hospitalRoutes.js    # Active route file
|   |   |-- auth.js              # Legacy route file
|   |   |-- doctors.js           # Legacy route file
|   |   `-- hospitals.js         # Legacy route file
|   |-- seeders/
|   |   `-- seed.js
|   |-- utils/
|   |   |-- haversine.js
|   |   `-- symptomMapper.js
|   |-- .env.example
|   |-- package.json
|   |-- railway.json
|   `-- server.js
|-- frontend/
|   |-- src/
|   |   |-- context/
|   |   |   `-- AuthContext.js
|   |   |-- navigation/
|   |   |   `-- AppNavigator.js
|   |   |-- screens/
|   |   |   |-- SplashScreen.js
|   |   |   |-- AuthScreen.js
|   |   |   |-- HomeScreen.js
|   |   |   |-- DoctorListScreen.js
|   |   |   |-- DoctorProfileScreen.js
|   |   |   |-- HospitalsScreen.js
|   |   |   |-- HospitalProfileScreen.js
|   |   |   |-- ProfileScreen.js
|   |   |   `-- PlaceholderScreen.js
|   |   `-- utils/
|   |       |-- api.js
|   |       `-- constants.js
|   |-- App.js
|   |-- app.json
|   |-- babel.config.js
|   |-- tailwind.config.js
|   `-- package.json
|-- web/
|   |-- index.html
|   |-- style.css
|   |-- app.js
|   `-- vercel.json
|-- updateTheme.js
`-- README.md
```

## Backend Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create environment file

```bash
cp .env.example .env
```

Use these variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medifind
JWT_SECRET=medifind_super_secret_2026
JWT_EXPIRES_IN=7d
```

### 3. Start the API

```bash
npm run dev
```

Expected startup behavior:

- Connects to MongoDB
- Seeds the database automatically if no doctors exist
- Serves the API on `http://localhost:5000/api`
- Serves the web frontend on `http://localhost:5000`

### 4. Reseed data manually

```bash
npm run seed
```

Important: `npm run seed` clears existing doctor and hospital collections before inserting fresh seed data.

## Mobile App Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure the API base URL

Update `frontend/src/utils/constants.js`:

```javascript
export const API_BASE_URL = 'http://YOUR_LOCAL_IP:5000/api';
```

Common values:

- Physical device: `http://YOUR_LOCAL_IP:5000/api`
- Android emulator: `http://10.0.2.2:5000/api`
- iOS simulator: `http://localhost:5000/api`

### 3. Start Expo

```bash
npx expo start
```

## Web App Setup

The web frontend is in `web/` and is already served by the backend.

### Run locally

1. Start the backend
2. Open `http://localhost:5000`

### If deploying the web app separately

Update the API constant in `web/app.js`:

```javascript
const API = 'http://localhost:5000/api';
```

Replace it with your deployed backend URL if the web app is not being served from the same Node server.

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Log in |
| GET | `/api/auth/profile` | Yes | Get current user profile |
| POST | `/api/auth/bookmark` | Yes | Toggle a doctor or hospital bookmark |
| POST | `/api/doctors/recommend` | No | Symptom + location based recommendations |
| GET | `/api/doctors` | No | List doctors, optionally filtered |
| GET | `/api/doctors/:id` | No | Get one doctor profile |
| GET | `/api/hospitals` | No | List hospitals |
| GET | `/api/hospitals/:id` | No | Get one hospital profile |
| GET | `/api/hospitals/symptoms` | No | Get symptom-to-specialist mapping |
| GET | `/api/health` | No | API health check |

### Bookmark request body

```json
{
  "type": "doctor",
  "id": "doctor-or-hospital-id"
}
```

### Recommendation request example

```json
{
  "symptoms": ["Chest Pain", "Headache"],
  "latitude": 19.076,
  "longitude": 72.8777,
  "radius": 100
}
```

## Current Mobile Screens

1. Splash screen
2. Login/register screen
3. Home screen with symptom search and nearby hospitals
4. Doctor results screen
5. Doctor profile screen
6. Hospitals listing screen
7. Hospital profile screen
8. Profile screen with bookmark counts and settings menu
9. Placeholder screen for not-yet-built profile sections

## Current Web Screens

- Landing page
- Specialization browsing
- Area-based doctor discovery
- Hospital listing page
- Doctor listing page
- Doctor detail page
- Hospital detail page
- About page
- Auth modal for login and signup

## Notes and Limitations

- The current app uses MongoDB, not PostgreSQL
- `frontend/src/utils/constants.js` currently contains a hardcoded local API URL and should be updated per machine
- `web/app.js` also contains a hardcoded API base URL for local development
- No demo user is seeded automatically; create an account from the app or web UI
- Symptom recommendations are keyword-based, not NLP-based
- Some profile menu items still lead to placeholder screens
- Legacy Sequelize files remain in the repo but are not part of the active backend runtime

## Deployment Notes

- `backend/railway.json` is included for Railway deployment
- `web/vercel.json` is included for separate static deployment of the web frontend

## Health Check

After starting the backend, verify:

- API: `http://localhost:5000/api/health`
- Web: `http://localhost:5000`

