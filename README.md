# WealthFlow Pro

WealthFlow Pro is a Practifi-inspired CRM and business intelligence platform
for wealth management firms. This starter is built for the hackathon scope
using Next.js, Supabase, and Vercel.

## Current foundation

- product landing page that reflects the blueprint scope
- dashboard preview with seeded CRM, portfolio, pipeline, and compliance data
- Supabase SSR helpers for browser, server, and middleware usage
- sign-in page wired to Supabase Auth email/password sign-in
- starter SQL schema aligned with the wealth-management data model

## Local setup

1. Install dependencies if needed:

   ```bash
   npm install
   ```

2. Confirm `.env.local` contains:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

3. Run the SQL migration from
   `supabase/migrations/202603141200_init_wealthflow.sql` in the Supabase SQL
   editor.

4. Create your first test user in Supabase Auth with email and password.

5. Start the app:

   ```bash
   npm run dev
   ```

## Deployment

Deploy the project to Vercel and add the same Supabase environment variables in
the Vercel project settings.

## Suggested next implementation steps

1. Replace the seeded dashboard data with live Supabase queries.
2. Add CRUD flows for households, portfolios, opportunities, and tasks.
3. Wire Supabase Storage for documents and client portal artifacts.
4. Add advisor-specific dashboards, billing, and India-focused compliance rules.
