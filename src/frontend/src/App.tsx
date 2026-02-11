import { useState, useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useBackendActor } from './hooks/useBackendActor';
import { LoginPage } from './pages/LoginPage';
import { BookingFormPage } from './pages/BookingFormPage';
import { LeadsPage } from './pages/LeadsPage';
import { RateCardPage } from './pages/RateCardPage';
import { ProfilePage } from './pages/ProfilePage';
import { AppShell } from './components/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { isOwnerMode, isCustomerMode } from './utils/appMode';
import { mapBackendError } from './utils/mapBackendError';
import { getDeepLinkParameter } from './utils/urlParams';

type Page = 'login' | 'booking' | 'leads' | 'rateCard' | 'profile';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [initialPageSet, setInitialPageSet] = useState(false);
  const { identity } = useInternetIdentity();
  const actorState = useBackendActor();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const ownerMode = isOwnerMode();
  const customerMode = isCustomerMode();

  // Handle deep-link on initial load (customer mode only)
  useEffect(() => {
    if (!initialPageSet && customerMode) {
      const deepLinkPage = getDeepLinkParameter('page');
      if (deepLinkPage === 'booking') {
        setCurrentPage('booking');
      }
      setInitialPageSet(true);
    }
  }, [initialPageSet, customerMode]);

  // Owner mode: redirect to leads after authentication
  useEffect(() => {
    if (ownerMode && isAuthenticated && currentPage === 'login') {
      setCurrentPage('leads');
    }
  }, [ownerMode, isAuthenticated, currentPage]);

  // Redirect from booking to rate card if in owner mode
  useEffect(() => {
    if (ownerMode && currentPage === 'booking') {
      setCurrentPage('rateCard');
    }
  }, [ownerMode, currentPage]);

  // Customer mode guard: redirect away from profile page
  useEffect(() => {
    if (customerMode && currentPage === 'profile') {
      // If authenticated, go to booking; otherwise go to login
      setCurrentPage(isAuthenticated ? 'booking' : 'login');
    }
  }, [customerMode, currentPage, isAuthenticated]);

  // Show loading state while actor is initializing
  if (actorState.isFetching && !actorState.actor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Loading BISMI CABS</CardTitle>
              <CardDescription>
                Connecting to the network...
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show error state if actor failed to initialize (only for real errors, not anonymous users)
  if (actorState.isError && actorState.error && !actorState.actor) {
    const mappedError = mapBackendError(actorState.error);

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
        <Card className="w-full max-w-md shadow-2xl border-destructive/50">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Connection Error</CardTitle>
              <CardDescription>
                {mappedError.userMessage}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Collapsible technical details */}
            <div className="rounded-lg border border-muted overflow-hidden">
              <button
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-sm font-medium text-foreground">Technical Details</span>
                {showErrorDetails ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {showErrorDetails && (
                <div className="p-3 bg-muted/10">
                  <p className="text-xs font-mono text-muted-foreground break-all whitespace-pre-wrap">
                    {mappedError.rawError}
                  </p>
                </div>
              )}
            </div>

            <Button onClick={() => window.location.reload()} className="w-full" size="lg">
              <RefreshCw className="mr-2 h-5 w-5" />
              Retry Connection
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Need help? Call us at{' '}
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

  // Render page based on current route
  const renderPage = () => {
    // In customer mode, allow booking page without authentication
    if (customerMode && currentPage === 'booking') {
      return <BookingFormPage />;
    }

    // In owner mode, require authentication for all pages except login
    if (!isAuthenticated && currentPage !== 'login') {
      return <LoginPage onNavigate={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'booking':
        // Prevent booking page in owner mode
        if (ownerMode) {
          return <RateCardPage />;
        }
        return <BookingFormPage />;
      case 'leads':
        return <LeadsPage onNavigate={setCurrentPage} />;
      case 'rateCard':
        return <RateCardPage />;
      case 'profile':
        // Prevent profile page in customer mode
        if (customerMode) {
          return isAuthenticated ? <BookingFormPage /> : <LoginPage onNavigate={setCurrentPage} />;
        }
        return <ProfilePage />;
      case 'login':
      default:
        return <LoginPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AppShell onNavigate={setCurrentPage}>
      {renderPage()}
    </AppShell>
  );
}

export default App;
