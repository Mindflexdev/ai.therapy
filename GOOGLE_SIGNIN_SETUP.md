# Google Sign-In Setup Guide

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 1.2 Create a New Project (or select existing)
- Click the project dropdown at the top
- Click "New Project"
- Name it: `therapy-ai` (or whatever you prefer)
- Click "Create"

### 1.3 Enable Google+ API
- In the left sidebar, go to: **APIs & Services** > **Library**
- Search for: `Google+ API`
- Click on it and click **Enable**

### 1.4 Create OAuth Credentials
- Go to: **APIs & Services** > **Credentials**
- Click **+ CREATE CREDENTIALS** > **OAuth client ID**
- If prompted to configure consent screen:
  - Click **Configure Consent Screen**
  - Choose **External** (unless you have a Google Workspace)
  - Fill in:
    - App name: `therapy.ai`
    - User support email: Your email
    - Developer contact: Your email
  - Click **Save and Continue** (skip optional scopes)
  - Add test users if needed (your email)
  - Click **Save and Continue**

### 1.5 Create Web Application Credentials
- Application type: **Web application**
- Name: `therapy.ai Web`
- Authorized JavaScript origins:
  - `http://localhost:8081` (for local development)
  - `https://cxzzakslsiynhjeyhejo.supabase.co` (your Supabase project URL)
- Authorized redirect URIs:
  - `https://cxzzakslsiynhjeyhejo.supabase.co/auth/v1/callback`
- Click **Create**

### 1.6 Save Your Credentials
You'll see a popup with:
- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxx`

**IMPORTANT**: Copy both and keep them safe!

---

## Step 2: Configure Supabase

### 2.1 Go to Supabase Dashboard
- Visit: https://supabase.com/dashboard
- Select your `therapy.ai` project

### 2.2 Enable Google Provider
- Go to: **Authentication** > **Providers**
- Find **Google** in the list
- Toggle it **ON**
- Paste your:
  - **Client ID** (from Step 1.6)
  - **Client Secret** (from Step 1.6)
- Click **Save**

---

## Step 3: Update App Code

I will update `app/sign-in.tsx` to add a Google sign-in button.

---

## Testing

Once everything is set up:
1. Run your app: `npm run web`
2. Click "Sign in with Google"
3. You should see Google's login popup
4. After signing in, check Supabase **Table Editor** > `users` - you should see a new row!

---

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the redirect URI in Google Cloud Console exactly matches:
  `https://cxzzakslsiynhjeyhejo.supabase.co/auth/v1/callback`

### "Access blocked: This app's request is invalid"
- Make sure you enabled the Google+ API
- Check that your OAuth consent screen is configured

### User not appearing in `public.users` table
- Check the trigger is working: Go to Supabase SQL Editor and run:
  ```sql
  select * from auth.users;
  ```
- If you see the user there but not in `public.users`, the trigger might have failed. Check logs.
