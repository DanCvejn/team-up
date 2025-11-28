import { pb } from '../pocketbase';
import type { Team, TeamMember } from '../types';

export const teamsAPI = {
  /**
   * Načti všechny týmy kde je user členem
   */
  async getMyTeams(): Promise<Team[]> {
    const userId = pb.authStore.model?.id;
    if (!userId) throw new Error('Not authenticated');

    const teams = await pb.collection('teams').getFullList<Team>({
      filter: pb.filter('team_members_via_team.user.id = {:userId}', { userId }),
      expand: 'created_by,team_members_via_team.user',
      sort: '-created',
    });

    return teams;
  },

  /**
   * Detail týmu
   */
  async getTeam(teamId: string): Promise<Team> {
    const team = await pb.collection('teams').getOne<Team>(teamId, {
      expand: 'created_by,team_members_via_team.user',
    });
    return team;
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
    const members = await pb.collection('team_members').getFullList<TeamMember>({
      filter: pb.filter('team = {:teamId}', { teamId }),
      expand: 'user',
      sort: 'created',
    });

    return members;
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