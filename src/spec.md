# Specification

## Summary
**Goal:** Expand the Rate Card pricing display to include Local Transfer and Rental Rate Card tables while keeping the existing One-way/Round-trip pricing and Additional Information visible and unchanged in meaning.

**Planned changes:**
- Update `frontend/src/components/RatePricingSection.tsx` to add a new **Local Transfer** pricing section with vehicle-wise minimum distance, base price, and extra per-km pricing (English labels).
- Update `frontend/src/components/RatePricingSection.tsx` to add a new **Rental Rate Card** pricing section with vehicle-wise package (5 hr / 50 km), base price, extra per-hour, and extra per-km pricing (English labels).
- Ensure the new sections follow the existing responsive layout patterns (mobile/desktop) without horizontal overflow and do not affect the existing Rate Card download/upload UI on `frontend/src/pages/RateCardPage.tsx`.

**User-visible outcome:** On the Rate Card page, users can view the existing current per-km pricing and additional info as before, plus clearly labeled Local Transfer and Rental Rate Card pricing tables with the provided values, usable on both mobile and desktop.
