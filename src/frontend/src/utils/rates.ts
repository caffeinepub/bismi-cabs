/**
 * Centralized rate constants for BISMI CABS
 * Used across Rate Card display and Trip Total Calculator
 */

export type VehicleType = 'SEDAN' | 'SUV' | 'Innova' | 'CRYSTA';
export type TripType = 'oneWay' | 'roundTrip';

export interface VehicleRate {
  vehicle: VehicleType;
  oneWay: number;
  roundTrip: number;
}

export interface HourlyRate {
  vehicle: VehicleType;
  perHour: number;
}

// Per-kilometer rates for one-way and round-trip
export const VEHICLE_RATES: VehicleRate[] = [
  { vehicle: 'SEDAN', oneWay: 14, roundTrip: 12 },
  { vehicle: 'SUV', oneWay: 19, roundTrip: 18 },
  { vehicle: 'Innova', oneWay: 20, roundTrip: 19 },
  { vehicle: 'CRYSTA', oneWay: 22, roundTrip: 20 },
];

// Hourly rates
export const HOURLY_RATES: HourlyRate[] = [
  { vehicle: 'SEDAN', perHour: 150 },
  { vehicle: 'SUV', perHour: 200 },
  { vehicle: 'Innova', perHour: 250 },
  { vehicle: 'CRYSTA', perHour: 450 },
];

// Driver allowances
export const DRIVER_ALLOWANCE = {
  oneWay: 400,
  roundTrip: 500,
};

// Minimum coverage
export const MINIMUM_COVERAGE = {
  oneWay: 130,
  roundTrip: 250,
};

// Helper function to get per-km rate for a vehicle and trip type
export function getPerKmRate(vehicle: VehicleType, tripType: TripType): number {
  const rate = VEHICLE_RATES.find((r) => r.vehicle === vehicle);
  if (!rate) return 0;
  return tripType === 'oneWay' ? rate.oneWay : rate.roundTrip;
}

// Helper function to get driver allowance for trip type
export function getDriverAllowance(tripType: TripType): number {
  return tripType === 'oneWay' ? DRIVER_ALLOWANCE.oneWay : DRIVER_ALLOWANCE.roundTrip;
}

// Helper function to get hourly rate for a vehicle
export function getHourlyRate(vehicle: VehicleType): number {
  const rate = HOURLY_RATES.find((r) => r.vehicle === vehicle);
  return rate ? rate.perHour : 0;
}

// Helper function to get minimum coverage for trip type
export function getMinimumCoverage(tripType: TripType): number {
  return tripType === 'oneWay' ? MINIMUM_COVERAGE.oneWay : MINIMUM_COVERAGE.roundTrip;
}

// Helper function to calculate billable distance (applies minimum coverage)
export function getBillableDistance(actualDistance: number, tripType: TripType): number {
  const minimumCoverage = getMinimumCoverage(tripType);
  return Math.max(actualDistance, minimumCoverage);
}
