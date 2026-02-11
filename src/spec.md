# Specification

## Summary
**Goal:** Add an authenticated booking form and an admin-style leads page, backed by persistent lead storage in the backend.

**Planned changes:**
- Add a backend lead data model with persistent (stable) storage for booking leads: leadId, customerName, customerPhone, pickupLocation, dropLocation, pickupDateTime (text), notes (optional), createdAt, createdBy (caller principal).
- Implement backend methods to create a lead (update) and list leads (query), rejecting anonymous callers (Internet Identity required).
- Add a mobile-friendly Booking Form page that is protected by authentication, validates required fields, submits to the backend, and shows success feedback with reset/ready-for-next behavior.
- Add a protected Leads page that fetches and displays all stored leads in a readable table/list, including loading and error states.
- Update in-app navigation so users can reach Login, Booking Form, and Leads pages without manual URL edits, keeping Logout accessible.

**User-visible outcome:** After signing in, users can submit booking details via a Booking Form and view saved customer leads on a Leads page; leads persist across backend upgrades and are not visible when signed out.
