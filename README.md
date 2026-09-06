# MedScore Academy

Clinical diagnosis game — 120 cases across 8 specialties, with voice input (Web Speech API) and text-to-speech case reading.

## Local development

```bash
npm install
npm run dev
```

Opens on http://localhost:5173

## Deploy to Vercel + connect medscoreacademy.com

### 1. Push to GitHub

```bash
cd medscore-academy
git init
git add .
git commit -m "Initial commit"
```

Create a new empty repo on GitHub (e.g. `medscore-academy`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/medscore-academy.git
git branch -M main
git push -u origin main
```

### 2. Import to Vercel

1. Go to https://vercel.com → **Add New… → Project**
2. Import your GitHub repo
3. Framework preset: **Vite** (auto-detected)
4. Build command: `npm run build` (default)
5. Output directory: `dist` (default)
6. Click **Deploy**

You'll get a live URL like `medscore-academy.vercel.app` within ~30 seconds.

### 3. Connect medscoreacademy.com

In Vercel:

1. Open the project → **Settings → Domains**
2. Enter `medscoreacademy.com` → Add
3. Vercel will show you the DNS records you need. Two options:

**Option A — Point the whole domain (recommended)**
At your domain registrar's DNS panel, add:

| Type  | Name | Value                  |
|-------|------|------------------------|
| A     | @    | `76.76.21.21`          |
| CNAME | www  | `cname.vercel-dns.com` |

**Option B — Use Vercel nameservers (simplest)**
Change your registrar's nameservers to:
- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`

DNS usually propagates within an hour. Vercel auto-issues an SSL certificate — no action needed from you.

### 4. Redeploying

Any `git push` to `main` = automatic redeploy. That's it.

## Deploy to Netlify (alternative)

```bash
npm install
npm run build
```

Then drag the `dist/` folder onto https://app.netlify.com/drop. Add your custom domain under **Domain settings**.

## Notes

- Voice input (Web Speech API) works in Chrome, Edge, and Safari. Firefox doesn't support it — the app still works with typed input.
- The logo lives in `public/logo.jpg` — swap it there to update.
- Cases are in `src/App.jsx` under the `CASES` constant. Add specialties or cases directly.
