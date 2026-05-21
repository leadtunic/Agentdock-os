import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Approval {
  id: string;
  task_id: string;
  agent_id: string;
  action: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string;
  approved_by: string | null;
  reason: string;
  created_at: string;
  updated_at: string;
}

export function useApprovals() {
  return useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const { data } = await api.get('/approvals');
      return data as Approval[];
    },
  });
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: ['approvals', 'pending'],
    queryFn: async () => {
      const { data } = await api.get('/approvals?status=pending');
      return data as Approval[];
    },
  });
}

export function useApproveApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await api.post(`/approvals/${id}/approve`, { reason });
      return data as Approval;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

export function useRejectApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data } = await api.post(`/approvals/${id}/reject`, { reason });
      return data as Approval;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}
