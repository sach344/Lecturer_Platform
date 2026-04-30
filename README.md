# 🎓 StudyPlatform — by Sachin Sharma

A full-stack study management platform for HPCL IS Officer & NIC Scientist-B exam prep.

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT + Email OTP (Nodemailer) |
| Editor | Quill.js (rich text) |
| Storage | Local disk (Multer) |

## 📁 Project Structure

```
studyplatform/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js  # Register, Login, OTP
│   │   │   └── contentController.js # CRUD for all content
│   │   ├── middlewares/auth.js    # JWT middleware
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Content.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── contentRoutes.js
│   │   └── server.js
│   ├── uploads/                   # Uploaded files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.js          # Axios with JWT interceptor
│   │   ├── components/
│   │   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   │   ├── ContentCard.jsx    # Card with expand/bookmark/delete
│   │   │   ├── CreateModal.jsx    # Content creation form
│   │   │   └── RichEditor.jsx     # Quill.js wrapper
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx      # Sign in / Register / OTP
│   │   │   ├── DashboardPage.jsx  # Home with stats + modules
│   │   │   └── ModulePage.jsx     # Per-module with folders/categories
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   └── package.json
└── package.json
```

## ⚡ Quick Start (Local)

### 1. Clone and install

```bash
git clone https://github.com/your-username/studyplatform.git
cd studyplatform
npm install
npm run install:all
```

### 2. Configure backend

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
MONGODB_URI=mongodb://127.0.0.1:27017/studyplatform
JWT_SECRET=change_this_to_a_long_random_string
PORT=5000
FRONTEND_URL=http://localhost:5173

# Optional: Email OTP via Gmail
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> **Gmail App Password**: Go to [Google Account → Security → App Passwords](https://myaccount.google.com/apppasswords)

### 3. Run MongoDB locally

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Ubuntu/WSL
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud) - recommended for production
```

### 4. Start development

```bash
# Both backend + frontend simultaneously
npm run dev

# Or separately:
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:5173
```

### 5. OTP in Development

Without Gmail config, the OTP is returned directly in the API response:
```json
{ "otpForDemo": "123456" }
```
You'll see it in the browser on registration.

---

## 🌐 Deployment

### Backend → Render.com

1. Push to GitHub
2. New Web Service → Connect repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables from `.env`

### Frontend → Vercel

1. New Project → Import repo
2. Root directory: `frontend`
3. Add env var: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy

### Database → MongoDB Atlas

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Whitelist `0.0.0.0/0` in Network Access
3. Copy connection string to `MONGODB_URI`

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/auth/register` | `{name, email?, phone?, password}` |
| POST | `/api/auth/verify-otp` | `{userId, otpCode}` |
| POST | `/api/auth/login` | `{emailOrPhone, password}` |
| POST | `/api/auth/resend-otp` | `{userId}` |
| GET | `/api/auth/me` | *(JWT required)* |

### Content (all require JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content?module=DSA&type=note&q=search` | List/search |
| GET | `/api/content/groups?module=DSA&groupBy=folder` | Get folder/category list |
| POST | `/api/content` | Create (multipart/form-data) |
| PUT | `/api/content/:id` | Update |
| DELETE | `/api/content/:id` | Delete |
| PATCH | `/api/content/:id/bookmark` | Toggle bookmark |

---

## 📚 Modules

| Module | Group By | Types |
|--------|----------|-------|
| GK | Category (Awards, Sports…) | Notes, Questions, Files |
| DSA | Folder (Arrays, Trees…) | Questions, Notes |
| Hindi | Category | Notes, Questions |
| Paper 1 | Section (COA, OS…) | Notes, Files |
| Paper 2 | Section | Notes, Files |
| System Design | Category | Notes, Files |

---

## 🔮 Future: Claude AI Integration

Planned Claude API features:
- Smart notes summarization
- Question generation from notes
- DSA solution hints
- Concept explanation chatbot

```js
// Example future integration
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, ... },
  body: JSON.stringify({ model: "claude-opus-4-6", messages: [...] })
});
```

---

## 🛡️ Security

- Passwords hashed with bcrypt (12 rounds)
- JWT with 7-day expiry
- File upload validation (PDF/images only, 20MB max)
- Input sanitization on all routes
- Protected routes with JWT middleware

---

Made with 💜 for serious exam prep — HPCL IS Officer & NIC Scientist-B 2026
