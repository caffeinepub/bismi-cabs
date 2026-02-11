import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetCallerUserProfile, useUploadDp, useInitializeCallerProfile } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { Upload, Loader2, CheckCircle2, AlertCircle, UserPlus } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { mapBackendError } from '../utils/mapBackendError';

export function ProfilePage() {
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const uploadDpMutation = useUploadDp();
  const initializeProfileMutation = useInitializeCallerProfile();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasNoProfile = isFetched && userProfile === null;

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

  const isUploading = uploadDpMutation.isPending || initializeProfileMutation.isPending;

  // Show loading state while profile is being fetched
  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-lg">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
          <CardDescription>
            Update your display picture
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* No Profile State */}
          {hasNoProfile && (
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <UserPlus className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-600">
                Your profile needs to be initialized before you can upload a display picture.
                Click "Initialize Profile" below to get started.
              </AlertDescription>
            </Alert>
          )}

          {/* Current Display Picture */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Current Display Picture</Label>
            <div className="flex items-center gap-4">
              <UserAvatar className="h-24 w-24" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {userProfile?.name || 'User'}
                </p>
                {userProfile?.dp ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Display picture set
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Using default placeholder
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Initialize Profile Button (only shown when no profile) */}
          {hasNoProfile && !selectedFile && (
            <div className="flex justify-center py-4">
              <Button
                onClick={handleInitializeProfile}
                disabled={initializeProfileMutation.isPending}
                size="lg"
                className="min-w-[200px]"
              >
                {initializeProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Initialize Profile
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Upload New Picture */}
          <div className="space-y-3">
            <Label htmlFor="dp-upload" className="text-base font-semibold">
              Upload New Display Picture
            </Label>
            <div className="space-y-4">
              <Input
                ref={fileInputRef}
                id="dp-upload"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Accepted formats: PNG, JPEG (max 5MB)
              </p>
            </div>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Preview</Label>
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-32 w-32 rounded-full object-cover border-4 border-border"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Display picture updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {selectedFile ? (
              <>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {hasNoProfile ? 'Initializing & Uploading...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Upload Picture
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={isUploading}
                  variant="outline"
                  size="lg"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={hasNoProfile}
              >
                <Upload className="mr-2 h-5 w-5" />
                Choose Picture
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
