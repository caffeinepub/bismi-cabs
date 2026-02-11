import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, FileText, DollarSign, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface OwnerNotAuthorizedCardProps {
  principalId: string;
  onNavigateToBooking?: () => void;
  onNavigateToRateCard?: () => void;
}

export function OwnerNotAuthorizedCard({
  principalId,
  onNavigateToBooking,
  onNavigateToRateCard,
}: OwnerNotAuthorizedCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPrincipal = async () => {
    try {
      await navigator.clipboard.writeText(principalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy principal:', error);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-md shadow-xl border-destructive/30">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Not Authorized</CardTitle>
            <CardDescription>
              The Owner Link is restricted to administrators and authorized staff only. You don't have permission to view booking leads.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Your Principal ID</p>
              <Button
                onClick={handleCopyPrincipal}
                variant="ghost"
                size="sm"
                className="h-8 px-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs font-mono text-muted-foreground break-all bg-background/50 p-2 rounded">
              {principalId}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Share this Principal ID with an administrator to request access.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {onNavigateToBooking && (
              <Button
                onClick={onNavigateToBooking}
                className="w-full"
                size="lg"
              >
                <FileText className="mr-2 h-5 w-5" />
                New Booking
              </Button>
            )}
            {onNavigateToRateCard && (
              <Button
                onClick={onNavigateToRateCard}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <DollarSign className="mr-2 h-5 w-5" />
                Rate Card
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
