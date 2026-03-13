import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useGetCallerUserProfile, useUploadDp, useInitializeCallerProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { Upload, Loader2, CheckCircle2, AlertCircle, UserPlus, Copy, ExternalLink, Share2, Check } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { DeleteWebsiteCard } from '../components/DeleteWebsiteCard';
import { mapBackendError } from '../utils/mapBackendError';
import { getCanonicalUrl, copyCanonicalUrlToClipboard } from '../utils/canonicalUrl';
import { isOwnerMode, isCustomerMode } from '../utils/appMode';

export function ProfilePage() {
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: isAdminLoading, isFetched: isAdminFetched } = useIsCallerAdmin();
  const uploadDpMutation = useUploadDp();
  const initializeProfileMutation = useInitializeCallerProfile();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [copiedPhotoUrl, setCopiedPhotoUrl] = useState(false);
  const [copiedProfileLink, setCopiedProfileLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasNoProfile = isFetched && userProfile === null;
  const hasDisplayPicture = userProfile?.dp !== undefined && userProfile?.dp !== null;
  const photoDirectUrl = hasDisplayPicture ? userProfile.dp!.getDirectURL() : null;

  const ownerMode = isOwnerMode();
  const customerMode = isCustomerMode();
  const currentMode = ownerMode ? 'owner' : 'customer';
  const profilePageUrl = getCanonicalUrl(currentMode, 'profile');

  const canShare = typeof navigator !== 'undefined' && navigator.share !== undefined;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a PNG or JPEG image file.');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 5MB.');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInitializeProfile = async () => {
    setError(null);
    setSuccess(false);

    try {
      await initializeProfileMutation.mutateAsync('User');
      // Profile is now initialized, user can proceed with upload
    } catch (err: any) {
      const mappedError = mapBackendError(err);
      console.error('Profile initialization error:', mappedError.rawError);
      setError(mappedError.userMessage);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setError(null);
    setSuccess(false);
    setUploadProgress(0);

    try {
      // If no profile exists, initialize it first
      if (hasNoProfile) {
        await initializeProfileMutation.mutateAsync('User');
      }

      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await uploadDpMutation.mutateAsync(blob);
      
      setSuccess(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      const mappedError = mapBackendError(err);
      console.error('Upload error:', mappedError.rawError);
      setError(mappedError.userMessage);
      setUploadProgress(0);
    }
  };

  const handleCopyPhotoUrl = async () => {
    if (!photoDirectUrl) return;
    
    try {
      await navigator.clipboard.writeText(photoDirectUrl);
      setCopiedPhotoUrl(true);
      setTimeout(() => setCopiedPhotoUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy photo URL:', err);
    }
  };

  const handleSharePhoto = async () => {
    if (!photoDirectUrl || !canShare) return;

    try {
      await navigator.share({
        title: 'My Display Picture',
        text: 'Check out my display picture',
        url: photoDirectUrl,
      });
    } catch (err) {
      console.error('Failed to share photo:', err);
    }
  };

  const handleCopyProfileLink = async () => {
    try {
      await copyCanonicalUrlToClipboard(currentMode, 'profile');
      setCopiedProfileLink(true);
      setTimeout(() => setCopiedProfileLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy profile link:', err);
    }
  };

  const handleShareProfileLink = async () => {
    if (!canShare) return;

    try {
      await navigator.share({
        title: 'My Profile - BISMI CABS',
        text: 'View my profile on BISMI CABS',
        url: profilePageUrl,
      });
    } catch (err) {
      console.error('Failed to share profile link:', err);
    }
  };

  // Show loading state while checking admin status
  const showAdminSection = isAdminFetched && isAdmin === true;
  const isCheckingAdmin = isAdminLoading || !isAdminFetched;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your display picture and profile information
          </p>
        </div>

        {/* Display Picture Section */}
        <Card>
          <CardHeader>
            <CardTitle>Display Picture</CardTitle>
            <CardDescription>
              Upload a profile picture that will be visible to others
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Display Picture */}
            <div className="flex items-center gap-6">
              <UserAvatar className="h-24 w-24" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {hasDisplayPicture ? 'Current Display Picture' : 'No Display Picture Set'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasDisplayPicture
                    ? 'Your profile picture is visible to others'
                    : 'Upload a picture to personalize your profile'}
                </p>
              </div>
            </div>

            {/* Photo URL Sharing (only if DP exists) */}
            {hasDisplayPicture && photoDirectUrl && (
              <div className="space-y-2">
                <Label>Photo URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={photoDirectUrl}
                    readOnly
                    className="flex-1 font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPhotoUrl}
                    className="shrink-0"
                  >
                    {copiedPhotoUrl ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  {canShare && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSharePhoto}
                      className="shrink-0"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this URL to let others view your display picture
                </p>
              </div>
            )}

            <Separator />

            {/* Upload New Picture */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dp-upload">Upload New Picture</Label>
                <Input
                  ref={fileInputRef}
                  id="dp-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileSelect}
                  disabled={uploadDpMutation.isPending || initializeProfileMutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  PNG or JPEG, max 5MB
                </p>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="flex items-center gap-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-24 w-24 rounded-full object-cover border-2 border-border"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Ready to upload</p>
                      <p className="text-xs text-muted-foreground">
                        Click the upload button to save this picture
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="font-medium text-foreground">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Message */}
              {success && (
                <Alert className="border-success/50 bg-success/5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertDescription className="text-sm text-success">
                    Display picture uploaded successfully!
                  </AlertDescription>
                </Alert>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadDpMutation.isPending || initializeProfileMutation.isPending}
                className="w-full"
                size="lg"
              >
                {uploadDpMutation.isPending || initializeProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Picture
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Page Link Sharing */}
        <Card>
          <CardHeader>
            <CardTitle>Share Profile Page</CardTitle>
            <CardDescription>
              Share your profile page link with others
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Page URL</Label>
              <div className="flex gap-2">
                <Input
                  value={profilePageUrl}
                  readOnly
                  className="flex-1 font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyProfileLink}
                  className="shrink-0"
                >
                  {copiedProfileLink ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                {canShare && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareProfileLink}
                    className="shrink-0"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link to let others view your profile page
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admin-only Delete Website Section */}
        {!isCheckingAdmin && showAdminSection && (
          <>
            <Separator className="my-8" />
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-destructive">Danger Zone</h2>
                <p className="text-sm text-muted-foreground">
                  Irreversible actions that will permanently affect your website
                </p>
              </div>
              <DeleteWebsiteCard />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
