# Panco Completed-Order Responsive Verification

The development-only `orderPreview=1` state was used to inspect the completed Cash on Delivery page without placing an order or sending notifications.

| Breakpoint | Confirmed layout behavior |
|---|---|
| Phone — 390 × 844 | The confirmation panel appears first, followed by the order summary in a separate full-width card. The confirmation copy, three-step status row, shipping destination, contact channel, product image, unit price, quantity, and total remain visible without overlap or horizontal clipping. |
| Desktop — 1440 × 900 | The confirmation panel and order summary remain in the intended two-column composition. The status row and shipping/contact cards stay within the main panel, while the product summary remains independently aligned in the right card. |

The preview uses the Morrow Tote and a `PA-PREVIEW` reference. It is gated to development mode and does not send email or Telegram notifications.
