import { useInternetIdentity } from './useInternetIdentity';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';

const ACTOR_QUERY_KEY = 'actor';

export interface UseActorReturn {
  actor: backendInterface | null;
  isFetching: boolean;
  error: Error | null;
  isError: boolean;
  adminInitWarning: string | null;
}

export function useBackendActor(): UseActorReturn {
  const { identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();

  const actorQuery = useQuery<backendInterface, Error>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      // Check if user is authenticated (has identity AND not anonymous)
      const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

      if (!isAuthenticated) {
        // Return anonymous actor for unauthenticated users
        return await createActorWithConfig();
      }

      // Create authenticated actor
      const actorOptions = {
        agentOptions: {
          identity
        }
      };

      const actor = await createActorWithConfig(actorOptions);

      // Only attempt admin initialization if caffeineAdminToken is present
      const adminToken = getSecretParameter('caffeineAdminToken') || '';
      if (adminToken.trim()) {
        try {
          await actor._initializeAccessControlWithSecret(adminToken);
        } catch (error) {
          // Log admin init failure but don't fail actor creation
          console.warn('Admin initialization failed:', error);
          // Store warning in session storage for debugging
          sessionStorage.setItem('adminInitWarning', error instanceof Error ? error.message : String(error));
        }
      }

      return actor;
    },
    // Only refetch when identity changes
    staleTime: Infinity,
    // Wait for identity initialization to complete
    enabled: !isInitializing,
    retry: false,
  });

  // When the actor changes, invalidate dependent queries
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
    }
  }, [actorQuery.data, queryClient]);

  // Get admin init warning from session storage
  const adminInitWarning = sessionStorage.getItem('adminInitWarning');

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching || isInitializing,
    error: actorQuery.error || null,
    isError: actorQuery.isError,
    adminInitWarning,
  };
}
