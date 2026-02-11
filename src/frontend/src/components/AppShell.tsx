import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { BrandLogo } from './BrandLogo';
import { Button } from '@/components/ui/button';
import { Phone, LogOut, FileText, ClipboardList, Home, DollarSign } from 'lucide-react';

type Page = 'login' | 'booking' | 'leads' | 'rateCard';

interface AppShellProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function AppShell({ children, currentPage, onNavigate }: AppShellProps) {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    onNavigate('login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="w-full border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <BrandLogo variant="square" className="h-10 w-10 sm:h-12 sm:w-12" />
            <div className="text-left">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">BISMI CABS</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Premium Transport Service</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <a
              href="tel:9500344749"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">9500344749</span>
            </a>

            {isAuthenticated && (
              <Button onClick={handleLogout} variant="ghost" size="sm" className="ml-2">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 sm:pb-6">{children}</main>

      {/* Bottom Navigation (Mobile) / Footer (Desktop) */}
      {isAuthenticated ? (
        <nav className="fixed bottom-0 left-0 right-0 sm:relative border-t border-border/40 backdrop-blur-sm bg-background/95 z-40">
          <div className="container mx-auto px-4">
            <div className="flex sm:hidden justify-around py-2">
              <button
                onClick={() => onNavigate('login')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'login'
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs font-medium">Home</span>
              </button>

              <button
                onClick={() => onNavigate('booking')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'booking'
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs font-medium">Book</span>
              </button>

              <button
                onClick={() => onNavigate('leads')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'leads'
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ClipboardList className="h-5 w-5" />
                <span className="text-xs font-medium">Leads</span>
              </button>

              <button
                onClick={() => onNavigate('rateCard')}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'rateCard'
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <DollarSign className="h-5 w-5" />
                <span className="text-xs font-medium">Rates</span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex justify-center gap-4 py-4">
              <Button
                onClick={() => onNavigate('login')}
                variant={currentPage === 'login' ? 'default' : 'ghost'}
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button
                onClick={() => onNavigate('booking')}
                variant={currentPage === 'booking' ? 'default' : 'ghost'}
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                New Booking
              </Button>
              <Button
                onClick={() => onNavigate('leads')}
                variant={currentPage === 'leads' ? 'default' : 'ghost'}
                size="sm"
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                View Leads
              </Button>
              <Button
                onClick={() => onNavigate('rateCard')}
                variant={currentPage === 'rateCard' ? 'default' : 'ghost'}
                size="sm"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Rate Card
              </Button>
            </div>
          </div>
        </nav>
      ) : (
        <footer className="w-full border-t border-border/40 backdrop-blur-sm bg-background/80 py-6">
          <div className="container mx-auto px-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BISMI CABS. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'bismi-cabs'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
