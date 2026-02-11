import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { getCanonicalUrl, copyCanonicalUrlToClipboard } from '@/utils/canonicalUrl';

export function ShareAppLinkCard() {
  const [copied, setCopied] = useState(false);
  const canonicalUrl = getCanonicalUrl();

  const handleCopy = async () => {
    const success = await copyCanonicalUrlToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(canonicalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg">Share Your Website</CardTitle>
        <CardDescription>
          Copy this link to share with your customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg bg-background border border-border p-3">
          <p className="text-sm font-mono break-all text-foreground">
            {canonicalUrl}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            className="flex-1"
            variant={copied ? 'secondary' : 'default'}
          >
            {copied ? (
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
            onClick={handleOpenInNewTab}
            variant="outline"
            size="icon"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
