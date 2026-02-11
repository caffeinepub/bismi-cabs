# Specification

## Summary
**Goal:** Correct the Trip Total Calculator so one-way trips use one-way minimum coverage/rates (not round-trip minimum coverage) when calculating totals.

**Planned changes:**
- Update `TripTotalCalculator` calculation logic to apply `MINIMUM_COVERAGE.oneWay` (and corresponding one-way rate/driver allowance) when Trip Type is "One-way drop".
- Ensure round trips continue to use `MINIMUM_COVERAGE.roundTrip` (and corresponding round-trip rate/driver allowance) with no cross-mixing between trip types.
- Make trip type switching immediately refresh the displayed/calculated rate, allowance, and billable distance consistently (frontend-only change).

**User-visible outcome:** When selecting "One-way drop" and entering 130 km, the calculator shows a total based on one-way pricing/minimum coverage; switching between one-way and round trip updates the total and inputs consistently.
