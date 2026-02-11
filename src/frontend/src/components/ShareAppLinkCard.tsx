import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { getCanonicalUrl, copyCanonicalUrlToClipboard } from '@/utils/canonicalUrl';

export function ShareAppLinkCard() {
  const [copiedCustomer, setCopiedCustomer] = useState(false);
  const [copiedOwner, setCopiedOwner] = useState(false);
  
  const customerUrl = getCanonicalUrl('customer', 'booking');
  const ownerUrl = getCanonicalUrl('owner');

  const handleCopyCustomer = async () => {
    const success = await copyCanonicalUrlToClipboard('customer', 'booking');
    if (success) {
      setCopiedCustomer(true);
      setTimeout(() => setCopiedCustomer(false), 2000);
    }
  };

  const handleCopyOwner = async () => {
    const success = await copyCanonicalUrlToClipboard('owner');
    if (success) {
      setCopiedOwner(true);
      setTimeout(() => setCopiedOwner(false), 2000);
    }
  };

  const handleOpenCustomer = () => {
    window.open(customerUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenOwner = () => {
    window.open(ownerUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg">Share Your Website</CardTitle>
        <CardDescription>
          Two different links: one for customers and one for administrators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Link */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Customer Link</h3>
          <p className="text-xs text-muted-foreground">
            Share this link with your customers to allow them to create bookings directly without login.
          </p>
          <div className="rounded-lg bg-background border border-border p-3">
            <p className="text-sm font-mono break-all text-foreground">
              {customerUrl}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCopyCustomer}
              className="flex-1"
              variant={copiedCustomer ? 'secondary' : 'default'}
              size="sm"
            >
              {copiedCustomer ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
            
            <Button
              onClick={handleOpenCustomer}
              variant="outline"
              size="sm"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Open</span>
            </Button>
          </div>
        </div>

        {/* Owner Link */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Owner Link (Admin Only)</h3>
          <p className="text-xs text-muted-foreground">
            This link is for administrators and authorized staff only. Requires Internet Identity sign-in to access leads and admin features.
          </p>
          <div className="rounded-lg bg-background border border-border p-3">
            <p className="text-sm font-mono break-all text-foreground">
              {ownerUrl}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCopyOwner}
              className="flex-1"
              variant={copiedOwner ? 'secondary' : 'default'}
              size="sm"
            >
              {copiedOwner ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
            
            <Button
              onClick={handleOpenOwner}
              variant="outline"
              size="sm"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Open</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
