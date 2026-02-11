# Specification

## Summary
**Goal:** Ensure each user’s uploaded profile photo (display picture) remains permanently available across app reloads and backend canister upgrades, and clearly communicate this in the Profile UI.

**Planned changes:**
- Persist user profile data (including the uploaded display picture reference) in stable storage on the backend so it survives canister upgrades/redeploys.
- Update the Profile page’s post-upload success message (English) to explicitly state the display picture is saved permanently and will be available next time the user signs in.

**User-visible outcome:** After uploading a display picture, users continue to see the same photo after reloading the app and even after backend upgrades; the Profile page confirms the photo is saved permanently.
