# EasyLearn Frontend

**Group 22 - Software Engineering Lab 2**

React-based frontend για την εκπαιδευτική πλατφόρμα EasyLearn. Υλοποιημένο με Create React App και συνδέεται με το backend API.

---

## 📋 Απαιτήσεις Εργασίας

### ✅ Οθόνες (Screens)
**Απαίτηση:** Τουλάχιστον 4 οθόνες  
**Υλοποίηση:** 6 οθόνες

1. **Home (Αναζήτηση)** - Αναζήτηση και φιλτράρισμα μαθημάτων
2. **Course Details** - Προβολή λεπτομερειών μαθήματος και εγγραφή
3. **My Courses** - Dashboard με τα εγγεγραμμένα μαθήματα του χρήστη
4. **Course Progress** - Προβολή προόδου και περιεχομένου μαθήματος
5. **Course Reviews** - Προβολή και υποβολή αξιολογήσεων
6. **Profile** - Προφίλ χρήστη και premium upgrade

### ✅ API Endpoints
**Απαίτηση:** Τουλάχιστον 5 endpoints  
**Υλοποίηση:** 10 endpoints

#### Course Endpoints (4):
- `GET /courses` - Λήψη όλων των μαθημάτων
- `GET /courses/{courseId}` - Λεπτομέρειες μαθήματος
- `GET /courses/{courseId}/reviews` - Αξιολογήσεις μαθήματος
- `POST /courses/{courseId}/reviews` - Υποβολή αξιολόγησης

#### User Endpoints (6):
- `GET /users/{userId}` - Προφίλ χρήστη
- `PUT /users/{userId}` - Ενημέρωση χρήστη
- `GET /users/{userId}/courses` - Εγγεγραμμένα μαθήματα
- `POST /users/{userId}/courses` - Εγγραφή σε μάθημα
- `DELETE /users/{userId}/courses/{courseId}` - Αποχώρηση από μάθημα
- `GET /users/{userId}/courses/{courseId}/progress` - Πρόοδος μαθήματος

---

## 🚀 Features

✅ **Αναζήτηση & Φίλτρα**: Αναζήτηση με keyword και φιλτράρισμα ανά category, difficulty, premium  
✅ **Εγγραφή σε Μαθήματα**: Enroll/Withdraw functionality με confirmation  
✅ **Παρακολούθηση Προόδου**: Progress tracking για κάθε εγγεγραμμένο μάθημα  
✅ **Αξιολογήσεις**: Rating system με stars και σχόλια  
✅ **Premium Features**: Upgrade to premium functionality  
✅ **Responsive Design**: Mobile-friendly layout με CSS Grid  
✅ **Mock Authentication**: Simulated user authentication χωρίς login page  

## 🔧 Quick Start

### Προαπαιτούμενα
- Node.js (v14 ή νεότερη)
- npm ή yarn
- Backend API running (default: http://localhost:5000)

### 1. Εγκατάσταση Dependencies

```powershell
npm install
```

### 2. Ρύθμιση Environment

Δημιουργήστε το `.env` file:

```powershell
Copy-Item .env.example .env
```

Περιεχόμενα `.env`:

```env
REACT_APP_API_BASE=http://localhost:5000
REACT_APP_DEFAULT_USER_ID=1
```

**Σημείωση:** Αφού δεν έχουμε υλοποιήσει login page, το `REACT_APP_DEFAULT_USER_ID` ορίζει τον "logged in" χρήστη. Αλλάξτε το για να δοκιμάσετε με διαφορετικούς users.

### 3. Εκκίνηση Development Server

```powershell
npm start
```

Η εφαρμογή θα ανοίξει στο `http://localhost:3000`.

### 4. Build για Production

```powershell
npm run build
```

Δημιουργεί optimized production build στον φάκελο `build/`.

## 📁 Project Structure

```
Group22_EasyLearn_Frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── api/                    # API Layer
│   │   ├── client.js           # Axios instance με base configuration
│   │   ├── courses.js          # Course-related API calls
│   │   └── users.js            # User-related API calls
│   │
│   ├── components/             # Reusable UI Components
│   │   ├── Header.jsx          # Navigation header με search
│   │   ├── Footer.jsx          # Footer component
│   │   ├── CourseCard.jsx      # Card για εμφάνιση μαθήματος
│   │   ├── FiltersPanel.jsx    # Sidebar με filters
│   │   └── HomeBanner.jsx      # Banner για home page
│   │
│   ├── pages/                  # Page Components (Screens)
│   │   ├── Home.jsx            # Αναζήτηση μαθημάτων
│   │   ├── CourseDetails.jsx   # Λεπτομέρειες μαθήματος
│   │   ├── MyCourses.jsx       # Dashboard εγγεγραμμένων μαθημάτων
│   │   ├── MyCourses.css       # Styles για MyCourses
│   │   ├── CourseProgress.jsx  # Πρόοδος & περιεχόμενο μαθήματος
│   │   ├── CourseReviews.jsx   # Αξιολογήσεις μαθήματος
│   │   └── Profile.jsx         # Προφίλ χρήστη
│   │
│   ├── context/                # React Context
│   │   └── AuthContext.jsx     # Authentication context (mock user)
│   │
│   ├── router/                 # Routing
│   │   └── AppRouter.jsx       # Route definitions
│   │
│   ├── utils/                  # Utilities
│   │   ├── constants.js        # Constants (categories, difficulty levels)
│   │   ├── validators.js       # Validation functions
│   │   └── formatters.js       # Formatting utilities
│   │
│   ├── App.js                  # Root component
│   ├── index.js                # Entry point
│   └── index.css               # Global styles
│
├── Context data/               # Documentation
│   ├── swagger.json            # API documentation
│   ├── activity_diagrams/      # Activity diagrams
│   └── user_stories/           # Gherkin user stories
│
├── .env                        # Environment variables (git-ignored)
├── .env.example                # Environment template
├── package.json                # Dependencies & scripts
└── README.md                   # This file
```

## 🎨 User Interface & Navigation

### Screens Overview

#### 1️⃣ Home (Αναζήτηση Μαθημάτων)
- **Route:** `/` ή `/courses`
- **Features:**
  - Search bar με real-time αναζήτηση
  - Sidebar με filters (Category, Difficulty, Premium)
  - Grid εμφάνιση μαθημάτων
  - Client-side filtering για performance
- **API Calls:** `GET /courses`

#### 2️⃣ Course Details (Λεπτομέρειες Μαθήματος)
- **Route:** `/courses/:id`
- **Features:**
  - Πλήρης περιγραφή μαθήματος
  - Course image, category, difficulty, premium status
  - Average rating από reviews
  - Enroll button (αν δεν είσαι εγγεγραμμένος)
  - Auto-redirect αν είσαι ήδη enrolled
- **API Calls:** 
  - `GET /courses/{courseId}`
  - `GET /courses/{courseId}/reviews`
  - `GET /users/{userId}/courses`
  - `POST /users/{userId}/courses` (on enroll)

#### 3️⃣ My Courses (Τα Μαθήματά Μου)
- **Route:** `/users/:userId/courses`
- **Features:**
  - Dashboard με enrolled courses
  - Progress percentage για κάθε μάθημα
  - Premium card & Points card
  - Withdraw functionality
  - "We recommend" section
- **API Calls:**
  - `GET /users/{userId}`
  - `GET /users/{userId}/courses`
  - `GET /users/{userId}/courses/{courseId}/progress`
  - `DELETE /users/{userId}/courses/{courseId}` (on withdraw)

#### 4️⃣ Course Progress (Πρόοδος Μαθήματος)
- **Route:** `/users/:userId/courses/:courseId`
- **Features:**
  - Πλήρες course content με chapters
  - Progress tracking
  - Rating submission
  - Withdraw option
- **API Calls:**
  - `GET /courses/{courseId}`
  - `GET /users/{userId}/courses/{courseId}/progress`
  - `POST /courses/{courseId}/reviews` (on rating)

#### 5️⃣ Course Reviews (Αξιολογήσεις)
- **Route:** `/courses/:courseId/reviews`
- **Features:**
  - Λίστα όλων των reviews
  - Star ratings & comments
  - Average rating calculation
- **API Calls:** `GET /courses/{courseId}/reviews`

#### 6️⃣ Profile (Προφίλ Χρήστη)
- **Route:** `/users/:userId`
- **Features:**
  - User information
  - Premium status
  - Upgrade to premium button
  - Link to My Courses
- **API Calls:**
  - `GET /users/{userId}`
  - `PUT /users/{userId}` (on premium upgrade)

---

## 🔐 Authentication & User Management

Αφού δεν υπάρχει login page, η εφαρμογή χρησιμοποιεί **mock authentication**:

- Ο default user φορτώνεται αυτόματα από το `AuthContext` κατά την εκκίνηση
- Το `REACT_APP_DEFAULT_USER_ID` στο `.env` ορίζει ποιος user είναι "logged in"
- Για να αλλάξετε user: αλλάξτε το `REACT_APP_DEFAULT_USER_ID` και κάντε restart

**Παράδειγμα:**
```env
REACT_APP_DEFAULT_USER_ID=1   # User με ID 1
REACT_APP_DEFAULT_USER_ID=2   # User με ID 2
```

---

## 🛠️ Technologies Used

- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client για API calls
- **CSS Grid & Flexbox** - Responsive layout
- **React Context API** - State management

---

## 📝 Σημειώσεις Υλοποίησης

### Client-Side Filtering
Το search & filtering γίνεται client-side για καλύτερη performance:
- Τα courses φορτώνονται μία φορά από το backend
- Το filtering (keyword, category, difficulty, premium) γίνεται στο frontend
- Instant results χωρίς extra API calls

### Error Handling
- Try-catch blocks σε όλα τα API calls
- Fallback values για empty responses
- User-friendly error messages

### Responsive Design
- Mobile-first approach
- CSS Grid με media queries
- Flexible layouts που προσαρμόζονται σε όλες τις οθόνες

---

## 👥 Team - Group 22

Εργασία για το μάθημα Software Engineering Lab 2  
Ημερομηνία: Νοέμβριος 2025

