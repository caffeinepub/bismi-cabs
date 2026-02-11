# Specification

## Summary
**Goal:** Let customers open a shared customer link directly into the Booking flow and submit a booking without logging in, while keeping owner-mode login requirements unchanged.

**Planned changes:**
- Update customer share link generation in `frontend/src/components/ShareAppLinkCard.tsx` to produce a deep-link URL that opens the Booking page on first load (and ensure Copy/Open actions use it).
- Adjust frontend routing/boot logic so visiting a customer share link in a logged-out session shows the Booking page instead of redirecting to Login.
- Make the Booking form available for anonymous visitors in customer mode (no authentication-blocking screen) and allow “Create Booking” to submit while logged out.
- Update backend authorization so anonymous/guest callers can create booking leads via `createBookingLead`, while keeping owner/admin access protections in place for viewing leads (e.g., `getBookingLeads` remains protected).

**User-visible outcome:** A customer can click a shared customer link in a fresh browser session, land directly on the Booking page, and submit a booking successfully without signing in; owner links still require Internet Identity login when logged out.
