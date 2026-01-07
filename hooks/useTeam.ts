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
      // Fetch team data first
      const teamData = await teamsAPI.getTeam(teamId);
      setTeam(teamData);

      // Always fetch members separately to ensure proper user expansion
      // The expanded members from team might not have all user data populated
      try {
        const membersData = await teamsAPI.getTeamMembers(teamId);
        setMembers(membersData);
      } catch (memberErr: any) {
        // If fetching members fails, try to use expanded data as fallback
        console.warn('Failed to fetch members separately, using expanded data:', memberErr);
        if (teamData.expand?.team_members_via_team) {
          setMembers(teamData.expand.team_members_via_team);
        } else {
          throw memberErr;
        }
      }
    } catch (err: any) {
      console.error('Error fetching team:', err);
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