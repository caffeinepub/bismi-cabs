import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendActor } from './useBackendActor';
import type { BookingLead, RateCard, ExternalBlob, UserProfile } from '../backend';

export function useGetBookingLeads(enabled: boolean = true, refetchInterval?: number) {
  const { actor, isFetching } = useBackendActor();

  return useQuery<BookingLead[]>({
    queryKey: ['bookingLeads'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getBookingLeads();
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
      return actor.createBookingLead(
        customerName,
        customerPhone,
        pickupLocation,
        dropLocation,
        pickupDateTime,
        notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingLeads'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useBackendActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAuthorizedForOwnerLeads() {
  const { actor, isFetching: actorFetching } = useBackendActor();

  const query = useQuery<boolean>({
    queryKey: ['isCallerAuthorizedForOwnerLeads'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const userType = await actor.getCurrentUserType();
      return userType === 'admin' || userType === 'authorizedStaff';
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

  return useQuery<RateCard | null>({
    queryKey: ['latestRateCard'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLatestRateCard();
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
      return actor.uploadRateCard(file, originalFileName, contentType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestRateCard'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useBackendActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
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
      return actor.saveCallerUserProfile(profile);
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
      return actor.saveCallerUserProfile(profile);
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
      return actor.uploadDp(blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
