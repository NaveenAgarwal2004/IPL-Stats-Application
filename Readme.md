# 🏏 IPL Live Stats & Fantasy Team Builder

A modern, responsive full-stack web application for **IPL cricket statistics** and **fantasy team building**.  
Built with **React.js**, **Tailwind CSS**, and a Node.js/Express backend.

---

## 📌 Features

### 🔹 Core Features
- **Live IPL Matches** – View ongoing match details in real-time.
- **Player Stats** – Search, filter, and explore player statistics.
- **Fantasy Team Builder** – Add/remove players, validate team composition, and save/load teams.
- **Analytics Dashboard** – Visual insights from player and match data.

### 🔹 UI/UX Enhancements
- **Dark Mode** – Persistent theme toggle via local storage.
- **Keyboard Shortcuts** – Quick navigation and actions.
- **Loading Spinner** – Friendly feedback during data fetch.
- **Drag & Drop** – Move players into your fantasy team interactively.
- **Responsive Design** – Optimized for desktop, tablet, and mobile.

---

## 🛠️ Tech Stack

**Frontend**
- React.js (Vite)
- Tailwind CSS
- Custom Hooks (`useLocalStorage`, `usePlayersData`, `useDragDrop`)

**Backend**
- Node.js + Express
- Static JSON data (200+ IPL players)
- REST API routes for matches, players, analytics, and weather

---

## 📂 Folder Structure

```
ipl-stats-app/
│── backend/
│   ├── server.js
│   ├── data/ (JSON files)
│   ├── public/ (frontend build)
│
│── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
```

---

## 🚀 Getting Started

### 1️⃣ Clone Repository
```bash
git clone https://github.com/yourusername/ipl-stats-app.git
cd ipl-stats-app
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Add your environment variables
npm run dev
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4️⃣ Access App
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`


---

## 📜 License
MIT License – Feel free to modify and distribute.
