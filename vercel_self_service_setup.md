# Panco: Self-Service Vercel Deployment Guide

This guide explains what is required to deploy the Panco codebase from GitHub to Vercel without placing passwords, API keys, or bot tokens in the repository or in chat. The source repository is **private** at [github.com/maouri50/panco-storefront](https://github.com/maouri50/panco-storefront).

## 1. Import the GitHub Repository

In Vercel, select **Add New → Project**, import `maouri50/panco-storefront`, and keep `main` as the Production Branch. Vercel deploys new pushes to the connected GitHub repository automatically; environment-variable changes only apply to deployments created after the change, so deploy again after every configuration update.[1]

The current repository contains a Vite frontend plus a Vercel serverless API adapter. Do not add API tokens to source files, commit an `.env` file, or paste keys into GitHub issues, commits, or chat.

## 2. Required Environment Variables

Add all values under **Project → Settings → Environment Variables**. Select **Production**, **Preview**, and **Development** for each value. Use the **Secret** type for all credentials. Vercel encrypts configured variables at rest, but they remain visible to users with project access, so keep project access limited.[2]

| Variable | Needed for | Where to create or find it | Notes |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram order alerts | Open [@BotFather](https://t.me/BotFather) in Telegram → `/mybots` → **Panco Orders** → **API Token** | Treat it like a password. Regenerate it in BotFather immediately if it is ever exposed.[5] |
| `TELEGRAM_OWNER_CHAT_ID` | Destination for private Telegram alerts | Send `/start` to **Panco Orders**, then retrieve the private chat identifier using the bot’s `getUpdates` response or the value recorded during setup | A Telegram bot can send a private message only after the recipient has contacted the bot first.[5] |
| `RESEND_API_KEY` | Cash on Delivery email alerts | [Resend API Keys](https://resend.com/api-keys) → create a dedicated `Panco Vercel Orders` key with **Sending access** | A dedicated, restricted sending key is safer than a shared full-access key.[3] |
| `ORDER_NOTIFICATION_EMAIL` | Owner order-email inbox | Enter `saadyou50@gmail.com` | This is configuration, not a password. |
| `ORDER_NOTIFICATION_FROM` | Email sender name/address | For example `Panco Orders <orders@yourdomain.com>` after Resend verifies the domain | Optional while testing. A production sender needs a Resend-verified domain.[4] |
| `DATABASE_URL` | Managed catalog and persistent admin data | Create a PlanetScale MySQL database, then copy its secure connection string | The current Panco schema uses Drizzle with MySQL. Do not replace this with a PostgreSQL URL without a separate database migration. |
| `JWT_SECRET` | Secure owner session cookies | Generate a new random secret inside Vercel or with a password manager | Use a new long random value for Vercel only; do not reuse it elsewhere. |

> **Important:** The public Panco storefront and static catalog fallback can render without a database. However, persistent catalog editing needs `DATABASE_URL`. The current owner login uses Manus OAuth; a fully independent Vercel `/admin` login requires an independent authentication provider or an OAuth configuration that explicitly allows the Vercel callback URL. Do not copy internal Manus OAuth values into Vercel.

## 3. Create the Supporting Accounts

### Telegram alerts

Open [@BotFather](https://t.me/BotFather), choose `/newbot`, create the **Panco Orders** bot, and store the token only in Vercel. Open the new bot and send `/start` from the owner account before testing. Telegram’s official Bot API uses HTTPS requests authenticated by the bot token and returns JSON responses.[5]

### Resend email alerts

Open [Resend](https://resend.com), create a dedicated sending key, and add it as `RESEND_API_KEY`. For a branded sender, add the domain you own in [Resend Domains](https://resend.com/domains) and copy the DNS records Resend supplies. Resend states that verified domains allow sending from addresses at that domain; it recommends a subdomain for sending-reputation separation.[4]

### MySQL catalog database

Create a PlanetScale account and a MySQL database. Then generate a production connection string and add it to Vercel as `DATABASE_URL`. Apply the existing non-destructive schema migrations from the repository against that database before relying on `/admin` catalog editing. Keep the database password embedded in the connection URL only in Vercel’s Secret setting, never in GitHub.

## 4. Deploy and Test

After adding the variables, trigger a new production deployment from Vercel **Deployments → Redeploy**, or push a new commit to `main`. Vercel documents that new environment values do not affect previous deployments.[2] The public production URL should use the Panco Vercel project rather than any unrelated `refront.vercel.app` deployment.

Test in this order:

1. Open the homepage and confirm every product photo loads.
2. Open a product, fill the Cash on Delivery form with controlled test details, and submit it once.
3. Confirm the order summary screen appears.
4. Confirm the Telegram and email alerts arrive with the selected product image, quantity, total, and delivery information.
5. Only after configuring independent authentication and the MySQL database, test `/admin` using the intended owner account.

## 5. Use `typeitaliano.com` Temporarily

In the Panco Vercel project, open **Settings → Domains → Add Domain** and enter `typeitaliano.com`. Vercel will show the exact DNS record required for your registrar. For an apex domain, this is an **A** record; for a subdomain, it is a **CNAME** record. Vercel can also request a TXT verification record if the domain is already attached elsewhere.[6]

Do not remove existing registrar records until you understand what they serve. Use the exact host and value shown in your Vercel domain card; the Vercel documentation lists a common apex A-record value, but the project card is the authoritative source for your domain.[6]

## Security Checklist

Never place tokens in client-side variables beginning with `VITE_`, source code, GitHub commits, screenshots, messages, or public pages. Restrict the Panco Vercel project to trusted administrators. If a token is exposed, revoke or regenerate it immediately at the provider, replace the Vercel value, then redeploy.

## References

[1]: https://vercel.com/docs/git/vercel-for-github "Vercel: Deploying GitHub Projects"
[2]: https://vercel.com/docs/environment-variables "Vercel: Environment Variables"
[3]: https://resend.com/docs/dashboard/api-keys/introduction "Resend: Manage API Keys"
[4]: https://resend.com/docs/dashboard/domains/introduction "Resend: Verified Domains"
[5]: https://core.telegram.org/bots/tutorial "Telegram: From BotFather to Hello World"
[6]: https://vercel.com/docs/domains/working-with-domains/add-a-domain "Vercel: Adding and Configuring a Custom Domain"
