import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateBookingLead } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { TripTotalCalculator } from '@/components/TripTotalCalculator';
import { isCustomerMode } from '../utils/appMode';

export function BookingFormPage() {
  const { identity } = useInternetIdentity();
  const createLead = useCreateBookingLead();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const customerMode = isCustomerMode();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    pickupLocation: '',
    dropLocation: '',
    pickupDateTime: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.customerPhone.replace(/\s/g, ''))) {
      newErrors.customerPhone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.pickupLocation.trim()) {
      newErrors.pickupLocation = 'Pickup location is required';
    }

    if (!formData.dropLocation.trim()) {
      newErrors.dropLocation = 'Drop location is required';
    }

    if (!formData.pickupDateTime) {
      newErrors.pickupDateTime = 'Pickup date and time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createLead.mutateAsync({
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        pickupLocation: formData.pickupLocation.trim(),
        dropLocation: formData.dropLocation.trim(),
        pickupDateTime: formData.pickupDateTime,
        notes: formData.notes.trim() || null,
      });

      setShowSuccess(true);
      setFormData({
        customerName: '',
        customerPhone: '',
        pickupLocation: '',
        dropLocation: '',
        pickupDateTime: '',
        notes: '',
      });
      setErrors({});

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">New Booking</CardTitle>
            <CardDescription>
              {customerMode && !isAuthenticated 
                ? 'Fill in the details to create a booking request'
                : 'Fill in the details to create a new booking lead'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {showSuccess && (
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Booking created successfully! We'll contact you soon at the provided phone number.
                  </AlertDescription>
                </Alert>
              )}

              {createLead.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to create booking. Please try again.
                    {createLead.error instanceof Error && `: ${createLead.error.message}`}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="customerName">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  placeholder="Enter customer name"
                  className={errors.customerName ? 'border-destructive' : ''}
                />
                {errors.customerName && <p className="text-sm text-destructive">{errors.customerName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleChange('customerPhone', e.target.value)}
                  placeholder="9500344749"
                  className={errors.customerPhone ? 'border-destructive' : ''}
                />
                {errors.customerPhone && <p className="text-sm text-destructive">{errors.customerPhone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupLocation">
                  Pickup Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={(e) => handleChange('pickupLocation', e.target.value)}
                  placeholder="Enter pickup address"
                  className={errors.pickupLocation ? 'border-destructive' : ''}
                />
                {errors.pickupLocation && <p className="text-sm text-destructive">{errors.pickupLocation}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dropLocation">
                  Drop Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dropLocation"
                  value={formData.dropLocation}
                  onChange={(e) => handleChange('dropLocation', e.target.value)}
                  placeholder="Enter drop address"
                  className={errors.dropLocation ? 'border-destructive' : ''}
                />
                {errors.dropLocation && <p className="text-sm text-destructive">{errors.dropLocation}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupDateTime">
                  Pickup Date & Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pickupDateTime"
                  type="datetime-local"
                  value={formData.pickupDateTime}
                  onChange={(e) => handleChange('pickupDateTime', e.target.value)}
                  className={errors.pickupDateTime ? 'border-destructive' : ''}
                />
                {errors.pickupDateTime && <p className="text-sm text-destructive">{errors.pickupDateTime}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any special requirements or notes"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={createLead.isPending}>
                {createLead.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Booking...
                  </>
                ) : (
                  'Create Booking'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Trip Total Calculator */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <TripTotalCalculator />
        </div>
      </div>
    </div>
  );
}
