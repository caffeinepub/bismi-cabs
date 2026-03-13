import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from './useBackendActor';
import type { BookingLead, RateCard, ExternalBlob, UserProfile } from '../backend';

export function useGetBookingLeads(enabled: boolean = true, refetchInterval?: number) {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();

  return useQuery<BookingLead[]>({
    queryKey: ['bookingLeads'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        return await actor.getBookingLeads();
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || '';
        if (
          errorMessage.includes('site has been deleted') ||
          errorMessage.includes('no longer available')
        ) {
          queryClient.setQueryData(['siteDeletedState'], true);
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching && enabled,
    refetchInterval: refetchInterval,
  });
}

export function useCreateBookingLead() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerName,
      customerPhone,
      pickupLocation,
      dropLocation,
      pickupDateTime,
      notes,
    }: {
      customerName: string;
      customerPhone: string;
      pickupLocation: string;
      dropLocation: string;
      pickupDateTime: string;
      notes: string | null;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        return await actor.createBookingLead(
          customerName,
          customerPhone,
          pickupLocation,
          dropLocation,
          pickupDateTime,
          notes
        );
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || '';
        if (
          errorMessage.includes('site has been deleted') ||
          errorMessage.includes('no longer available')
        ) {
          queryClient.setQueryData(['siteDeletedState'], true);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingLeads'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || '';
        if (
          errorMessage.includes('site has been deleted') ||
          errorMessage.includes('no longer available')
        ) {
          queryClient.setQueryData(['siteDeletedState'], true);
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAuthorizedForOwnerLeads() {
  const { actor, isFetching: actorFetching } = useBackendActor();
  const queryClient = useQueryClient();

  const query = useQuery<boolean>({
    queryKey: ['isCallerAuthorizedForOwnerLeads'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        const userType = await actor.getCurrentUserType();
        return userType === 'admin' || userType === 'authorizedStaff';
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || '';
        if (
          errorMessage.includes('site has been deleted') ||
          errorMessage.includes('no longer available')
        ) {
          queryClient.setQueryData(['siteDeletedState'], true);
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  // Return custom state that properly reflects actor dependency
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetLatestRateCard() {
  const { actor, isFetching } = useBackendActor();
  const queryClient = useQueryClient();

  return useQuery<RateCard | null>({
    queryKey: ['latestRateCard'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getLatestRateCard();
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || '';
        if (
          errorMessage.includes('site has been deleted') ||
          errorMessage.includes('no longer available')
        ) {
          queryClient.setQueryData(['siteDeletedState'], true);
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadRateCard() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      originalFileName,
      contentType,
    }: {
      file: ExternalBlob;
      originalFileName: string;
      contentType: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        return await actor.uploadRateCard(file, originalFileName, contentType);
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || '';
        if (
          errorMessage.includes('site has been deleted') ||
          errorMessage.includes('no longer available')
        ) {
          queryClient.setQueryData(['siteDeletedState'], true);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestRateCard'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useBackendActor();
  const queryClient = useQueryClient();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || '';
        if (
          errorMessage.includes('site has been deleted') ||
          errorMessage.includes('no longer available')
        ) {
          queryClient.setQueryData(['siteDeletedState'], true);
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  // Return custom state that properly reflects actor dependency
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        return await actor.saveCallerUserProfile(profile);
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || '';
        if (
          errorMessage.includes('site has been deleted') ||
          errorMessage.includes('no longer available')
        ) {
          queryClient.setQueryData(['siteDeletedState'], true);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useInitializeCallerProfile() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name?: string) => {
      if (!actor) throw new Error('Actor not initialized');
      const profile: UserProfile = {
        name: name || 'User',
        dp: undefined,
      };
      try {
        return await actor.saveCallerUserProfile(profile);
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || '';
        if (
          errorMessage.includes('site has been deleted') ||
          errorMessage.includes('no longer available')
        ) {
          queryClient.setQueryData(['siteDeletedState'], true);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUploadDp() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blob: ExternalBlob) => {
      if (!actor) throw new Error('Actor not initialized');
      try {
        return await actor.uploadDp(blob);
      } catch (error: any) {
        const errorMessage = error?.message || error?.toString() || '';
        if (
          errorMessage.includes('site has been deleted') ||
          errorMessage.includes('no longer available')
        ) {
          queryClient.setQueryData(['siteDeletedState'], true);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSiteDeletedState() {
  const { actor, isFetching: actorFetching } = useBackendActor();

  const query = useQuery<boolean>({
    queryKey: ['siteDeletedState'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.checkIfSiteIsDeleted();
      } catch (error: any) {
        // If the query itself fails with a deleted error, return true
        const errorMessage = error?.message || error?.toString() || '';
        if (
          errorMessage.includes('site has been deleted') ||
          errorMessage.includes('no longer available')
        ) {
          return true;
        }
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    refetchInterval: false,
    staleTime: Infinity,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useDeleteSiteAndWipeData() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return await actor.deleteSiteAndWipeData();
    },
    onSuccess: () => {
      // Immediately set the cached site-deleted state to true
      queryClient.setQueryData(['siteDeletedState'], true);
      
      // Invalidate all queries after deletion
      queryClient.invalidateQueries({ queryKey: ['bookingLeads'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['latestRateCard'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAuthorizedForOwnerLeads'] });
    },
    onError: (error: any) => {
      // If the error indicates the site is already deleted, also set the cached state
      const errorMessage = error?.message || error?.toString() || '';
      if (
        errorMessage.includes('Site has already been deleted') ||
        errorMessage.includes('site has been deleted') ||
        errorMessage.includes('no longer available')
      ) {
        queryClient.setQueryData(['siteDeletedState'], true);
      }
    },
  });
}
