# Homepage Header Transition Verification

## Initial campaign state

Desktop and mobile screenshots confirm that the homepage launches with the Panco campaign image unobstructed: the navigation is transparent over the hero, and the dark Cash on Delivery announcement strip is intentionally absent before the visitor reaches the first shop heading.

## Responsive observations

At 1280px wide, the navigation remains legible against the dark campaign image and preserves its centered Panco wordmark. At 375px wide, the compact menu, wordmark, search, and bag controls remain readable without covering the hero call to action.

## Transition implementation

The post-hero transition is unit-tested through `getHeaderTransitionThreshold`: once the first shop title begins to enter the viewport, the dark Cash on Delivery strip is revealed and the navigation moves beneath it onto a pale neutral surface.

## Automated and capture checks

TypeScript and the complete Vitest suite pass after the implementation. Preview captures correctly show the transparent initial hero state on desktop and mobile. Direct `/#shop` captures now intentionally exercise the post-hero state: desktop and mobile both show the dark Cash on Delivery strip with the compact pale Panco navigation immediately below it. The menu, search, and bag controls remain visible in the compact state.
