# North Atelier Catalog Administration

The `/admin` area will be restricted to the project owner through the existing authenticated **admin** role. Public shoppers only see published catalog items; they cannot access management procedures or customer data.

| Field | Use in storefront | Admin behavior |
| --- | --- | --- |
| Name and slug | Product cards and product-page route | Editable name; slug is generated from the name and can be adjusted before saving |
| Category, price, previous price, tag | Product rail and commerce metadata | Editable text fields |
| Primary image and gallery URLs | Product card, gallery, and related-items rail | Editable image URLs, with clear guidance to use managed upload URLs |
| Description and highlights | Product-detail purchase ledger | Editable long text and line-separated highlights |
| Color variants | Swatches and variant controls | Editable structured color data with a color value and image URL |
| Published state and display order | Public catalog visibility and arrangement | Draft items remain private; published items are ordered in the storefront |

> The database will be seeded only with North Atelier’s existing original catalog data. No reviews, ratings, or testimonials are created or managed by this administration feature.
