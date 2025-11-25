import { teamsAPI } from '@/lib/api';
import type { Team, TeamMember } from '@/lib/types';
import { useCallback, useEffect, useState } from 'react';

export function useTeam(teamId: string | null) {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = useCallback(async () => {
    if (!teamId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [teamData, membersData] = await Promise.all([
        teamsAPI.getTeam(teamId),
        teamsAPI.getTeamMembers(teamId),
      ]);
      setTeam(teamData);
      setMembers(membersData);
    } catch (err: any) {
      setError(err?.message || 'Nepodařilo se načíst tým');
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const removeMember = useCallback(async (memberId: string) => {
    setError(null);
    try {
      await teamsAPI.removeMember(memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err: any) {
      const errorMsg = err?.message || 'Nepodařilo se odebrat člena';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const updateMemberRole = useCallback(async (
    memberId: string,
    role: 'admin' | 'member'
  ) => {
    setError(null);
    try {
      const updated = await teamsAPI.updateMemberRole(memberId, role);
      setMembers(prev => prev.map(m => m.id === memberId ? updated : m));
    } catch (err: any) {
      const errorMsg = err?.message || 'Nepodařilo se změnit roli';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  return {
    team,
    members,
    isLoading,
    error,
    fetchTeam,
    removeMember,
    updateMemberRole,
  };
}