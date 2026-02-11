import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetCallerUserProfile, useUploadDp, useInitializeCallerProfile } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { Upload, Loader2, CheckCircle2, AlertCircle, UserPlus, Copy, ExternalLink, Share2, Check } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { mapBackendError } from '../utils/mapBackendError';
import { getCanonicalUrl, copyCanonicalUrlToClipboard } from '../utils/canonicalUrl';
import { isOwnerMode, isCustomerMode } from '../utils/appMode';

export function ProfilePage() {
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
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

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const handleOpenPhotoUrl = () => {
    if (!photoDirectUrl) return;
    window.open(photoDirectUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSharePhotoUrl = async () => {
    if (!photoDirectUrl) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Profile Photo',
          text: 'Check out my profile photo',
          url: photoDirectUrl,
        });
      } catch (err) {
        console.error('Failed to share photo URL:', err);
      }
    }
  };

  const handleCopyProfileLink = async () => {
    const success = await copyCanonicalUrlToClipboard(currentMode, 'profile');
    if (success) {
      setCopiedProfileLink(true);
      setTimeout(() => setCopiedProfileLink(false), 2000);
    }
  };

  const handleShareProfileLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Profile Page',
          text: 'Visit my profile page',
          url: profilePageUrl,
        });
      } catch (err) {
        console.error('Failed to share profile link:', err);
      }
    }
  };

  const isUploading = uploadDpMutation.isPending || initializeProfileMutation.isPending;
  const supportsWebShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your display picture and profile information
          </p>
        </div>

        {/* No Profile Initialization Card */}
        {hasNoProfile && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Welcome! Set Up Your Profile</CardTitle>
                  <CardDescription>
                    Initialize your profile to start uploading your display picture
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleInitializeProfile}
                disabled={initializeProfileMutation.isPending}
                className="w-full"
              >
                {initializeProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Initialize Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Current Display Picture */}
        <Card>
          <CardHeader>
            <CardTitle>Current Display Picture</CardTitle>
            <CardDescription>
              This is how your profile picture appears across the app
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <UserAvatar className="h-32 w-32" />
            {!hasDisplayPicture && (
              <p className="text-sm text-muted-foreground text-center">
                No display picture set. Upload one below to personalize your profile.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Share Profile Photo URL */}
        {hasDisplayPicture && photoDirectUrl && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Share Your Profile Photo</CardTitle>
              <CardDescription>
                Direct link to your profile photo that you can share with others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photo-url">Photo URL</Label>
                <Input
                  id="photo-url"
                  value={photoDirectUrl}
                  readOnly
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleCopyPhotoUrl}
                  variant={copiedPhotoUrl ? 'secondary' : 'default'}
                  size="sm"
                  className="flex-1 min-w-[120px]"
                >
                  {copiedPhotoUrl ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleOpenPhotoUrl}
                  variant="outline"
                  size="sm"
                  className="flex-1 min-w-[120px]"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </Button>
                {supportsWebShare && (
                  <Button
                    onClick={handleSharePhotoUrl}
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-[120px]"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Share Profile Page Link */}
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle>Share Your Profile Page</CardTitle>
            <CardDescription>
              Direct link to this profile page that you can share with others
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-url">Profile Page URL</Label>
              <Input
                id="profile-url"
                value={profilePageUrl}
                readOnly
                className="font-mono text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleCopyProfileLink}
                variant={copiedProfileLink ? 'secondary' : 'default'}
                size="sm"
                className="flex-1 min-w-[120px]"
              >
                {copiedProfileLink ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>
              {supportsWebShare && (
                <Button
                  onClick={handleShareProfileLink}
                  variant="outline"
                  size="sm"
                  className="flex-1 min-w-[120px]"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload New Display Picture */}
        {!hasNoProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Upload New Display Picture</CardTitle>
              <CardDescription>
                Choose a new image to update your profile picture (PNG or JPEG, max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Input */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Image</Label>
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="flex justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-32 w-32 rounded-full object-cover border-4 border-primary/20"
                    />
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="font-medium text-primary">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    Display picture saved permanently to your profile! It will be available every time you sign in.
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
                {selectedFile && !isUploading && (
                  <Button onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Display Picture Notice for Share Section */}
        {!hasDisplayPicture && !hasNoProfile && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Upload a display picture to enable photo sharing features.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
