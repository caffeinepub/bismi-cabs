import { ReactNode } from 'react';
import { Home, DollarSign, ClipboardList, User } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { UserAvatar } from './UserAvatar';
import { isOwnerMode, isCustomerMode } from '../utils/appMode';
import { useIsCallerAuthorizedForOwnerLeads } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2 } from 'lucide-react';
import { ShareAppLinkCard } from './ShareAppLinkCard';

interface AppShellProps {
  children: ReactNode;
  onNavigate: (page: 'login' | 'booking' | 'leads' | 'rateCard' | 'profile') => void;
}

export function AppShell({ children, onNavigate }: AppShellProps) {
  const { identity } = useInternetIdentity();
  const { data: isAuthorized, isLoading: isAuthorizationLoading, isFetched: isAuthorizationFetched } = useIsCallerAuthorizedForOwnerLeads();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const ownerMode = isOwnerMode();
  const customerMode = isCustomerMode();

  // Show leads navigation only if:
  // 1. In owner mode
  // 2. User is authenticated
  // 3. Authorization check is complete (isFetched)
  // 4. User is authorized
  const showLeadsNav = ownerMode && isAuthenticated && isAuthorizationFetched && isAuthorized === true;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="square" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold text-foreground">BISMI CABS</h1>
              <p className="text-xs text-muted-foreground">Your Trusted Travel Partner</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Share BISMI CABS</DialogTitle>
                  <DialogDescription>
                    Share these links to let customers book rides or give admin access to authorized staff.
                  </DialogDescription>
                </DialogHeader>
                <ShareAppLinkCard />
              </DialogContent>
            </Dialog>

            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full">
                    <UserAvatar className="h-10 w-10" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate('profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-6">{children}</main>

      {/* Bottom Navigation (Mobile) - Only show in owner mode when authorized */}
      {showLeadsNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
          <div className="grid grid-cols-2 gap-1 p-2">
            <a
              href="/rate-card"
              className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <DollarSign className="h-5 w-5" />
              <span className="text-xs font-medium">Rates</span>
            </a>
            <a
              href="/leads"
              className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ClipboardList className="h-5 w-5" />
              <span className="text-xs font-medium">View Leads</span>
            </a>
          </div>
        </nav>
      )}

      {/* Desktop Navigation - Only show in owner mode when authorized */}
      {showLeadsNav && (
        <nav className="hidden md:block fixed bottom-0 left-0 right-0 z-40 bg-background border-t">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-2 py-3">
              <a
                href="/rate-card"
                className="flex items-center gap-2 py-2 px-4 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <DollarSign className="h-5 w-5" />
                <span className="text-sm font-medium">Rates</span>
              </a>
              <a
                href="/leads"
                className="flex items-center gap-2 py-2 px-4 rounded-lg transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ClipboardList className="h-5 w-5" />
                <span className="text-sm font-medium">View Leads</span>
              </a>
            </div>
          </div>
        </nav>
      )}

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BISMI CABS. Built with ❤️ using{' '}
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
    </div>
  );
}
