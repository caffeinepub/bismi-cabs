import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { BookingLead } from '../backend';

export function useGetBookingLeads() {
  const { actor, isFetching } = useActor();

  return useQuery<BookingLead[]>({
    queryKey: ['bookingLeads'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getBookingLeads();
    },
    enabled: !!actor && !isFetching,
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
