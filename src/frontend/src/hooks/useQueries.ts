import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { BookingLead, RateCard, ExternalBlob } from '../backend';

export function useGetBookingLeads(enabled: boolean = true) {
  const { actor, isFetching } = useActor();

  return useQuery<BookingLead[]>({
    queryKey: ['bookingLeads'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getBookingLeads();
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useCreateBookingLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      customerName: string;
      customerPhone: string;
      pickupLocation: string;
      dropLocation: string;
      pickupDateTime: string;
      notes: string | null;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createBookingLead(
        data.customerName,
        data.customerPhone,
        data.pickupLocation,
        data.dropLocation,
        data.pickupDateTime,
        data.notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookingLeads'] });
    },
  });
}

export function useGetLatestRateCard() {
  const { actor, isFetching } = useActor();

  return useQuery<RateCard | null>({
    queryKey: ['latestRateCard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getLatestRateCard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadRateCard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      file: ExternalBlob;
      originalFileName: string;
      contentType: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.uploadRateCard(data.file, data.originalFileName, data.contentType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestRateCard'] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
