# 🔧 Port 5000 EADDRINUSE — Permanent Fix

## The Problem

```
Error: listen EADDRINUSE: address already in use :::5000
```

This happens when:
- You run `npm run dev` in the backend more than once
- The old terminal's Node process is still alive on port 5000
- A previous nodemon crash left a zombie process holding the port

---

## ✅ Permanent Fix (Already Applied)

The `backend/package.json` now has a **`predev`** script.  
npm automatically runs `predev` **before** every `npm run dev`.

```json
"scripts": {
  "predev": "powershell -Command \"Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000 2>$null).OwningProcess -Force 2>$null; exit 0\"",
  "dev": "nodemon src/index.js"
}
```

This silently kills whatever is on port 5000 before nodemon starts.  
**You never need to do anything manually again.** Just `npm run dev` and it works.

---

## 🆘 Manual Fix (if needed for emergency)

Open any PowerShell terminal and run:

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000 2>$null).OwningProcess -Force 2>$null
```

Then run `npm run dev` normally.

---

## Starting the Full App

Always start in **two separate terminal windows**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
> Wait for: `✅ MongoDB Atlas Connected` and `🚀 Server running on port 5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
> App opens at: `http://localhost:5173` (or 5175 if other apps are on 5173)

---

## Hackathon Judge Mode

Once the app is open:
1. Click **🏆 Judge Mode** button (bottom-right corner)
2. Welcome modal appears with problem/solution/tech/impact
3. Click **🌱 Load Demo Data** to seed realistic Indian logistics data
4. Click **🚨 Simulate Fraud** to trigger live anomaly detection on the map
5. Click **🗺️ Guided Tour** for the full 8-step walkthrough

---

## MongoDB Atlas

Connection string is in `backend/.env` — do not share publicly.
The app uses **MongoDB Atlas free tier** (cloud-hosted, no local installation needed).
