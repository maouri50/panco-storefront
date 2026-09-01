# Panco Branded Email DNS Setup

## Current state

- The dedicated Resend account is `saadyou50@gmail.com`.
- The production Cash on Delivery test email was accepted and marked **Delivered** by Resend, but arrived in Gmail Spam because it used Resend's shared onboarding sender.
- The team approved adding `typeitaliano.com` as the temporary Panco sending domain in Resend.
- The `typeitaliano.com` DNS zone is managed in the Vercel team and connected to `panco-storefront`.
- On September 1, 2026, the approved DKIM TXT, sending MX, sending SPF TXT, and optional monitoring-only DMARC TXT records were created in Vercel. The existing root and wildcard Vercel routing records were not changed.
- Resend completed verification at 6:59 PM UTC on September 1, 2026. The domain is now **verified** and ready to send branded Panco order email.
- `ORDER_NOTIFICATION_FROM` was added as a non-secret **Production** configuration value in the correct Vercel project, `panco-storefront`, using `Panco Orders <orders@typeitaliano.com>`.
- A Production redeployment of the current `main` source was requested so the sender setting can take effect. Existing Resend and Telegram credentials were not modified.
- Resend subsequently recorded a successful Production `/emails` API response using the verified branded sender. No customer order or personal data is retained in this setup note.
- After signing into the correct recipient Gmail account, `saadyou50@gmail.com`, the corresponding branded Panco message was found in **Inbox**. The earlier non-receipt report resulted from viewing a different Gmail account; no additional message or Telegram alert was sent during the mailbox investigation.

## Resend record categories approved for Vercel DNS

| Purpose | Name | Type |
|---|---|---|
| Domain verification | `resend._domainkey` | TXT |
| Sending return path | `send` | MX |
| Sending authorization | `send` | TXT |
| Monitoring only, optional | `_dmarc` | TXT |

The exact public values are obtained from the active Resend domain page immediately before entry. No private API key or customer data is stored in this file.

## Next controlled steps

The Production deployment reached **Ready**. The first approved email-only check did not create an email because the local test runner did not have the matching production notification credentials; it did not send Telegram. A branded Production message was independently confirmed in the recipient Inbox, so no additional delivery test is needed unless the owner requests a separate repeat. The existing Telegram order alert must remain unchanged and must not be used for any such test.
