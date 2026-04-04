<div align="center">
  <img src="frontend/public/logo.png" alt="ProjectHub Logo" width="120" />
  <h1>ProjectHub</h1>
  <p><strong>A Premium Project Submission & Peer-Review Portal</strong></p>
</div>

---

## 🌟 Overview
ProjectHub is an ultra-minimalistic, high-performance web platform built to handle institutional project submittals and peer-reviews. Driven by MERN stack architecture, it streamlines abstract submission, assignment grading, and project tracking with a seamless, luxury UI.

## 🚀 Key Features
- **Ultra-Minimalist Aesthetic:** Precision-engineered React frontend featuring stark contrasts, smooth micro-interactions, and Native Light/Dark mode.
- **Enterprise Authentication:** Dual-strategy JWT authentication alongside deep OAuth integrations (Deployable Google & GitHub).
- **Multi-Tenant Roles:** Securely isolated capabilities for Students (Submission), Reviewers (Evaluation), and System Administrators.
- **Dynamic Aggregation:** Real-time health calculation of project viability via Mongoose aggregation pipelines.

## 🛠 Tech Stack
- **Frontend**: React.js, Vite, Framer Motion
- **Backend**: Node.js, Express.js, Passport.js
- **Database**: MongoDB (Cloud Atlas)

## ⚡ Quick Start

### 1. Environment Setup
Create a `.env` file in the `backend/` directory and populate your credentials:
```env
PORT=5001
MONGO_URI=mongodb+srv://<admin>:<pass>@your-cluster...
JWT_SECRET=super_secret_key
```

### 2. Running Locally
Open two separate terminal windows to boot the system.

**Launch Backend:**
```bash
cd backend
npm install
npm run dev
```

**Launch Frontend:**
```bash
cd frontend
npm install
npm run dev
```
