# Arday CSS ownership and cascade contract

This document records stylesheet ownership. It does not define a new visual theme or authorize changes to rendered styles.

## Runtime stylesheet order

The order in `index.html` is intentional:

1. `game.css` — application shell, room scene, HUD, shared layout and calendar.
2. `game-panels.css` — drawer shells, panel sizing, scroll containment and panel-level layout.
3. `game-interactions.css` — furniture actions, cooking, specialized inventory/shop controls and interaction states. It loads after panel layout by design.
4. `game-world.css` — public hall, recruitment and world-specific presentation.
5. `game-career.css` — career, organization and public-hall panel presentation.
6. `exchange.css` — complete exchange terminal and catalogue presentation, including the rules formerly held in `editorial-boards.css`.
7. `commission.css` — complete commission board presentation, including the rules formerly held in `editorial-boards.css`.
8. `dungeon-board.css` — dungeon board and event-board presentation.
9. `ui-foundation.css` — semantic custom properties only; no component selectors.

`editorial-boards.css` is deprecated and is no longer loaded or precached. Its 206 rules were migrated into `exchange.css` and `commission.css`; selectors shared by both components were split into component-scoped selectors with their declarations and media conditions preserved.

## Component ownership boundaries

### Exchange and commission

- `exchange.css` owns selectors scoped to the exchange drawer, filters, balance, catalogue and product cards.
- `commission.css` owns selectors scoped to commission drawers, board metadata, commission cards, progress and claim actions.
- Do not put component-specific overrides back into a shared editorial stylesheet.
- A selector that genuinely targets both boards must be duplicated as two scoped selectors in the owning files, not kept as a late cross-component override.

### Panels and interactions

- `game-panels.css` owns drawer shells, panel geometry, scroll containers, safe-area spacing and panel-level layout.
- `game-interactions.css` owns furniture action controls, cooking interactions, inventory/shop specialized controls, selection states and action feedback.
- Inventory/shop currently share 38 selectors across the two files. Several declarations overlap because older visual variants and later panel-layout corrections were layered over time. This is a known transitional boundary, not permission to add more overrides.
- Do not move these shared selectors mechanically. Consolidate one component at a time only after preserving the current winning declarations, media-query order and specificity. The browser-rendered result must be compared at desktop, tablet and narrow mobile widths before removing the old rules.

## Maintenance rules

- Keep new selectors in the stylesheet that owns the component. Cross-module exceptions must be narrowly scoped and documented beside the rule.
- Keep responsive overrides with their component and preserve existing breakpoints and source order during structural cleanup.
- Do not remove `!important` mechanically. Identify the current winning declaration and prove an equivalent replacement first.
- Do not merge same-selector rules when declarations or media-query contexts differ.
- Remove exact duplicate blocks only after checking context and source order.
- Avoid appending late overrides to fix component problems. Consolidate the owning rule instead, but only when the cascade can be preserved.
- Keep `ui-foundation.css` limited to custom-property definitions.
- CSS parsing, selector inventories and asset checks are not visual regression tests.

## Refactor sequence

1. Keep exchange and commission styles in their owning stylesheets; the shared editorial override layer has been retired.
2. Map the 38 inventory/shop selectors shared by `game-panels.css` and `game-interactions.css`, then migrate a single component group at a time.
3. Preserve source order, specificity, media queries and computed property winners during each migration.
4. Reduce `!important` only when browser comparison proves the replacement equivalent.
5. Check CSS syntax, asset references and cache versions; use browser screenshots at representative viewport sizes before claiming visual equivalence.
