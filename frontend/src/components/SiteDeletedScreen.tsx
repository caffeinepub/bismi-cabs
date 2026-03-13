import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export function SiteDeletedScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-destructive/5">
      <Card className="w-full max-w-md shadow-2xl border-destructive/50">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <BrandLogo variant="square" className="h-16 w-16 opacity-50" />
          </div>
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Website Deleted</CardTitle>
            <CardDescription className="text-base">
              This website has been permanently deleted and is no longer available.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-muted-foreground text-center">
              All data has been permanently removed. This action is irreversible.
            </p>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Need help? Contact support at{' '}
              <a href="tel:9500344749" className="font-semibold text-primary hover:underline">
                9500344749
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
