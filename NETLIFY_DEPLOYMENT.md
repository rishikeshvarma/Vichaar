# 🚀 Deploying KMIT Vichaar on Netlify

This guide explains how your application is configured for Netlify and how to deploy both the frontend and backend.

---

## 📁 What Has Been Configured

1. **`netlify.toml`**: Configures the build command (`npm run build`), publish directory (`dist`), functions directory (`netlify/functions`), Python 3.10 runtime, and redirect rules.
2. **`netlify/functions/api.py`**: Serverless function bridge that translates Netlify/AWS Lambda requests to your Flask app in `api/index.py` using `serverless-wsgi`.
3. **`public/_redirects`**: Ensures single-page app (SPA) routing for React Router DOM and routes `/api/*` to the serverless function.
4. **`requirements.txt`**: Added `serverless-wsgi>=3.0.0` for Netlify's serverless Python runtime.
5. **`api/index.py`**: Added `*.netlify.app` and dynamic CORS handling so your Netlify frontend can talk to the backend without CORS blocks.

---

## 🛠️ Step-by-Step Netlify Deployment

### Step 1: Connect Your GitHub Repository
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **Add new site** → **Import an existing project**.
3. Select **GitHub** and choose your repository: `rishikeshvarma/Vichaar`.

### Step 2: Build & Deploy Settings
Netlify will automatically detect most settings from `netlify.toml`:
- **Branch to deploy**: `main`
- **Base directory**: (leave blank or `/`)
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

### Step 3: Environment Variables
Go to **Site settings** → **Environment variables** (or during site setup) and add:

| Key | Value Description |
| :--- | :--- |
| `PYTHON_VERSION` | `3.10` |
| `NODE_VERSION` | `20` |
| `VITE_SUPABASE_URL` | Your Supabase Project URL (`https://your-project.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key |
| `SUPABASE_URL` | Your Supabase Project URL (for the Flask backend) |
| `SUPABASE_KEY` | Your Supabase Service Role or Anon Key (for the Flask backend) |

### Step 4: Deploy Site
Click **Deploy site**.
Once deployment finishes, Netlify assigns your URL (e.g., `https://your-site-name.netlify.app`).

### Step 5: Connecting Backend and Frontend
- On your first deployment, your backend API is available at:
  `https://your-site-name.netlify.app/api/`
- Once you have this URL, you can update the backend URL in your frontend files or add `VITE_API_BASE_URL` in your Netlify environment variables and trigger a redeploy!
- Don't forget to add your new `.netlify.app` domain to your **hCaptcha** dashboard settings so captchas render properly on the new domain.
