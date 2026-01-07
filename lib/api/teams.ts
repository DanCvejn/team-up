import { pb } from '../pocketbase';
import type { Team, TeamMember } from '../types';

export const teamsAPI = {
  /**
   * Načti všechny týmy kde je user členem
   */
  async getMyTeams(): Promise<Team[]> {
    try {
      const userId = pb.authStore.record?.id;
      if (!userId) throw new Error('Not authenticated');

      // Get all team members for the current user
      const members = await pb.collection('team_members').getFullList<TeamMember>({
        filter: pb.filter('user = {:userId}', { userId }),
        expand: 'team,team.created_by',
      });

      // Extract unique teams and enrich with team members
      const teamIds = [...new Set(members.map(m => m.team))];
      const teams: Team[] = [];

      for (const teamId of teamIds) {
        try {
          const team = await pb.collection('teams').getOne<Team>(teamId, {
            expand: 'created_by,team_members_via_team.user',
          });
          teams.push(team);
        } catch (teamErr: any) {
          // Ignoruj chyby pro jednotlivé týmy
          if (teamErr?.status === 0) {
            console.warn(`Hot reload error fetching team ${teamId}`);
          } else {
            console.warn(`Error fetching team ${teamId}:`, teamErr);
          }
        }
      }

      return teams;
    } catch (error: any) {
      // Při status 0 (hot reload) vrať prázdné pole
      if (error?.status === 0) {
        console.warn('Hot reload error in getMyTeams');
        return [];
      }
      console.warn('Error in getMyTeams:', error);
      throw error;
    }
  },

  /**
   * Detail týmu
   */
  async getTeam(teamId: string): Promise<Team> {
    try {
      const team = await pb.collection('teams').getOne<Team>(teamId, {
        expand: 'created_by',
      });
      return team;
    } catch (error: any) {
      // Tiše ignoruj chyby s status 0 (hot reload)
      if (error?.status === 0) {
        console.warn('Hot reload error in getTeam, rethrowing...');
      } else {
        console.warn('teamsAPI.getTeam error:', error);
      }
      throw error;
    }
  },

  /**
   * Vytvoř nový tým
   */
  async createTeam(data: {
    name: string;
    description?: string;
  }): Promise<Team> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('Not authenticated');

    // Vygeneruj invite code
    const inviteCode = generateInviteCode();

    const team = await pb.collection('teams').create<Team>({
      ...data,
      invite_code: inviteCode,
      created_by: userId,
    });

    // Přidej sebe jako admin
    await pb.collection('team_members').create({
      team: team.id,
      user: userId,
      role: 'admin',
    });

    return team;
  },

  /**
   * Aktualizuj tým
   */
  async updateTeam(teamId: string, data: Partial<Team>): Promise<Team> {
    const team = await pb.collection('teams').update<Team>(teamId, data);
    return team;
  },

  /**
   * Smaž tým
   */
  async deleteTeam(teamId: string): Promise<void> {
    await pb.collection('teams').delete(teamId);
  },

  /**
   * Připoj se k týmu přes invite code
   */
  async joinTeam(inviteCode: string): Promise<{ team: Team; member: TeamMember }> {
    const response = await pb.send('/api/teams/join', {
      method: 'POST',
      body: { invite_code: inviteCode },
    });

    return response;
  },

  /**
   * Opusť tým
   */
  async leaveTeam(teamId: string): Promise<void> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('Not authenticated');

    // Najdi member záznam
    const members = await pb.collection('team_members').getFullList<TeamMember>({
      filter: pb.filter('team = {:teamId} && user = {:userId}', { teamId, userId }),
    });

    if (members.length > 0) {
      await pb.collection('team_members').delete(members[0].id);
    }
  },

  /**
   * Získej členy týmu
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const result = await pb.collection('team_members').getFullList<TeamMember>({
        filter: `team = "${teamId}"`,
        expand: 'user',
        sort: 'created',
      });
      return result;
    } catch (error: any) {
      // Tiše ignoruj chyby s status 0 (hot reload)
      if (error?.status === 0) {
        console.warn('Hot reload error in getTeamMembers');
        return []; // Vrať prázdné pole při hot reload
      }
      console.warn('teamsAPI.getTeamMembers error:', error);
      throw error;
    }
  },

  /**
   * Odebrání člena (pouze admin)
   */
  async removeMember(memberId: string): Promise<void> {
    await pb.collection('team_members').delete(memberId);
  },

  /**
   * Změň roli člena
   */
  async updateMemberRole(
    memberId: string,
    role: 'admin' | 'member'
  ): Promise<TeamMember> {
    const member = await pb.collection('team_members').update<TeamMember>(memberId, {
      role,
    });
    return member;
  },

  /**
   * Regeneruj invite code týmu
   */
  async regenerateInviteCode(teamId: string): Promise<Team> {
    const newInviteCode = generateInviteCode();
    const team = await pb.collection('teams').update<Team>(teamId, {
      invite_code: newInviteCode,
    });
    return team;
  },
};

// Helper: generuj náhodný invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bez 0,O,1,I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}