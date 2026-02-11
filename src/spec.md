# Specification

## Summary
**Goal:** Ensure customers (non-admin users) cannot see or access the Leads page, and only see New Booking and Rate Card actions/navigation.

**Planned changes:**
- Hide all UI entry points to the Leads page for non-admin users (mobile bottom nav Leads tab, desktop “View Leads” button, and authenticated home/login “View All Leads” button).
- Add frontend route/page gating so non-admin users who navigate to the Leads page (including via direct URL/deep link) see a “Not authorized” message instead of lead data.
- Provide “Not authorized” actions/buttons that take non-admin users to “New Booking” and “Rate Card”.

**User-visible outcome:** Customers opening the shared link will only see New Booking and Rate Card; if they try to access Leads directly, they’ll see a clear “Not authorized” page with buttons to go to New Booking or Rate Card, while admins still have full Leads access.
