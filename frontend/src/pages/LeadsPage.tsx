import { useEffect, useRef, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetBookingLeads, useIsCallerAdmin, useIsCallerAuthorizedForOwnerLeads } from '../hooks/useQueries';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { isOwnerMode } from '../utils/appMode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, LogIn, Phone, MapPin, Calendar, FileText, Volume2, User, Bell, BellOff, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { OwnerNotAuthorizedCard } from '@/components/OwnerNotAuthorizedCard';

interface LeadsPageProps {
  onNavigate?: (page: 'login' | 'booking' | 'leads' | 'rateCard') => void;
}

const POLLING_INTERVAL = 10000; // 10 seconds
const LAST_SEEN_LEAD_KEY = 'lastSeenLeadId';
const NOTIFICATION_SOUND_ENABLED_KEY = 'notificationSoundEnabled';

export function LeadsPage({ onNavigate }: LeadsPageProps) {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: isAuthorized, isLoading: isAuthorizationLoading, isFetched: isAuthorizationFetched } = useIsCallerAuthorizedForOwnerLeads();
  
  // Determine if we should enable polling (owner mode + admin only, not staff)
  const shouldPoll = isOwnerMode() && isAdmin === true;
  const pollingInterval = shouldPoll ? POLLING_INTERVAL : undefined;
  
  const { data: leads, isLoading, isError, error } = useGetBookingLeads(isAuthorized === true, pollingInterval);
  
  const [lastSeenLeadId, setLastSeenLeadId] = useLocalStorage<number>(LAST_SEEN_LEAD_KEY, -1);
  const [notificationEnabled, setNotificationEnabled] = useLocalStorage<boolean>(NOTIFICATION_SOUND_ENABLED_KEY, false);
  const [audioReady, setAudioReady] = useState(false);
  const [copiedPrincipal, setCopiedPrincipal] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousLeadsRef = useRef<typeof leads>(undefined);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/assets/notification/new-booking.mp3');
      audio.preload = 'auto';
      
      // Handle audio load success
      audio.addEventListener('canplaythrough', () => {
        setAudioReady(true);
      });
      
      // Handle audio load error
      audio.addEventListener('error', (e) => {
        console.warn('Failed to load notification sound:', e);
        setAudioReady(false);
      });
      
      audioRef.current = audio;
      
      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, []);

  // Detect new leads and play notification sound
  useEffect(() => {
    if (!leads || !shouldPoll || !notificationEnabled || !audioReady) {
      previousLeadsRef.current = leads;
      return;
    }

    // Skip on first load
    if (previousLeadsRef.current === undefined) {
      previousLeadsRef.current = leads;
      
      // Update last seen lead ID to the latest on first load
      if (leads.length > 0) {
        const latestLeadId = Math.max(...leads.map(l => Number(l.leadId)));
        setLastSeenLeadId(latestLeadId);
      }
      return;
    }

    // Check if there are new leads
    if (leads.length > 0) {
      const latestLeadId = Math.max(...leads.map(l => Number(l.leadId)));
      
      if (latestLeadId > lastSeenLeadId) {
        // New lead detected - play sound
        playNotificationSound();
        setLastSeenLeadId(latestLeadId);
      }
    }

    previousLeadsRef.current = leads;
  }, [leads, shouldPoll, notificationEnabled, audioReady, lastSeenLeadId, setLastSeenLeadId]);

  const playNotificationSound = () => {
    if (audioRef.current && audioReady) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.warn('Failed to play notification sound:', error);
      });
    }
  };

  const handleTestSound = () => {
    if (!audioReady) {
      alert('Notification sound is not ready yet. Please wait a moment and try again.');
      return;
    }
    playNotificationSound();
  };

  const handleToggleNotification = (checked: boolean) => {
    setNotificationEnabled(checked);
    
    // If enabling for the first time, update last seen lead to prevent immediate notification
    if (checked && leads && leads.length > 0) {
      const latestLeadId = Math.max(...leads.map(l => Number(l.leadId)));
      setLastSeenLeadId(latestLeadId);
    }
  };

  const handleCopyPrincipal = async (principal: string) => {
    try {
      await navigator.clipboard.writeText(principal);
      setCopiedPrincipal(principal);
      setTimeout(() => setCopiedPrincipal(null), 2000);
    } catch (err) {
      console.error('Failed to copy principal:', err);
    }
  };

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

  const truncatePrincipal = (principal: string, maxLength: number = 20) => {
    if (principal.length <= maxLength) return principal;
    return `${principal.slice(0, maxLength)}...`;
  };

  // Owner mode: require authentication
  if (isOwnerMode() && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-12rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Owner Access Required</CardTitle>
            <CardDescription>
              The Owner Link is restricted to administrators and authorized staff. Please sign in with Internet Identity to continue.
            </CardDescription>
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

  // Show loading state while checking authorization status
  if (isAuthorizationLoading || isAdminLoading) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-12rem)]">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Checking permissions...</span>
        </div>
      </div>
    );
  }

  // Show not authorized message ONLY after authorization check is complete and user is definitively unauthorized
  if (isAuthorizationFetched && isAuthorized === false && identity) {
    return (
      <OwnerNotAuthorizedCard
        principalId={identity.getPrincipal().toString()}
        onNavigateToBooking={onNavigate ? () => onNavigate('booking') : undefined}
        onNavigateToRateCard={onNavigate ? () => onNavigate('rateCard') : undefined}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Booking Leads</CardTitle>
              <CardDescription>
                {leads && leads.length > 0
                  ? `${leads.length} booking ${leads.length === 1 ? 'request' : 'requests'} received`
                  : 'No booking requests yet'}
              </CardDescription>
            </div>

            {shouldPoll && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="notification-toggle"
                    checked={notificationEnabled}
                    onCheckedChange={handleToggleNotification}
                  />
                  <Label htmlFor="notification-toggle" className="cursor-pointer flex items-center gap-2">
                    {notificationEnabled ? (
                      <Bell className="h-4 w-4 text-primary" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Notifications</span>
                  </Label>
                </div>

                {notificationEnabled && audioReady && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestSound}
                    title="Test notification sound"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-muted-foreground">Loading booking leads...</span>
              </div>
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load booking leads: {error instanceof Error ? error.message : 'Unknown error'}
              </AlertDescription>
            </Alert>
          ) : !leads || leads.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-muted p-6">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Booking Leads Yet</h3>
              <p className="text-muted-foreground">
                New booking requests will appear here automatically.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold">Pickup</TableHead>
                      <TableHead className="font-semibold">Drop</TableHead>
                      <TableHead className="font-semibold">Pickup Date/Time</TableHead>
                      <TableHead className="font-semibold">Notes</TableHead>
                      <TableHead className="font-semibold">Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={Number(lead.leadId)} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold text-foreground flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              {lead.customerName}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5" />
                              <a href={`tel:${lead.customerPhone}`} className="hover:text-primary hover:underline">
                                {lead.customerPhone}
                              </a>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <span className="font-medium">Booked by:</span>
                              <button
                                onClick={() => handleCopyPrincipal(lead.createdBy.toString())}
                                className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                                title="Click to copy principal ID"
                              >
                                <span className="font-mono break-all max-w-[200px] truncate">
                                  {truncatePrincipal(lead.createdBy.toString(), 16)}
                                </span>
                                {copiedPrincipal === lead.createdBy.toString() ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{lead.pickupLocation}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{lead.dropLocation}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{formatDateTime(lead.pickupDateTime)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.notes ? (
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{lead.notes}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">No notes</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {formatTimestamp(lead.createdAt)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {leads.map((lead) => (
                  <Card key={Number(lead.leadId)} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            {lead.customerName}
                          </CardTitle>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5" />
                            <a href={`tel:${lead.customerPhone}`} className="hover:text-primary hover:underline">
                              {lead.customerPhone}
                            </a>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <span className="font-medium">Booked by:</span>
                            <button
                              onClick={() => handleCopyPrincipal(lead.createdBy.toString())}
                              className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                              title="Click to copy principal ID"
                            >
                              <span className="font-mono break-all max-w-[150px] truncate">
                                {truncatePrincipal(lead.createdBy.toString(), 12)}
                              </span>
                              {copiedPrincipal === lead.createdBy.toString() ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {formatTimestamp(lead.createdAt)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-xs font-medium text-muted-foreground mb-0.5">Pickup</div>
                            <div className="text-sm">{lead.pickupLocation}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-xs font-medium text-muted-foreground mb-0.5">Drop</div>
                            <div className="text-sm">{lead.dropLocation}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-xs font-medium text-muted-foreground mb-0.5">Pickup Date/Time</div>
                            <div className="text-sm">{formatDateTime(lead.pickupDateTime)}</div>
                          </div>
                        </div>
                        {lead.notes && (
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-xs font-medium text-muted-foreground mb-0.5">Notes</div>
                              <div className="text-sm">{lead.notes}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
