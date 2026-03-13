import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { useDeleteSiteAndWipeData } from '../hooks/useQueries';
import { mapBackendError } from '../utils/mapBackendError';

const CONFIRMATION_PHRASE = 'Yes, delete everything';

export function DeleteWebsiteCard() {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const deleteMutation = useDeleteSiteAndWipeData();

  const isConfirmationValid = confirmationInput.trim() === CONFIRMATION_PHRASE;

  const handleInitiateDelete = () => {
    if (!isConfirmationValid) return;
    setShowFinalConfirm(true);
    setError(null);
  };

  const handleFinalDelete = async () => {
    setError(null);
    setSuccess(false);

    try {
      await deleteMutation.mutateAsync();
      setSuccess(true);
      setConfirmationInput('');
      setShowFinalConfirm(false);
    } catch (err: any) {
      const mappedError = mapBackendError(err);
      console.error('Delete site error:', mappedError.rawError);
      
      // If the error indicates the site is already deleted, treat it as success
      if (
        mappedError.rawError.includes('Site has already been deleted') ||
        mappedError.rawError.includes('site has been deleted') ||
        mappedError.rawError.includes('no longer available')
      ) {
        setSuccess(true);
        setConfirmationInput('');
        setShowFinalConfirm(false);
      } else {
        setError(mappedError.userMessage);
        setShowFinalConfirm(false);
      }
    }
  };

  const handleCancel = () => {
    setShowFinalConfirm(false);
    setError(null);
  };

  if (success) {
    return (
      <Card className="border-success/50 bg-success/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <CardTitle className="text-lg">Website Deleted Successfully</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="border-success/50 bg-success/5">
            <AlertDescription className="text-sm">
              Your website has been permanently deleted. All data has been removed and this action cannot be undone.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg">Delete Website</CardTitle>
          </div>
          <CardDescription>
            Permanently delete this website and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Warning:</strong> This will permanently delete all booking leads, user profiles, rate cards, and settings. This action is irreversible.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type <span className="font-mono font-bold text-destructive">{CONFIRMATION_PHRASE}</span> to confirm
              </Label>
              <Input
                id="confirmation"
                type="text"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={CONFIRMATION_PHRASE}
                className="font-mono"
                disabled={deleteMutation.isPending}
              />
            </div>

            <Button
              onClick={handleInitiateDelete}
              disabled={!isConfirmationValid || deleteMutation.isPending}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Website
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showFinalConfirm} onOpenChange={setShowFinalConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This is your final confirmation. This action will permanently delete all data and cannot be undone.
              The website will be completely disabled and no longer accessible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Yes, Delete Forever
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
