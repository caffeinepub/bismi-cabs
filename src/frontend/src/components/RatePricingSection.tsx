import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function RatePricingSection() {
  const vehicleRates = [
    { vehicle: 'SEDAN', oneWay: 14, roundTrip: 12 },
    { vehicle: 'SUV', oneWay: 19, roundTrip: 18 },
    { vehicle: 'Innova', oneWay: 20, roundTrip: 19 },
    { vehicle: 'CRYSTA', oneWay: 22, roundTrip: 20 },
  ];

  const additionalInfo = [
    { label: 'Driver allowance', oneWay: '₹400', roundTrip: '₹500' },
    { label: 'Minimum coverage', oneWay: '130 km', roundTrip: '250 km' },
  ];

  const localTransferRates = [
    { vehicle: 'SEDAN', minimumKm: 20, basePrice: 600, extraPerKm: 25 },
    { vehicle: 'SUV', minimumKm: 20, basePrice: 900, extraPerKm: 38 },
    { vehicle: 'Innova', minimumKm: 20, basePrice: 1000, extraPerKm: 40 },
    { vehicle: 'CRYSTA', minimumKm: 50, basePrice: 2250, extraPerKm: 45 },
  ];

  const rentalRates = [
    { vehicle: 'SEDAN', hours: 5, km: 50, basePrice: 1500, extraPerHour: 280, extraPerKm: 25 },
    { vehicle: 'SUV', hours: 5, km: 50, basePrice: 1900, extraPerHour: 400, extraPerKm: 38 },
    { vehicle: 'Innova', hours: 5, km: 50, basePrice: 2200, extraPerHour: 400, extraPerKm: 40 },
    { vehicle: 'CRYSTA', hours: 5, km: 50, basePrice: 2500, extraPerHour: 450, extraPerKm: 45 },
  ];

  return (
    <div className="space-y-6">
      {/* Current Pricing (One-way/Round-trip) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Current Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vehicle Rates Table - Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Vehicle Type</TableHead>
                  <TableHead className="font-semibold text-right">One-way drop (per km)</TableHead>
                  <TableHead className="font-semibold text-right">Round trip (per km)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleRates.map((rate) => (
                  <TableRow key={rate.vehicle}>
                    <TableCell className="font-medium">{rate.vehicle}</TableCell>
                    <TableCell className="text-right">₹{rate.oneWay}</TableCell>
                    <TableCell className="text-right">₹{rate.roundTrip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Vehicle Rates Cards - Mobile */}
          <div className="md:hidden space-y-3">
            {vehicleRates.map((rate) => (
              <div key={rate.vehicle} className="rounded-lg border border-border bg-card p-4 space-y-2">
                <h3 className="font-semibold text-base">{rate.vehicle}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">One-way drop</p>
                    <p className="font-medium text-lg">₹{rate.oneWay}/km</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Round trip</p>
                    <p className="font-medium text-lg">₹{rate.roundTrip}/km</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="pt-4 border-t border-border/50">
            <h3 className="font-semibold text-base mb-3">Additional Information</h3>
            
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Details</TableHead>
                    <TableHead className="font-semibold text-right">One-way drop</TableHead>
                    <TableHead className="font-semibold text-right">Round trip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {additionalInfo.map((info) => (
                    <TableRow key={info.label}>
                      <TableCell className="font-medium">{info.label}</TableCell>
                      <TableCell className="text-right">{info.oneWay}</TableCell>
                      <TableCell className="text-right">{info.roundTrip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {additionalInfo.map((info) => (
                <div key={info.label} className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                  <h4 className="font-medium text-sm">{info.label}</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">One-way drop</p>
                      <p className="font-medium">{info.oneWay}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Round trip</p>
                      <p className="font-medium">{info.roundTrip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Local Transfer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Local Transfer</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Vehicle Type</TableHead>
                  <TableHead className="font-semibold text-right">Minimum Distance</TableHead>
                  <TableHead className="font-semibold text-right">Base Price</TableHead>
                  <TableHead className="font-semibold text-right">Extra per km</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localTransferRates.map((rate) => (
                  <TableRow key={rate.vehicle}>
                    <TableCell className="font-medium">{rate.vehicle}</TableCell>
                    <TableCell className="text-right">{rate.minimumKm} km</TableCell>
                    <TableCell className="text-right">₹{rate.basePrice}</TableCell>
                    <TableCell className="text-right">₹{rate.extraPerKm}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {localTransferRates.map((rate) => (
              <div key={rate.vehicle} className="rounded-lg border border-border bg-card p-4 space-y-3">
                <h3 className="font-semibold text-base">{rate.vehicle}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Minimum Distance</p>
                    <p className="font-medium">{rate.minimumKm} km</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Base Price</p>
                    <p className="font-medium text-lg">₹{rate.basePrice}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Extra per km</p>
                    <p className="font-medium">₹{rate.extraPerKm}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rental Rate Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Rental Rate Card</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Vehicle Type</TableHead>
                  <TableHead className="font-semibold text-right">Package</TableHead>
                  <TableHead className="font-semibold text-right">Base Price</TableHead>
                  <TableHead className="font-semibold text-right">Extra per hour</TableHead>
                  <TableHead className="font-semibold text-right">Extra per km</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rentalRates.map((rate) => (
                  <TableRow key={rate.vehicle}>
                    <TableCell className="font-medium">{rate.vehicle}</TableCell>
                    <TableCell className="text-right">{rate.hours} hr / {rate.km} km</TableCell>
                    <TableCell className="text-right">₹{rate.basePrice}</TableCell>
                    <TableCell className="text-right">₹{rate.extraPerHour}</TableCell>
                    <TableCell className="text-right">₹{rate.extraPerKm}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {rentalRates.map((rate) => (
              <div key={rate.vehicle} className="rounded-lg border border-border bg-card p-4 space-y-3">
                <h3 className="font-semibold text-base">{rate.vehicle}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Package</span>
                    <span className="font-medium">{rate.hours} hr / {rate.km} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Price</span>
                    <span className="font-medium text-lg">₹{rate.basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Extra per hour</span>
                    <span className="font-medium">₹{rate.extraPerHour}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Extra per km</span>
                    <span className="font-medium">₹{rate.extraPerKm}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
