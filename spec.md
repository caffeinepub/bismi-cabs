# Specification

## Summary
**Goal:** Add an irreversible “Delete everything” capability that permanently wipes all stored app data and disables the Bismi Cabs app by placing it into a persistent “Site Deleted” state.

**Planned changes:**
- Add an authenticated admin/owner-only deletion flow with a strong confirmation step to trigger an irreversible wipe of all stored data (booking leads, user profiles, uploaded rate card, and authorized staff list).
- Persist a “deleted” flag in backend state so the app remains disabled across reloads/upgrades, and make repeated delete attempts return a clear “already deleted” response (or no-op with clear messaging).
- Add a lightweight backend mechanism for any visitor (including anonymous) to detect whether the site is deleted.
- Update frontend routing/UI to show a dedicated “Site Deleted” screen when deleted, hide/disable navigation and share-link actions, and ensure any attempted actions while deleted surface a clear error state (not a broken UI).
- Enforce backend access control so all existing site functionality methods are rejected once deleted, with consistent errors that the frontend can map to the “Site Deleted” state.

**User-visible outcome:** An admin/owner can permanently delete all app data and disable the site; afterward, all visitors only see a “Site Deleted” screen and no booking/profile/leads/rate-card functionality is accessible.
