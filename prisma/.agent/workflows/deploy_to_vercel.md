---
description: How to deploy the Focus Group application to Vercel
---

# Deploying to Vercel

This guide explains how to host your application on Vercel, which is the best platform for Next.js apps.

## Prerequisites
1.  **GitHub Repository**: Your code must be pushed to a GitHub repository.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3.  **Supabase Project**: You already have this.

## Step 1: Push to GitHub
Ensure your latest changes are committed and pushed:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## Step 2: Import to Vercel
1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Find your `focus_group` repository and click **"Import"**.

## Step 3: Configure Project
Vercel will auto-detect Next.js. You just need to set the **Environment Variables**.

Expand the **"Environment Variables"** section and add the following:

| Name | Value Source | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase -> Settings -> Database | Use the **Transaction Pooler** URL (usually port 6543). |
| `DIRECT_URL` | Supabase -> Settings -> Database | Use the **Session Pooler** URL (usually port 5432). |
| `GOOGLE_API_KEY` | Your Google AI Studio Key | The same key you use locally. |

> **Tip:** You can copy these values from your local `.env` file if you have one, or get them directly from the Supabase dashboard.

## Step 4: Supabase Network Settings
To allow Vercel to connect to your database:
1.  Go to your **Supabase Dashboard**.
2.  Navigate to **Settings** -> **Database**.
3.  Under **Network Restrictions**, ensure **"Allow access from 0.0.0.0/0"** is checked (or specifically allow Vercel IPs if you prefer strict security, but 0.0.0.0/0 is standard for serverless).

## Step 5: Deploy
1.  Click **"Deploy"** on Vercel.
2.  Wait for the build to complete (usually 1-2 minutes).
3.  Once done, you will get a live URL (e.g., `https://focus-group-xyz.vercel.app`).

## Troubleshooting
-   **Build Failed?** Check the logs. If it's a type error, run `npm run build` locally to debug.
-   **Database Error?** Double-check your `DATABASE_URL` and `DIRECT_URL`. Ensure you didn't swap them.
