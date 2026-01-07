import { pb } from '../pocketbase';
import type { Team, TeamMember } from '../types';

export const teamsAPI = {
  /**
   * Načti všechny týmy kde je user členem
   */
  async getMyTeams(): Promise<Team[]> {
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
      const team = await pb.collection('teams').getOne<Team>(teamId, {
        expand: 'created_by,team_members_via_team.user',
      });
      teams.push(team);
    }

    return teams;
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
      console.error('teamsAPI.getTeam error:', error);
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
    console.log('teamsAPI.getTeamMembers called with teamId:', teamId);
    console.log('Auth token exists:', !!pb.authStore.token);
    try {
      // Try using getList with explicit pagination instead of getFullList
      const result = await pb.collection('team_members').getList<TeamMember>(1, 50, {
        filter: `team = "${teamId}"`,
        expand: 'user',
        sort: 'created',
      });
      console.log('teamsAPI.getTeamMembers success, count:', result.items.length);
      return result.items;
    } catch (error: any) {
      console.error('teamsAPI.getTeamMembers error:', error);
      console.error('Error details:', {
        url: error.url,
        status: error.status,
        response: error.response,
        isAbort: error.isAbort,
        originalError: error.originalError,
        message: error.message,
      });
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