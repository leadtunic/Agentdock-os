import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  model: string;
  provider_id: string;
  created_at: string;
  updated_at: string;
}

export function useAgents(projectId: string) {
  return useQuery({
    queryKey: ['agents', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}/agents`);
      return data as Agent[];
    },
    enabled: !!projectId,
  });
}

export function useAgent(projectId: string, agentId: string) {
  return useQuery({
    queryKey: ['agents', projectId, agentId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}/agents/${agentId}`);
      return data as Agent;
    },
    enabled: !!projectId && !!agentId,
  });
}

export function useCreateAgent(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) => {
      const { data } = await api.post(`/projects/${projectId}/agents`, agent);
      return data as Agent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', projectId] });
    },
  });
}

export function useUpdateAgent(projectId: string, agentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agent: Partial<Agent>) => {
      const { data } = await api.patch(`/projects/${projectId}/agents/${agentId}`, agent);
      return data as Agent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', projectId] });
      queryClient.invalidateQueries({ queryKey: ['agents', projectId, agentId] });
    },
  });
}

export function useDeleteAgent(projectId: string, agentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/projects/${projectId}/agents/${agentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', projectId] });
    },
  });
}
