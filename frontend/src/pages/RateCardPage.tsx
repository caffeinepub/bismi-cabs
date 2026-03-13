import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetLatestRateCard, useUploadRateCard, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Download, FileText, AlertCircle, LogIn, CheckCircle2 } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { downloadFile } from '../utils/download';
import { RatePricingSection } from '../components/RatePricingSection';

export function RateCardPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: rateCard, isLoading: isLoadingRateCard, error: rateCardError } = useGetLatestRateCard();
  const { data: isAdmin, isLoading: isLoadingAdmin } = useIsCallerAdmin();
  const uploadMutation = useUploadRateCard();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !isAuthenticated) return;

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await uploadMutation.mutateAsync({
        file: blob,
        originalFileName: selectedFile.name,
        contentType: selectedFile.type || 'application/octet-stream',
      });

      setSelectedFile(null);
      setUploadProgress(0);
      // Reset file input
      const fileInput = document.getElementById('rateCardFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(0);
    }
  };

  const handleDownload = async () => {
    if (!rateCard) return;

    setIsDownloading(true);
    try {
      const bytes = await rateCard.file.getBytes();
      downloadFile(bytes, rateCard.originalFileName, rateCard.contentType);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-12rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view the rate card</CardDescription>
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

  const isLoading = isLoadingRateCard || isLoadingAdmin;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      {/* Pricing Section */}
      <RatePricingSection />

      {/* Rate Card Download/Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Rate Card Document</CardTitle>
          <CardDescription>Download the detailed rate card document</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && rateCardError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load rate card. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !rateCardError && !rateCard && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                No rate card document has been uploaded yet. {isAdmin && 'Upload one below to get started.'}
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && rateCard && (
            <div className="space-y-4">
              <div className="rounded-lg bg-accent/20 border border-accent/30 p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium text-foreground">Current Rate Card</p>
                    <p className="text-sm text-muted-foreground break-all">{rateCard.originalFileName}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded on {new Date(Number(rateCard.uploadedAt) / 1000000).toLocaleString()}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                </div>

                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full"
                  size="lg"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Download Rate Card
                    </>
                  )}
                </Button>
              </div>

              {uploadMutation.isSuccess && (
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Rate card uploaded successfully!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {!isLoading && isAdmin && (
            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="space-y-2">
                <Label htmlFor="rateCardFile" className="text-base font-semibold">
                  Upload New Rate Card
                </Label>
                <p className="text-sm text-muted-foreground">
                  {rateCard ? 'Replace the current rate card with a new file' : 'Upload the first rate card'}
                </p>
              </div>

              {uploadMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to upload rate card. Please try again.
                    {uploadMutation.error instanceof Error && `: ${uploadMutation.error.message}`}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Input
                  id="rateCardFile"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  disabled={uploadMutation.isPending}
                />

                {selectedFile && (
                  <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                    <p className="text-sm font-medium">Selected file:</p>
                    <p className="text-sm text-muted-foreground break-all">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Size: {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                )}

                {uploadMutation.isPending && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Upload Rate Card
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
