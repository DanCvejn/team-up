import { teamsAPI } from '@/lib/api';
import type { Team } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Načti týmy při mount
  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await teamsAPI.getMyTeams();
      setTeams(data);
    } catch (err: any) {
      setError(err?.message || 'Nepodařilo se načíst týmy');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const createTeam = useCallback(async (data: {
    name: string;
    icon: string;
    description?: string;
  }) => {
    setError(null);
    try {
      const newTeam = await teamsAPI.createTeam(data);
      setTeams(prev => [newTeam, ...prev]);
      return newTeam;
    } catch (err: any) {
      const errorMsg = err?.message || 'Nepodařilo se vytvořit tým';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const updateTeam = useCallback(async (teamId: string, data: Partial<Team>) => {
    setError(null);
    try {
      const updated = await teamsAPI.updateTeam(teamId, data);
      setTeams(prev => prev.map(t => t.id === teamId ? updated : t));
      return updated;
    } catch (err: any) {
      const errorMsg = err?.message || 'Nepodařilo se aktualizovat tým';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const deleteTeam = useCallback(async (teamId: string) => {
    setError(null);
    try {
      await teamsAPI.deleteTeam(teamId);
      setTeams(prev => prev.filter(t => t.id !== teamId));
    } catch (err: any) {
      const errorMsg = err?.message || 'Nepodařilo se smazat tým';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const joinTeam = useCallback(async (inviteCode: string) => {
    setError(null);
    try {
      const { team } = await teamsAPI.joinTeam(inviteCode);
      setTeams(prev => [team, ...prev]);
      return team;
    } catch (err: any) {
      const errorMsg = err?.message || 'Nepodařilo se připojit k týmu';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const leaveTeam = useCallback(async (teamId: string) => {
    setError(null);
    try {
      await teamsAPI.leaveTeam(teamId);
      setTeams(prev => prev.filter(t => t.id !== teamId));
    } catch (err: any) {
      const errorMsg = err?.message || 'Nepodařilo se opustit tým';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  return {
    teams,
    isLoading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    joinTeam,
    leaveTeam,
  };
}