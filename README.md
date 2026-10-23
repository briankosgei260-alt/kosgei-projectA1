# Private device portal

This starter lets one configured owner account sign in, bootstrap one first
device, and approve or revoke later browser profiles. It is a private web app,
not a replacement for a web browser.

## Set up Supabase

1. Create a Supabase project and configure its Auth email provider.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql).
3. Create/invite the single owner account in Supabase Auth, then disable public
   sign-ups so other people cannot create accounts in the project.
4. Copy the project URL, anon key, and service-role key from Supabase settings.
   The service-role key is a server secret: never put it in client-side code or
   commit it to GitHub.
5. Create `.env.local` in the project folder based on `.env.example`. Set
   `OWNER_NAME` to the name to show on the portal, `OWNER_EMAIL` to the
   invited Supabase Auth email, and `BOOTSTRAP_DEVICE_CODE` to a long random
   one-time secret. Fill in the Supabase URL and keys.
6. In Supabase Auth URL settings, allow the local callback
   `http://localhost:3000/auth/callback`.
7. Install Node.js LTS if it is not already installed. In a terminal opened in
   the project folder, run `npm install` followed by `npm run dev`, then open
   `http://localhost:3000`.

## First device and later devices

1. Sign in using the configured owner email.
2. On the first trusted browser only, enter the bootstrap code and give it a
   recognizable name.
3. Remove `BOOTSTRAP_DEVICE_CODE` from the deployment environment after the
   first device is registered, but keep a private recovery copy. It can be
   temporarily restored if every approved device is lost.
4. Sign in on another browser/device and request access with a recognizable
   name. Approve it from an already approved device on `/devices`.
5. Revoke a lost or unwanted device from `/devices`.
   The portal will not let you revoke your last approved device.
6. If every device is lost, sign in to the owner account, revoke the stale
   approved device rows in the Supabase SQL Editor, temporarily restore the
   private recovery copy of `BOOTSTRAP_DEVICE_CODE` in Vercel, and bootstrap a
   replacement. Remove the code from Vercel again afterward.

## Deploy to Vercel

1. Create a private GitHub repository. In the project folder, run
   `git init`, `git add .`, `git commit -m "Create private device portal"`,
   then connect and push to your GitHub repository using GitHub's instructions.
   The included `.gitignore` excludes `.env.local`, dependency files, and build
   output. Never force-add environment files.
2. In Vercel, choose **Add New Project**, import that GitHub repository, and
   keep the detected Next.js framework settings.
3. In Vercel **Project Settings → Environment Variables**, add:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `OWNER_NAME`, `OWNER_EMAIL`,
   `NEXT_PUBLIC_APP_URL`, and `BOOTSTRAP_DEVICE_CODE`.
   Set `NEXT_PUBLIC_APP_URL` to your Vercel HTTPS URL, without a trailing slash.
   Treat the service-role key and bootstrap code as secrets.
4. In Supabase Auth URL settings, add the Vercel URL plus
   `/auth/callback` to the allowed redirect URLs. Keep the localhost callback
   too if you will test locally.
5. Deploy/redeploy in Vercel. Open the deployed site, sign in with the owner
   email, and register your first trusted browser using the bootstrap code.
   Remove the bootstrap code from Vercel after setup, keeping a private recovery
   copy outside GitHub.
6. Sign in on additional devices and approve their requests from **Manage
   authorized devices** on an already approved device.

Enable MFA for the owner account in Supabase for an additional sign-in factor.

Device approval is tied to a browser profile's secure, HTTP-only cookie. It is
not proof of a physical phone or laptop, and clearing browser data requires
approval again. Do not use public carrier IP addresses as device identity:
they can change and can be shared by unrelated users.
