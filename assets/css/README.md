# Arday CSS ownership and cascade contract

This document describes the current stylesheet boundaries. It does not define a new visual theme and does not authorize changing rendered styles.

## Current load order

The stylesheet order in `index.html` is intentional:

1. `game.css` — application shell, room scene, HUD, shared layout and calendar.
2. `game-panels.css` — drawer, shop, inventory and panel composition.
3. `game-interactions.css` — furniture interaction wheel, cooking controls, shop/inventory interaction states and their compatibility overrides.
4. `game-world.css` — public hall, recruitment and world-specific presentation.
5. `game-career.css` — career, organization and public-hall panel presentation.
6. `exchange.css` — exchange terminal base styles.
7. `commission.css` — commission board base styles.
8. `editorial-boards.css` — later editorial composition overrides shared by commission and exchange.
9. `dungeon-board.css` — dungeon board and event-board presentation.
10. `ui-foundation.css` — semantic design tokens only; it must not contain component selectors.

Do not reorder these files as a cleanup operation. Several older components still depend on later, more specific compatibility rules.

## Maintenance rules

- Keep each new selector in the stylesheet that owns the component. Cross-module exceptions must be narrowly scoped and documented beside the rule.
- Keep responsive overrides next to the component rules they modify where practical. Preserve existing media-query breakpoints and source order during structural cleanup.
- Do not remove `!important` mechanically. Many occurrences currently override legacy selectors from earlier files; first identify the winning declaration and prove the replacement preserves the cascade.
- Do not merge same-selector rules when their declarations differ. Repeated selectors can represent intentional responsive or visual variants.
- Remove an exact duplicate only after checking its media-query context, source order, and any intervening declarations that could affect the same element.
- Avoid appending another late override to solve a component problem. Move or consolidate the owning rule only after comparing the before/after computed cascade.
- Keep `ui-foundation.css` limited to custom-property definitions. It is a token registry, not a global component stylesheet.
- Any future refactor must preserve the rendered result at existing viewport sizes. CSS parsing and brace checks are not visual regression tests.

## Refactor sequence

1. Remove proven exact duplicate declarations without changing source-order winners.
2. Map cross-file selector ownership and identify legacy overrides that can be moved without changing specificity or order.
3. Consolidate component rules in their owning files while preserving media-query boundaries.
4. Reduce `!important` only when a replacement selector and load order are demonstrably equivalent.
5. Run syntax, asset-reference and cache checks; use browser screenshots at representative viewport sizes before claiming visual equivalence.
