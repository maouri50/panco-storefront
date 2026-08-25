# Reference-Inspired Structural Map

This revision uses the supplied leather storefront only as a **structural and interaction reference**. North Atelier retains original branding, imagery, product names, descriptive copy, and color tokens.

| Reference pattern | North Atelier implementation |
| --- | --- |
| Language selection gate | Optional welcome overlay with an editable regional selector |
| Rotating utility announcement | Lightweight message strip with three local delivery and service statements |
| Overlay header | Centered house mark, category navigation, search, and bag controls |
| Full-bleed hero carousel | Three original product/atelier slides with original campaign copy |
| New-arrivals product rail | Editable product catalog cards with quick add interaction |
| Featured collections | Original category cards for daily carry, travel, desk, and details |
| Craftsmanship story | Full-width original workshop narrative and material notes |
| Small goods, journal, newsletter | Original editorial modules and subscription interface |
| FAQ and footer | Original care information and editable studio navigation |

## Editable Controls

The central color tokens are in `client/src/index.css`, labeled **EDITABLE COLOR SYSTEM**. Page content collections are held near the top of `client/src/pages/Home.tsx` as plain arrays.

## Editable Color System

The revision will exchange the original forest-and-saddle palette for an **inset blue, shell, and ember** scheme. Every major surface uses a named CSS variable so you can change the visual identity without rewriting components.

| Token | Initial revision value | Role |
| --- | --- | --- |
| `--ink` | `#172132` | Primary typography and dark surfaces |
| `--night` | `#10243B` | Announcement bar, strong calls to action, footer |
| `--shell` | `#F5F0E7` | Main page background and light cards |
| `--sand` | `#E4D5C1` | Secondary paper-like panels |
| `--ember` | `#BD6245` | Selected states and sale details |
| `--cloud` | `#BFD8DE` | Cool highlight and collection accent |

## Original Content Rules

Brand naming, imagery, product names, prices, workshop claims, FAQs, and all copy remain original North Atelier content. The new implementation recreates broad page patterns such as carousels, collection tiles, the craft narrative, and footer architecture, but does not copy another retailer’s proprietary text or assets.

## Product Detail Reference Patterns

The supplied product page uses an image gallery alongside a purchase column. Its purchase column contains a breadcrumb, product name, price treatment, a color or variant choice, inventory status, an order action, a direct order form, supporting product description, informational accordions, review entry, and an adjacent related-product recommendation. North Atelier will recreate these **functional patterns** with original product data and its own Cash on Delivery language.

| Product-page pattern | North Atelier implementation |
| --- | --- |
| Multiple product views | Editable three-image gallery with active thumbnail selection |
| Color variants | Original leather-color chips with image updates |
| Inventory and quantity | Available status, quantity stepper, and add-to-bag interaction |
| Easy order form | Original delivery form that highlights Cash on Delivery as the default method |
| Material and care content | Editable detail accordions for construction, delivery, and care |
| Reviews | A neutral "no reviews yet" panel without fabricated ratings or customer content |
| Related products | Original catalog cards linked to other North Atelier product details |

## Product Page Validation Note

The North Atelier product cards now navigate to `/products/:slug`, where the original product page presents a selectable image gallery, color controls, quantity selection, an add-to-bag action, a Cash on Delivery call-to-action, material accordions, a neutral product-note section, and related product links. The page retains the reference’s purchase-flow cadence while using the North Atelier color system and original catalog content.
