import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandLogo } from '@/components/BrandLogo';
import { ShareAppLinkCard } from '@/components/ShareAppLinkCard';
import { LogIn, Loader2, Phone, FileText, ClipboardList, DollarSign, User } from 'lucide-react';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { isCustomerMode, isOwnerMode } from '../utils/appMode';

interface LoginPageProps {
  onNavigate: (page: 'login' | 'booking' | 'leads' | 'rateCard' | 'profile') => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { identity, login, isLoggingIn, loginStatus } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const customerMode = isCustomerMode();
  const ownerMode = isOwnerMode();

  // Owner mode: auto-navigate to leads after authentication
  useEffect(() => {
    if (ownerMode && isAuthenticated && !isAdminLoading) {
      onNavigate('leads');
    }
  }, [ownerMode, isAuthenticated, isAdminLoading, onNavigate]);

  // Show leads button only for admins in owner mode
  const showLeadsButton = isAuthenticated && !isAdminLoading && isAdmin === true && ownerMode;
  
  // Show booking button only in customer mode
  const showBookingButton = customerMode;

  // Show profile button only in owner mode (hide in customer mode)
  const showProfileButton = ownerMode;

  return (
    <div className="flex items-center justify-center p-4 min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-2xl border-border/50">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="flex justify-center">
              <BrandLogo variant="wide" className="h-20 sm:h-24 w-auto max-w-full" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl font-bold">Welcome</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {ownerMode && !isAuthenticated
                  ? 'Owner access requires Internet Identity sign-in'
                  : isAuthenticated
                  ? 'You are successfully logged in'
                  : 'Sign in to access your BISMI CABS account'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-accent/20 border border-accent/30 p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">Authenticated Identity</p>
                  <p className="text-xs font-mono text-muted-foreground break-all bg-background/50 p-2 rounded">
                    {identity.getPrincipal().toString()}
                  </p>
                </div>

                <div className="space-y-3">
                  {showBookingButton && (
                    <Button onClick={() => onNavigate('booking')} className="w-full" size="lg">
                      <FileText className="mr-2 h-5 w-5" />
                      Create New Booking
                    </Button>
                  )}

                  {showLeadsButton && (
                    <Button onClick={() => onNavigate('leads')} className="w-full" size="lg">
                      <ClipboardList className="mr-2 h-5 w-5" />
                      View All Leads
                    </Button>
                  )}

                  <Button onClick={() => onNavigate('rateCard')} variant="outline" className="w-full" size="lg">
                    <DollarSign className="mr-2 h-5 w-5" />
                    View Rate Card
                  </Button>

                  {showProfileButton && (
                    <Button onClick={() => onNavigate('profile')} variant="outline" className="w-full" size="lg">
                      <User className="mr-2 h-5 w-5" />
                      Profile
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {ownerMode
                      ? 'The Owner Link is restricted to administrators and authorized staff. Sign in with Internet Identity to verify your access.'
                      : 'Sign in securely with Internet Identity to book rides and manage your trips.'}
                  </p>
                </div>

                <Button onClick={login} disabled={isLoggingIn} className="w-full" size="lg">
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Sign in with Internet Identity
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6 border-t">
            <div className="w-full space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <p className="text-sm">
                  Need help? Call us at{' '}
                  <a href="tel:9500344749" className="font-semibold text-primary hover:underline">
                    9500344749
                  </a>
                </p>
              </div>
            </div>
          </CardFooter>
        </Card>

        {!isAuthenticated && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Share BISMI CABS</CardTitle>
              <CardDescription>Share booking and admin links</CardDescription>
            </CardHeader>
            <CardContent>
              <ShareAppLinkCard />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
