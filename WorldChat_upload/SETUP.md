# 🛠️ WorldChat — Complete Setup Guide (Step by Step)

This guide assumes **zero prior setup**. Follow it top to bottom. Every step tells you
**exactly what to click, what to copy, and where to paste it.**

There are 3 big parts:

1. **Create free accounts & collect secret keys** (MongoDB, Cloudinary, Firebase)
2. **Configure & run the app on your computer**
3. **Upload the project to GitHub by drag-and-drop** (no git command line needed)

> 💡 Tip: keep a blank text file (Notepad) open while you work. Every time the guide
> says "copy this value", paste it into Notepad with a label. You'll need them all in Step 2.

---

## ✅ Part 0 — Prerequisites (5 min)

### 0.1 Check Node.js is installed
Open **PowerShell** (press `Win`, type *PowerShell*, hit Enter) and run:

```powershell
node --version
npm --version
```

You should see something like `v24.x` and `11.x`. (Your machine already has this.)
If not, install the **LTS** version from <https://nodejs.org> and reopen PowerShell.

### 0.2 Know your project folder
Everything lives in:

```
C:\Users\abhitk\Desktop\World_Chat
```

Inside it you have two apps: **`backend`** and **`frontend`**.

---

## ✅ Part 1 — Create accounts & get your keys

You need **three** free services. Do them in this order.

---

### 🍃 1A. MongoDB Atlas (the database) — ~10 min

This is where all messages, users, and call logs are stored.

1. Go to <https://www.mongodb.com/cloud/atlas/register> and **sign up** (free).
2. When asked, create a **free M0 cluster** (pick any cloud/region close to you).
   Wait ~3 minutes for it to finish provisioning.
3. In the left menu open **Database Access** → **Add New Database User**:
   - Authentication method: **Password**
   - Username: e.g. `worldchat`
   - Password: click **Autogenerate** and **copy it** → paste into Notepad as `DB_PASSWORD`.
   - Built-in role: **Read and write to any database**.
   - Click **Add User**.
4. In the left menu open **Network Access** → **Add IP Address**:
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) → **Confirm**.
     *(Fine for development. For production, restrict it later.)*
5. In the left menu open **Database** → click **Connect** on your cluster →
   **Drivers** → driver **Node.js**. Copy the connection string. It looks like:

   ```
   mongodb+srv://worldchat:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. Edit that string:
   - Replace `<password>` with the **DB_PASSWORD** you saved.
   - Add a database name `worldchat` right before the `?`, like this:

   ```
   mongodb+srv://worldchat:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/worldchat?retryWrites=true&w=majority
   ```

   👉 Save this final string in Notepad as **`MONGODB_URI`**.

---

### 🖼️ 1B. Cloudinary (image storage) — ~3 min

This stores the temporary images that expire after 5 minutes.

1. Go to <https://cloudinary.com/users/register_free> and **sign up** (free).
2. After login you land on the **Dashboard** (or go to **Settings → API Keys**).
3. Copy these three values into Notepad:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** (click "reveal") → `CLOUDINARY_API_SECRET`

---

### 🔥 1C. Firebase (Google Sign-In) — ~10 min

This powers the "Continue with Google" login for registered users.
You need **two** sets of values from Firebase: a **Web config** (frontend) and a
**Service Account** (backend).

#### Create the project
1. Go to <https://console.firebase.google.com> → **Add project**.
2. Name it `worldchat` (or anything) → continue. You can **disable Google Analytics**. → **Create project**.

#### Enable Google sign-in
3. In the left menu: **Build → Authentication → Get started**.
4. Open the **Sign-in method** tab → click **Google** → toggle **Enable** →
   pick a support email → **Save**.

#### Get the WEB config (for the frontend)
5. Click the **gear icon ⚙️ (top-left) → Project settings**.
6. Scroll to **Your apps** → click the **`</>` (Web)** icon to register a web app.
   - App nickname: `worldchat-web` → **Register app** (you can skip hosting).
7. Firebase shows a `firebaseConfig` object. Copy each value into Notepad:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",                 // → VITE_FIREBASE_API_KEY
     authDomain: "worldchat.firebaseapp.com",   // → VITE_FIREBASE_AUTH_DOMAIN
     projectId: "worldchat-xxxx",       // → VITE_FIREBASE_PROJECT_ID
     storageBucket: "worldchat.appspot.com",    // → VITE_FIREBASE_STORAGE_BUCKET
     messagingSenderId: "000000000000", // → VITE_FIREBASE_MESSAGING_SENDER_ID
     appId: "1:000...:web:abc..."       // → VITE_FIREBASE_APP_ID
   };
   ```

#### Get the SERVICE ACCOUNT (for the backend)
8. Still in **Project settings** → open the **Service accounts** tab.
9. Click **Generate new private key** → **Generate key**. A `.json` file downloads.
10. Open that JSON file in Notepad. You need three fields:
    - `"project_id"` → `FIREBASE_PROJECT_ID`
    - `"client_email"` → `FIREBASE_CLIENT_EMAIL`
    - `"private_key"` → `FIREBASE_PRIVATE_KEY`
      ⚠️ The private key is long and contains `\n` characters. **Copy the whole value
      including the quotes**, e.g. `"-----BEGIN PRIVATE KEY-----\n....\n-----END PRIVATE KEY-----\n"`.

> 🔒 **Never share this JSON file or commit it to GitHub.** You only copy 3 values from it.

---

## ✅ Part 2 — Configure & run the app locally

### 2A. Create the backend `.env` file

1. In File Explorer go to `C:\Users\abhitk\Desktop\World_Chat\backend`.
2. You'll see a file named **`.env.example`**. **Copy it** and rename the copy to **`.env`**
   (just `.env`, no `.example`).
   - PowerShell shortcut:
     ```powershell
     cd C:\Users\abhitk\Desktop\World_Chat\backend
     copy .env.example .env
     ```
3. Open `.env` in a text editor and fill in the values you saved in Notepad:

   ```env
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:5173

   MONGODB_URI=  (paste your MONGODB_URI here)

   JWT_SECRET=  (type any long random string, e.g. mash your keyboard 40+ chars)
   JWT_EXPIRES_IN=7d
   GUEST_JWT_EXPIRES_IN=1d

   FIREBASE_PROJECT_ID=  (from service account JSON)
   FIREBASE_CLIENT_EMAIL=  (from service account JSON)
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

   CLOUDINARY_CLOUD_NAME=  (from Cloudinary)
   CLOUDINARY_API_KEY=  (from Cloudinary)
   CLOUDINARY_API_SECRET=  (from Cloudinary)
   CLOUDINARY_FOLDER=worldchat

   IMAGE_EXPIRY_MINUTES=5
   ```

   - For `JWT_SECRET`, any long random text works. Quick generator in PowerShell:
     ```powershell
     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
     ```
     Copy its output as your `JWT_SECRET`.
   - Keep the **quotes** around `FIREBASE_PRIVATE_KEY`.

### 2B. Create the frontend `.env` file

1. Go to `C:\Users\abhitk\Desktop\World_Chat\frontend`.
2. Copy `.env.example` → `.env`:
   ```powershell
   cd C:\Users\abhitk\Desktop\World_Chat\frontend
   copy .env.example .env
   ```
3. Open `.env` and fill in the **Web config** values from Firebase:

   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000

   VITE_FIREBASE_API_KEY=  (apiKey)
   VITE_FIREBASE_AUTH_DOMAIN=  (authDomain)
   VITE_FIREBASE_PROJECT_ID=  (projectId)
   VITE_FIREBASE_STORAGE_BUCKET=  (storageBucket)
   VITE_FIREBASE_MESSAGING_SENDER_ID=  (messagingSenderId)
   VITE_FIREBASE_APP_ID=  (appId)
   ```

### 2C. Install dependencies (only needed once)

> If you already ran these earlier, you can skip — but re-running is harmless.

```powershell
cd C:\Users\abhitk\Desktop\World_Chat\backend
npm install

cd C:\Users\abhitk\Desktop\World_Chat\frontend
npm install
```

### 2D. Run the app (two terminals)

Open **two** PowerShell windows.

**Terminal 1 — backend:**
```powershell
cd C:\Users\abhitk\Desktop\World_Chat\backend
npm run dev
```
You should see: `WorldChat API listening on port 5000` and `MongoDB connected`.

**Terminal 2 — frontend:**
```powershell
cd C:\Users\abhitk\Desktop\World_Chat\frontend
npm run dev
```
You should see a local URL: **http://localhost:5173**.

### 2E. Test it
1. Open **http://localhost:5173** in your browser.
2. Type a username → **Join as Guest** → you're in the global chat. 🎉
3. Open a second browser tab (or an incognito window), join with a different name,
   and watch messages appear in real time, plus the online list and typing dots.
4. To test private chat / calls / image upload: click **Continue with Google**
   (needs the Firebase steps done). Then from the online panel click another
   **signed-in** user to DM, and use the 📞 / 🎥 buttons in the chat header.

> ℹ️ Voice/video calls need **two different signed-in Google users** (use two browsers
> or one normal + one incognito) and you must **Allow** camera/microphone when asked.

---

## ✅ Part 3 — Put the project on GitHub (drag-and-drop, no git needed)

Since git isn't installed on this machine, you'll use **GitHub's website upload**.
GitHub's uploader lets you **drag a folder** and keeps the folder structure.

> ⚠️ **Two things you must NOT upload:**
> 1. **`node_modules`** folders — huge (thousands of files), and they're re-created by
>    `npm install`. Uploading them will be extremely slow / may fail.
> 2. **`.env`** files — they contain your secret keys. Never put secrets on GitHub.
>
> The included `.gitignore` files normally handle this, **but the website's drag-and-drop
> uploader ignores `.gitignore`** — so you must remove these yourself before uploading.

### 3A. Make the folder "upload-ready" (remove node_modules)

The cleanest approach: delete the two `node_modules` folders now (you can always get
them back later with `npm install`). Run this in PowerShell:

```powershell
cd C:\Users\abhitk\Desktop\World_Chat
Remove-Item -Recurse -Force backend\node_modules
Remove-Item -Recurse -Force frontend\node_modules
```

Also make sure your `.env` files are **not** going to be dragged. (They're hidden-ish; if
you'd rather be 100% safe, temporarily move `backend\.env` and `frontend\.env` to your
Desktop, upload, then move them back. You do **not** need `.env` on GitHub — only the
`.env.example` templates, which are safe and already included.)

> ✅ After this, your `World_Chat` folder contains only source code + docs — perfect for upload.
> To run the app again later, just re-run `npm install` in `backend` and `frontend`.

### 3B. Create a new repository on GitHub

1. Go to <https://github.com> and **sign in** (create a free account if needed).
2. Click the **`+`** (top-right) → **New repository**.
3. Repository name: `worldchat` (or anything).
4. Choose **Public** or **Private**.
5. **Do NOT** check "Add a README" / .gitignore / license (your folder already has them).
6. Click **Create repository**.

### 3C. Upload your folder

On the new empty repo page:

1. Click the link **"uploading an existing file"**
   (or go to **Add file ▾ → Upload files**).
2. A drop zone appears: *"Drag files here to add them to your repository."*
3. Open File Explorer at `C:\Users\abhitk\Desktop\World_Chat`.
4. **Select everything inside** the folder (`README.md`, `SETUP.md`, `.gitignore`,
   the `backend` folder, the `frontend` folder) and **drag them onto the drop zone.**
   - Tip: select the items, then drag the whole selection at once. GitHub preserves the
     `backend/` and `frontend/` subfolder structure.
   - Wait for the file list to finish populating (the source files are small, so this is quick
     once `node_modules` is removed).
5. At the bottom, in **Commit changes**, type a message like `Initial commit: WorldChat`.
6. Click **Commit changes**.

Done — your code is on GitHub! 🎉 Refresh the repo page and you'll see `backend/`,
`frontend/`, `README.md`, and `SETUP.md`.

> If the uploader complains a file is too large or there are too many files, it almost
> always means a `node_modules` folder slipped in. Re-check Step 3A and try again.

### 3D. (Optional) Install Git later for easier updates
Drag-and-drop is fine for the first upload, but for ongoing changes installing Git is easier:
1. Download from <https://git-scm.com/download/win> and install (accept defaults).
2. Reopen PowerShell, then:
   ```powershell
   cd C:\Users\abhitk\Desktop\World_Chat
   git init
   git add .
   git commit -m "Initial commit: WorldChat"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/worldchat.git
   git push -u origin main
   ```
   (The `.gitignore` files will automatically keep `node_modules` and `.env` out.)

---

## ✅ Part 4 — (Optional) Deploy live to the internet

When you're ready to share a public link, see the **Deployment Guide** section in
`README.md`. Short version:

- **Backend → Render or Railway** (root = `backend`, start = `npm start`, add all backend env vars, set `CLIENT_URL` to your frontend URL).
- **Frontend → Vercel** (root = `frontend`, framework = Vite, add all `VITE_*` env vars pointing at your deployed backend).
- **Database = MongoDB Atlas**, **Storage = Cloudinary** (already set up above).
- In Firebase → **Authentication → Settings → Authorized domains**, add your deployed Vercel domain so Google sign-in works in production.

---

## 🧯 Troubleshooting

| Problem | Fix |
| --- | --- |
| Backend won't start: `Missing required environment variable: MONGODB_URI` | You didn't create `backend\.env` or left `MONGODB_URI` blank. Re-check Part 2A. |
| `MongoServerError: bad auth` | Wrong DB password in `MONGODB_URI`, or you forgot to replace `<password>`. |
| Can't connect to Mongo / timeout | In Atlas → **Network Access**, make sure `0.0.0.0/0` is allowed. |
| "Google sign-in is disabled" message | Frontend `VITE_FIREBASE_*` values are missing/wrong. Re-check Part 1C + 2B. |
| Google popup error `auth/unauthorized-domain` | Add `localhost` (and your deployed domain) in Firebase → Auth → Settings → Authorized domains. |
| Image upload fails | Cloudinary keys missing/wrong in `backend\.env` (Part 1B). |
| Calls don't connect | Both users must be **signed in with Google**, online, and must **Allow** camera/mic. On strict networks add a TURN server (see README). |
| Frontend can't reach backend (CORS / network error) | Make sure backend is running on port 5000 and `VITE_API_URL` / `CLIENT_URL` match. |
| Port already in use | Stop the other process or change `PORT` (backend) / Vite will offer another port (frontend). |

---

## 📋 One-page cheat sheet

```powershell
# 1. Configure (do once)
cd C:\Users\abhitk\Desktop\World_Chat\backend  ; copy .env.example .env   # then edit .env
cd C:\Users\abhitk\Desktop\World_Chat\frontend ; copy .env.example .env   # then edit .env

# 2. Install (do once)
cd C:\Users\abhitk\Desktop\World_Chat\backend  ; npm install
cd C:\Users\abhitk\Desktop\World_Chat\frontend ; npm install

# 3. Run (two terminals, every time)
cd C:\Users\abhitk\Desktop\World_Chat\backend  ; npm run dev    # http://localhost:5000
cd C:\Users\abhitk\Desktop\World_Chat\frontend ; npm run dev    # http://localhost:5173

# 4. Prepare for GitHub upload (removes the big node_modules folders)
cd C:\Users\abhitk\Desktop\World_Chat
Remove-Item -Recurse -Force backend\node_modules
Remove-Item -Recurse -Force frontend\node_modules
# then drag the folder contents into a new repo on github.com
```

You're all set. Happy chatting! 🌍
