import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandLogo } from '@/components/BrandLogo';
import { LogIn, Loader2, Phone, FileText, ClipboardList } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: 'login' | 'booking' | 'leads') => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { identity, login, isLoggingIn, loginStatus } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return (
    <div className="flex items-center justify-center p-4 min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-md shadow-2xl border-border/50">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center">
            <BrandLogo variant="wide" className="h-20 sm:h-24 w-auto max-w-full" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold">Welcome</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {isAuthenticated
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
                <Button onClick={() => onNavigate('booking')} className="w-full" size="lg">
                  <FileText className="mr-2 h-5 w-5" />
                  Create New Booking
                </Button>

                <Button onClick={() => onNavigate('leads')} variant="outline" className="w-full" size="lg">
                  <ClipboardList className="mr-2 h-5 w-5" />
                  View All Leads
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Sign in securely using Internet Identity. No passwords needed.
                </p>
              </div>

              <Button
                onClick={login}
                disabled={isLoggingIn || loginStatus === 'initializing'}
                className="w-full"
                size="lg"
              >
                {isLoggingIn || loginStatus === 'initializing' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {loginStatus === 'initializing' ? 'Initializing...' : 'Signing in...'}
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

        <CardFooter className="flex flex-col gap-4 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>24/7 Support: </span>
            <a href="tel:9500344749" className="font-semibold text-primary hover:underline">
              9500344749
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
