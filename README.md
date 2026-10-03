# 🌐 GeoHub - Club Management & Smart QR Attendance Platform

**GeoHub** is a comprehensive, production-grade club orchestration platform built for student organizations, club leads, volunteers, and faculty in-charges.

---

## 🏛️ System Overview & Role Hierarchy

| Role | Designation | Permissions & Access |
|---|---|---|
| **`super_admin`** | Club Faculty In-charge | Full platform oversight, final approvals, manage administrators, execute role overrides. |
| **`admin`** | President / VP | Assign team admins, orchestrate events, manage gallery, monitor all teams & analytics. |
| **`team_admin`** | Department Lead | Add students to their team, assign team roles, allocate & approve department tasks. |
| **`member`** | Active Student | Browse events, join a team, track assigned tasks, submit proofs, generate dynamic QR. |
| **`volunteer`** | Event Volunteer | All member capabilities + high-speed dynamic camera QR scanning at assigned events. |

---

## 📂 Architecture & Directory Layout

The application follows a **feature-first, clean architectural design**:

```
GEO HUB/
├── android/                   # Native Android configuration (package: com.club.geohub)
│   ├── app/
│   │   ├── build.gradle       # MinSdk 21, compileSdk 34, Google services plugin
│   │   ├── google-services.json
│   │   └── src/main/AndroidManifest.xml # Camera, FCM & media permissions
│   ├── build.gradle
│   └── settings.gradle
├── lib/
│   ├── core/
│   │   ├── constants/         # App constants, roles, collections, cloud functions
│   │   ├── models/            # UserModel with claims & privilege helper getters
│   │   ├── providers/         # Riverpod auth, firestore, storage, claims providers
│   │   ├── router/            # GoRouter with role-based routing & redirects
│   │   └── theme/             # Material 3 light & dark theme design system
│   ├── features/
│   │   ├── auth/              # College domain verification, login, signup, pending approval
│   │   ├── teams/             # Teams list, team details, join requests & approvals
│   │   ├── events/            # Events list, filter bars, detail view, creation form
│   │   ├── tasks/             # Role-scoped task lists, proof submission & validation
│   │   ├── qr_attendance/     # Dynamic 60s TTL QR display, 25s auto-refresh, camera scanner
│   │   ├── gallery/           # Media & document uploads categorized by year & event
│   │   ├── dashboard/         # fl_chart analytics, KPI metrics, task distribution
│   │   └── notifications/     # FCM service, topic subscriptions, in-app notification center
│   ├── widgets/               # Reusable UI components, role badges, status chips
│   ├── firebase_options.dart  # Firebase platform configuration
│   └── main.dart              # Entrypoint with ProviderScope & notification initialization
├── functions/                 # Node.js 20 Cloud Functions
│   ├── index.js               # Callable auth claims, dynamic QR token, attendance check-in
│   └── package.json           # Firebase Admin & Functions dependencies
├── firestore.rules            # Strict role-based Firestore security rules
├── storage.rules              # Storage bucket permissions by team and academic year
├── firestore.indexes.json     # Compound query indexes
└── firebase.json              # Firebase CLI & emulator configuration
```

---

## ⚡ Quickstart: Running in Android Studio

### 1. Prerequisites
- **Android Studio** installed (with Android SDK 34).
- **Flutter SDK**: Ensure Flutter is extracted at `C:\src\flutter` (already configured in your Windows PATH).
- **Git** and **Node.js** (v20+).

### 2. Open in Android Studio
1. Launch **Android Studio**.
2. Click **Open** and select `E:\GEO HUB`.
3. Open the terminal inside Android Studio and fetch packages:
   ```bash
   flutter pub get
   ```

### 3. Connect Firebase
1. In the [Firebase Console](https://console.firebase.google.com/):
   - Register an Android app with package name: **`com.club.geohub`**.
   - Download your official `google-services.json` and replace `android/app/google-services.json`.
   - Enable **Authentication** (Email/Password).
   - Enable **Cloud Firestore** and **Cloud Storage**.
   - Enable **Cloud Messaging** (FCM).
2. Generate or update `firebase_options.dart` using FlutterFire:
   ```bash
   dart pub global activate flutterfire_cli
   flutterfire configure
   ```

### 4. Deploy Backend Cloud Functions & Rules
From the project root:
```bash
# Deploy Firestore & Storage Security Rules
firebase deploy --only firestore:rules,storage

# Deploy Cloud Functions
firebase deploy --only functions
```

### 5. Run the Application
1. Start an Android Emulator or connect an Android device with USB debugging.
2. Press **Run (Shift + F10)** or execute:
   ```bash
   flutter run
   ```

---

## 🔒 Security & Custom Claims Matrix

All sensitive operations (role elevation, attendance verification, team assignment) run through **Node.js Cloud Functions**, ensuring that client devices cannot directly manipulate roles or forge attendance:

- **`assignTeamAdmin`**: Verifies caller is admin/super_admin, updates Auth Custom Claims (`role: 'team_admin'`), and adds the user to the team.
- **`approveJoinRequest`**: Team lead confirms candidate and assigns a departmental role.
- **`generateEventQr`**: Emits a single-use crypto token with a **60-second time-to-live (TTL)**.
- **`markAttendanceFromQr`**: Verifies volunteer scanner assignment, ensures token is fresh and unused, records attendance and increments event counters atomically.

---

## 🐍 FastAPI Backend Option (100% Free, Zero Billing)

If you prefer Python / FastAPI without needing any Firebase credit cards:

1. **Start the FastAPI Server**:
   ```powershell
   cd backend
   python run.py
   ```
2. **Access Interactive Swagger Documentation**:
   * Open: **`http://127.0.0.1:8000/docs`**
   * Here you can test all endpoints directly in your browser:
     * User registration with `@college.edu` validation
     * Login & JWT token issuance
     * Dynamic QR generation with 60s TTL
     * Scanner verification and real-time attendance recording
     * Task assignment and local file uploads (`/uploads/`)

