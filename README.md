# Blog App (Fullstack)

A simple fullstack blog application with basic features:

* Create, edit, and delete posts
* Add and delete comments for each post
* Display number of comments per post
* Store data using a JSON file (no database required)

---

## Technologies Used

### Frontend

* Next.js (App Router)
* React
* Tailwind CSS
* React Query
* Axios
* React Hot Toast

### Backend

* Node.js
* Express

---

## 📁 Project Structure

```
project/
│
├── backend/
│   ├── server.js
│   └── data.json
│
├── frontend/
│   ├── app/
│   │   ├── posts/
│   │   │   └── page.tsx
│   │   └── components/
│   │       └── Comments.tsx
│   └── ...
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```
git clone https://github.com/dylangk2005/N23DCCN153_PhamDinhHai_Web_Prac3.git
cd project
```

---

### 2. Install Backend dependencies

```
cd backend
npm install
```

---

### 3. Install Frontend dependencies

```
cd ../frontend
npm install
```

---

##  Running the Application

### 🔹 Start Backend

```
cd backend
node server.js
```

Backend runs at:

```
http://localhost:5000/api/posts
```

---

### 🔹 Start Frontend

Open a new terminal:

```
cd frontend
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

## Features

###  Posts

* Create new posts
* Edit existing posts
* Delete posts

### Comments

* View comments of a post
* Add new comments
* Delete comments
* Display comment count per post

---

## Data Storage

All data is stored in:

```
backend/data.json
```

👉 No database setup required.

---

## Notes

* Start the **backend before frontend**
* If API fails, check:

  * Port configuration
  * CORS settings
* If comments do not appear:

  * Ensure `comments` field exists in `data.json`
  * Restart the backend server

---

## Quick Demo

1. Open: http://localhost:3000
2. Create a post
3. Click **💬 View comments**
4. Add or delete comments
5. Refresh → data persists

---


