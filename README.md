# EasyLearn Frontend

Διαδικτυακή πλατφόρμα εκπαιδευτικών μαθημάτων με δύο ρόλους χρηστών: **Students** και **Teachers**.

## � Προαπαιτούμενα

- **Node.js** (v14 ή νεότερο)
- **npm** (συνήθως εγκαθίσταται με το Node.js)
- **Backend API** να τρέχει (συνήθως στο `http://localhost:5000`)

## 🚀 Εγκατάσταση & Εκτέλεση

```bash
# 1. Clone το repository
git clone <repository-url>
cd DB-Easy-Learn-Frontend

# 2. Δημιουργία .env αρχείου
cp .env.example .env
# Επεξεργασία του .env για να ορίσεις το backend URL αν χρειάζεται

# 3. Εγκατάσταση dependencies
npm install

# 4. Εκτέλεση development server
npm start
```

Η εφαρμογή θα ανοίξει αυτόματα στο `http://localhost:3000`

## ⚙️ Configuration

Δημιούργησε αρχείο `.env` στη root του project (αντιγράφοντας το `.env.example`):

```env
REACT_APP_API_BASE=http://localhost:5000
```

**Σημείωση:** Το backend API πρέπει να τρέχει στη διεύθυνση που ορίζεται στο `REACT_APP_API_BASE`.

## 📋 Λειτουργίες

### Student
- 🔍 Αναζήτηση και φιλτράρισμα μαθημάτων (category, difficulty, premium)
- 📚 Εγγραφή σε μαθήματα (enroll/withdraw)
- 📖 Προβολή lessons με video και υλικό
- 📝 Συμμετοχή σε quizzes
- ⭐ Αξιολόγηση μαθημάτων (ratings & reviews)
- 📊 Παρακολούθηση προόδου και scores

### Teacher
- ➕ Δημιουργία μαθημάτων (courses)
- 📁 Δημιουργία κατηγοριών (categories)
- 📖 Διαχείριση lessons (video, attachments, summary sheets)
- 📝 Δημιουργία quizzes με ερωτήσεις
- ✏️ Edit/Delete courses, lessons, quizzes

## 🛠️ Τεχνολογίες

- **React 18** - UI Framework
- **React Router** - Navigation
- **Axios** - HTTP Client
- **JWT Authentication** - Ασφάλεια

## 📂 Δομή Project

```
src/
├── api/           # API calls
├── components/    # Reusable components
├── context/       # React Context (Auth)
├── pages/         # Page components
├── router/        # Routes configuration
└── utils/         # Helper functions
```

## 🔐 Authentication

Η εφαρμογή χρησιμοποιεί JWT tokens που στέλνονται αυτόματα σε κάθε protected endpoint μέσω axios interceptor.

**Login:** `POST /users/login` με email  
**Token:** Αποθηκεύεται στο localStorage και προστίθεται αυτόματα στα headers

## 🌐 API

Backend API Base URL: `http://localhost:5000` (configurable via `REACT_APP_API_BASE`)

---

Developed by Kontogeorgou, Miliousi, Segkani

