import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetBookingLeads, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, LogIn, Phone, MapPin, Calendar, FileText, ShieldAlert, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeadsPageProps {
  onNavigate?: (page: 'login' | 'booking' | 'leads' | 'rateCard') => void;
}

export function LeadsPage({ onNavigate }: LeadsPageProps) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: leads, isLoading, isError, error } = useGetBookingLeads(isAdmin === true);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateTimeStr;
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    try {
      const date = new Date(Number(timestamp) / 1_000_000);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-12rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view booking leads</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while checking admin status
  if (isAdminLoading) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-12rem)]">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Checking permissions...</span>
        </div>
      </div>
    );
  }

  // Show not authorized message for non-admin users
  if (isAdmin === false) {
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
                You don't have permission to view booking leads. This page is only accessible to administrators.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => onNavigate?.('booking')}
              className="w-full"
              size="lg"
            >
              <FileText className="mr-2 h-5 w-5" />
              New Booking
            </Button>
            <Button
              onClick={() => onNavigate?.('rateCard')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <DollarSign className="mr-2 h-5 w-5" />
              Rate Card
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Booking Leads</CardTitle>
          <CardDescription>View and manage all customer booking requests</CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading leads...</span>
            </div>
          )}

          {isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load leads. Please try again.
                {error instanceof Error && `: ${error.message}`}
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !isError && leads && leads.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">No booking leads yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first booking to see it appear here
              </p>
            </div>
          )}

          {!isLoading && !isError && leads && leads.length > 0 && (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-4">
                {leads.map((lead) => (
                  <Card key={lead.leadId.toString()} className="border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{lead.customerName}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {lead.customerPhone}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">#{lead.leadId.toString()}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Pickup:</p>
                          <p className="text-muted-foreground">{lead.pickupLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Drop:</p>
                          <p className="text-muted-foreground">{lead.dropLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Pickup Time:</p>
                          <p className="text-muted-foreground">{formatDateTime(lead.pickupDateTime)}</p>
                        </div>
                      </div>
                      {lead.notes && (
                        <div className="pt-2 border-t border-border/50">
                          <p className="font-medium mb-1">Notes:</p>
                          <p className="text-muted-foreground">{lead.notes}</p>
                        </div>
                      )}
                      <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground">
                        Created: {formatTimestamp(lead.createdAt)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Lead ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Pickup Location</TableHead>
                      <TableHead>Drop Location</TableHead>
                      <TableHead>Pickup Time</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.leadId.toString()}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">#{lead.leadId.toString()}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{lead.customerName}</TableCell>
                        <TableCell>
                          <a
                            href={`tel:${lead.customerPhone}`}
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            {lead.customerPhone}
                          </a>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                            <span className="truncate">{lead.pickupLocation}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                            <span className="truncate">{lead.dropLocation}</span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-accent" />
                            {formatDateTime(lead.pickupDateTime)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          {lead.notes ? (
                            <span className="text-sm text-muted-foreground truncate block">
                              {lead.notes}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">No notes</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(lead.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
