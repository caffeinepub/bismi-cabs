import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { User } from 'lucide-react';

interface UserAvatarProps {
  className?: string;
}

export function UserAvatar({ className }: UserAvatarProps) {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  const dpUrl = userProfile?.dp?.getDirectURL();
  const fallbackSrc = '/assets/generated/dp-placeholder.dim_256x256.png';

  return (
    <Avatar className={className}>
      <AvatarImage 
        src={dpUrl || fallbackSrc} 
        alt={userProfile?.name || 'User avatar'} 
      />
      <AvatarFallback>
        <User className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  );
}
