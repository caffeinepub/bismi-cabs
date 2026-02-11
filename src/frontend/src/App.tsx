import { useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import { LoginPage } from './pages/LoginPage';
import { BookingFormPage } from './pages/BookingFormPage';
import { LeadsPage } from './pages/LeadsPage';
import { RateCardPage } from './pages/RateCardPage';
import { AppShell } from './components/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';

type Page = 'login' | 'booking' | 'leads' | 'rateCard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const { identity } = useInternetIdentity();
  const actorState = useActor();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

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

  // Show error state if actor failed to initialize
  if (!actorState.actor && !actorState.isFetching) {
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
                Unable to connect to BISMI CABS. Please check your internet connection and try again.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-mono text-muted-foreground break-all">
                Failed to initialize backend connection
              </p>
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
    if (!isAuthenticated && currentPage !== 'login') {
      return <LoginPage onNavigate={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'booking':
        return <BookingFormPage />;
      case 'leads':
        return <LeadsPage onNavigate={setCurrentPage} />;
      case 'rateCard':
        return <RateCardPage />;
      case 'login':
      default:
        return <LoginPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AppShell>
  );
}

export default App;
