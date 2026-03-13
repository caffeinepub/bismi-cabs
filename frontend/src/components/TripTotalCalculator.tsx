import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPerKmRate, getDriverAllowance, getBillableDistance, getMinimumCoverage, VehicleType, TripType } from '@/utils/rates';
import { Calculator, Info } from 'lucide-react';

export function TripTotalCalculator() {
  const [vehicleType, setVehicleType] = useState<VehicleType>('SEDAN');
  const [tripType, setTripType] = useState<TripType>('oneWay');
  const [distance, setDistance] = useState<string>('');

  const distanceNum = parseFloat(distance) || 0;
  const perKmRate = getPerKmRate(vehicleType, tripType);
  const driverAllowance = getDriverAllowance(tripType);
  const minimumCoverage = getMinimumCoverage(tripType);
  const billableDistance = getBillableDistance(distanceNum, tripType);
  const distanceCost = billableDistance * perKmRate;
  const totalAmount = distanceCost + driverAllowance;

  const isUsingMinimum = distanceNum > 0 && distanceNum < minimumCoverage;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Trip Total Calculator
        </CardTitle>
        <CardDescription>
          Calculate your estimated trip cost
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select value={vehicleType} onValueChange={(value) => setVehicleType(value as VehicleType)}>
              <SelectTrigger id="vehicleType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEDAN">SEDAN</SelectItem>
                <SelectItem value="SUV">SUV</SelectItem>
                <SelectItem value="Innova">Innova</SelectItem>
                <SelectItem value="CRYSTA">CRYSTA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tripType">Trip Type</Label>
            <Select value={tripType} onValueChange={(value) => setTripType(value as TripType)}>
              <SelectTrigger id="tripType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oneWay">One-way drop</SelectItem>
                <SelectItem value="roundTrip">Round trip</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="distance">Distance (km)</Label>
            <Input
              id="distance"
              type="number"
              min="0"
              step="1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="Enter distance in km"
            />
          </div>
        </div>

        {/* Calculation Breakdown */}
        {distanceNum > 0 && (
          <div className="rounded-lg bg-background border border-border p-4 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Cost Breakdown
            </h3>
            <div className="space-y-2 text-sm">
              {isUsingMinimum && (
                <div className="flex items-start gap-2 pb-2 mb-2 border-b border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 -mx-4 px-4 py-2">
                  <Info className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Minimum {tripType === 'oneWay' ? 'one-way' : 'round trip'} coverage is {minimumCoverage} km. Billing for {billableDistance} km.
                  </p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Distance × Rate ({billableDistance} km × ₹{perKmRate})
                </span>
                <span className="font-medium">₹{distanceCost.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Driver allowance ({tripType === 'oneWay' ? 'one-way' : 'round trip'})</span>
                <span className="font-medium">₹{driverAllowance}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between items-center">
                <span className="font-semibold text-base">Total Amount</span>
                <span className="font-bold text-xl text-primary">₹{totalAmount.toFixed(0)}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 pt-2 border-t border-border/50">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Toll & tax excluded
              </p>
            </div>
          </div>
        )}

        {/* Example Calculation */}
        <div className="rounded-lg bg-muted/50 border border-border/50 p-4 space-y-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            Example Calculation
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Chennai to Pondicherry (One-way):</strong> 165 km × ₹14 = ₹2,310 + Driver allowance ₹400 = <strong>Total ₹2,710</strong> (toll & tax excluded)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
