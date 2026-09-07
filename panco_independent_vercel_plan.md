# Panco Independent Vercel Plan

## Current state

Panco is already backed up to the private GitHub repository `maouri50/panco-storefront`. The current Vercel configuration builds a self-contained serverless API function from `server/vercelApiApp.ts`, so public catalog, Cash on Delivery, Resend, and Telegram behavior do not need a Manus server at runtime.

The remaining obstacle is the owner dashboard. It currently relies on the project’s Manus OAuth flow, and its database connection is absent in the independent Vercel deployment. The public storefront looks functional because it deliberately falls back to the bundled Panco catalog when no database records are available; this fallback must not be mistaken for editable live catalog storage.

## Required independent production foundation

| Capability | Independent Vercel implementation | Owner action required |
| --- | --- | --- |
| Owner `/admin` sign-in | One dedicated owner email and password stored only as encrypted Vercel environment values; secure signed session cookie with a short expiry. | Set the chosen email and password directly in Vercel. Never share either in chat. |
| Catalog, prices, and publication state | Existing Drizzle MySQL schema backed by an external MySQL-compatible database. | Connect an existing MySQL-compatible database or approve a Vercel Marketplace TiDB Cloud database. |
| Newsletter list | New consent-recorded newsletter-subscriber table with protected dashboard list and unsubscribe state. It does not send marketing mail by itself. | Connect the database; approve a sending provider later only if campaign email is wanted. |
| Product image management | Existing products retain their current URLs. Future owner uploads need a storage service independent of the project workspace, such as Vercel Blob. | Approve a storage integration only when direct file uploads are needed. |
| Order alerts | Existing `RESEND_API_KEY`, `ORDER_NOTIFICATION_EMAIL`, Telegram settings, and verified `ORDER_NOTIFICATION_FROM` remain Vercel environment values. | None, unless changing recipients or sender later. |

## Security design

The implementation will not contain an admin password in GitHub or application code. The owner email, password, and session-signing value will be Vercel-only encrypted environment variables. The server will compare credentials in constant time, issue an `HttpOnly`, `Secure`, `SameSite=Lax` cookie, and let the owner explicitly sign out. Existing public Cash on Delivery, product, contact, and localization routes remain public.

## Database choice

Panco currently uses Drizzle’s MySQL driver. A MySQL-compatible Vercel Marketplace database such as TiDB Cloud preserves the current catalog implementation and avoids an unnecessary conversion to a different database dialect. The project requires one Vercel `DATABASE_URL`; after it is connected, the database migration creates catalog, announcement, and newsletter tables.

> The Vercel Marketplace supports external relational databases and injects their credentials into a connected project; Vercel’s former Postgres product is not available for new projects. [1] [2]

## Deployment ownership

After these changes, the normal owner workflow is: change a product or price in `/admin`, save it to the independent database, and deploy code changes by pushing GitHub’s `main` branch to the Vercel project. The current production domain remains `https://typeitaliano.com`.

## References

[1]: https://vercel.com/docs/postgres "Postgres on Vercel"
[2]: https://vercel.com/docs/storage "Vercel Storage overview"
