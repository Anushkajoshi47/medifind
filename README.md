# 🏥 MediFind — Doctor & Hospital Finder App

A full-stack mobile application to help users find doctors and hospitals after relocating to a new place. Built with React Native (Expo) + Node.js + PostgreSQL.

---

## 📁 Project Structure

```
medifind/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   └── database.js         # Sequelize PostgreSQL config
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Bookmarks
│   │   ├── doctorController.js # Recommend, Get doctors
│   │   └── hospitalController.js
│   ├── middleware/
│   │   └── auth.js             # JWT middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Hospital.js
│   │   ├── DoctorHospital.js
│   │   └── index.js            # Associations
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   └── hospitalRoutes.js
│   ├── seeders/
│   │   └── seed.js             # 14 doctors + 5 hospitals
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/                   # React Native (Expo)
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js  # Auth state management
    │   ├── navigation/
    │   │   └── AppNavigator.js # Stack + Tab navigation
    │   ├── screens/
    │   │   ├── SplashScreen.js
    │   │   ├── AuthScreen.js
    │   │   ├── HomeScreen.js
    │   │   ├── DoctorListScreen.js
    │   │   ├── DoctorProfileScreen.js
    │   │   ├── HospitalProfileScreen.js
    │   │   ├── HospitalsScreen.js
    │   │   └── ProfileScreen.js
    │   └── utils/
    │       ├── api.js           # Axios API client
    │       └── constants.js     # Colors, icons, symptoms
    ├── App.js
    ├── app.json
    ├── babel.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

- Node.js v18+
- PostgreSQL 14+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (or Android Emulator / iOS Simulator)

---

## 🚀 Setup Instructions

### 1. Clone / Open the Project in VS Code

```bash
# Open VS Code and open the medifind/ folder
code medifind/
```

---

### 2. Set Up PostgreSQL Database

Open pgAdmin or use psql:

```sql
CREATE DATABASE medifind_db;
```

---

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medifind_db
DB_USER=postgres
DB_PASSWORD=your_actual_password
JWT_SECRET=medifind_super_secret_2024
JWT_EXPIRES_IN=7d
```

Install dependencies and seed:

```bash
npm install
npm run seed       # Seeds 14 doctors + 5 hospitals
npm run dev        # Start dev server with nodemon
```

You should see:
```
✅ Database connected
✅ Models synced
🚀 MediFind API running on port 5000
```

Test with: `http://localhost:5000/api/health`

---

### 4. Configure Frontend

```bash
cd ../frontend
npm install
```

Open `src/utils/constants.js` and update `API_BASE_URL`:

```javascript
// For physical phone: use your computer's local IP
export const API_BASE_URL = 'http://192.168.1.XXX:5000/api';

// For Android Emulator:
export const API_BASE_URL = 'http://10.0.2.2:5000/api';

// For iOS Simulator:
export const API_BASE_URL = 'http://localhost:5000/api';
```

Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

Start the app:

```bash
npx expo start
```

- Scan QR code with **Expo Go** app on your phone
- Press `a` for Android emulator
- Press `i` for iOS simulator

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/auth/profile` | Yes | Get profile |
| POST | `/api/auth/bookmark` | Yes | Toggle bookmark |
| POST | `/api/doctors/recommend` | No | Symptom-based recommendations |
| GET | `/api/doctors` | No | All doctors (with filters) |
| GET | `/api/doctors/:id` | No | Doctor profile |
| GET | `/api/hospitals` | No | All hospitals |
| GET | `/api/hospitals/:id` | No | Hospital profile |
| GET | `/api/hospitals/symptoms` | No | Symptom → specialization map |

---

### POST /api/doctors/recommend — Example

**Request:**
```json
{
  "symptoms": ["chest pain", "shortness of breath"],
  "latitude": 19.076,
  "longitude": 72.8777,
  "radius": 50
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "specializations": ["Cardiologist"],
    "doctors": [
      {
        "id": "...",
        "name": "Dr. Arjun Mehta",
        "specialization": "Cardiologist",
        "rating": 4.9,
        "experience": 15,
        "distance": 0.12,
        "hospitals": [...]
      }
    ],
    "total": 1
  }
}
```

---

## 🗄️ Database Schema

### users
| Column | Type |
|--------|------|
| id | UUID (PK) |
| name | STRING |
| email | STRING (unique) |
| password | STRING (hashed) |
| bookmarked_doctors | UUID[] |
| bookmarked_hospitals | UUID[] |

### doctors
| Column | Type |
|--------|------|
| id | UUID (PK) |
| name, specialization, bio | STRING |
| experience | INTEGER |
| education | STRING |
| rating | FLOAT |
| reviews_count | INTEGER |
| latitude, longitude | FLOAT |
| phone | STRING |
| consultation_fee | INTEGER |
| languages | STRING[] |

### hospitals
| Column | Type |
|--------|------|
| id | UUID (PK) |
| name, address, type | STRING |
| emergency | BOOLEAN |
| latitude, longitude | FLOAT |
| phone | STRING |
| rating | FLOAT |
| beds | INTEGER |
| facilities | STRING[] |

### doctor_hospitals (Junction)
| Column | Type |
|--------|------|
| doctor_id | UUID (FK) |
| hospital_id | UUID (FK) |
| visiting_days | STRING[] |
| timing | STRING |

---

## 🧠 Symptom → Specialist Mapping

| Symptom | Specialist |
|---------|-----------|
| Chest Pain, Heart Palpitations | Cardiologist |
| Headache, Migraine, Dizziness | Neurologist |
| Skin Rash, Acne, Eczema | Dermatologist |
| Stomach Pain, Nausea | Gastroenterologist |
| Joint Pain, Back Pain | Orthopedist |
| Fever, Cold | General Physician |
| Cough, Shortness of Breath | Pulmonologist |
| Anxiety, Depression | Psychiatrist |
| Eye Pain, Blurred Vision | Ophthalmologist |
| Ear Pain, Sore Throat | ENT Specialist |
| Tooth Pain | Dentist |
| Child Fever | Pediatrician |

---

## 📱 App Screens

1. **Splash Screen** — Animated logo + tagline
2. **Auth Screen** — Login / Register with JWT
3. **Home Screen** — Symptom search, category grid, nearby hospitals
4. **Doctor List Screen** — Filter by specialization, sort by distance/rating
5. **Doctor Profile** — Full profile with hospital schedule tabs
6. **Hospital Profile** — Facilities, doctors, emergency status
7. **Hospitals Screen** — All hospitals, emergency filter
8. **Profile Screen** — Bookmarks, settings, logout

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#F8FAFC` |
| Primary | `#4F7DF3` |
| Accent (Green) | `#2BB673` |
| Text | `#1A202C` |
| Text Secondary | `#64748B` |

---

## 🔐 Authentication Flow

1. User registers/logs in → JWT token stored in AsyncStorage
2. All protected routes validated via `Authorization: Bearer <token>` header
3. Auth context provides user state across all screens
4. Bookmarks stored per user in DB

---

## 📌 Known Notes

- Replace `API_BASE_URL` in `constants.js` with your machine's local IP for physical device testing
- Location permission required for distance-based filtering (falls back to default coords)
- "Book Appointment" and "Call Hospital" buttons are UI stubs — ready to integrate with booking API
