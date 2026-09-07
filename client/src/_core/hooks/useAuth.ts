import { trpc } from "@/lib/trpc";
import { useCallback, useMemo } from "react";

/**
 * Compatibility hook for the template dashboard. Panco itself uses the dedicated
 * admin page, but this keeps unused template components independent of Manus OAuth.
 */
export function useAuth() {
  const utils = trpc.useUtils();
  const statusQuery = trpc.adminAuth.status.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const logoutMutation = trpc.adminAuth.logout.useMutation({
    onSuccess: async () => { await utils.adminAuth.status.invalidate(); },
  });

  const logout = useCallback(async () => { await logoutMutation.mutateAsync(); }, [logoutMutation]);
  const user = useMemo(() => statusQuery.data?.signedIn ? { name: "Panco owner", email: statusQuery.data.email ?? "", role: "admin" as const } : null, [statusQuery.data]);

  return { user, loading: statusQuery.isLoading || logoutMutation.isPending, error: statusQuery.error ?? logoutMutation.error ?? null, isAuthenticated: Boolean(user), refresh: statusQuery.refetch, logout };
}
