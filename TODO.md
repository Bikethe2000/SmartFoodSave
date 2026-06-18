# TODO - Contact form (Gmail App Password)

## Step 1: Backend email support
- [ ] Add `nodemailer` to `site/server/server.js`.
- [ ] Implement `POST /api/contact` in `site/server/server.js`.
- [ ] Use env vars: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CONTACT_TO_EMAIL`.

## Step 2: Site UI route/page
- [ ] Add a contact page/route (`/contact`) in `site/src/App.jsx`.
- [ ] Render `site/src/components/ContactForm.jsx`.
- [ ] Add navbar link to `/contact` in `site/src/components/Navbar.jsx`.

## Step 3: Docs UI integration
- [ ] Ensure docs renders contact form in an obvious place (the docs app already has a “Contact Us” tab in `docs/src/App.jsx`, but verify it compiles—there are visible merge markers in that file).
- [ ] Update docs contact submission URL if needed so it calls **site** backend `/api/contact`.

## Step 4: Env docs
- [ ] Create/update `.env.example` describing the required backend env vars.
- [ ] Update README(s) with Gmail App Password instructions.

## Step 5: Testing
- [ ] Start `site` backend and `site` frontend.
- [ ] Start `docs` frontend.
- [ ] Submit contact form and confirm email is received.

