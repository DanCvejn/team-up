// Database models
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created: string;
  updated: string;
}

export interface Team {
  id: string;
  name: string;
  icon: string;
  description?: string;
  invite_code: string;
  created_by: string;
  created: string;
  updated: string;
  expand?: {
    created_by?: User;
    team_members_via_team?: TeamMember[];
  };
}

export interface TeamMember {
  id: string;
  team: string;
  user: string;
  role: 'admin' | 'member';
  created: string;
  updated: string;
  expand?: {
    team?: Team;
    user?: User;
  };
}

export interface ResponseOption {
  id: number;
  label: string;
  countsToCapacity: boolean;
  color: 'green' | 'red' | 'blue' | 'yellow' | 'purple';
}

export interface Event {
  id: string;
  team: string;
  title: string;
  date: string;
  location: string;
  capacity: number;
  description?: string;
  response_options: ResponseOption[];
  created_by: string;
  created: string;
  updated: string;
  expand?: {
    team?: Team;
    created_by?: User;
    event_responses_via_event?: EventResponse[];
  };
}

export interface EventResponse {
  id: string;
  event: string;
  user?: string;
  guest_name?: string;
  response: string;
  added_by: string;
  created: string;
  updated: string;
  expand?: {
    event?: Event;
    user?: User;
    added_by?: User;
  };
}

// Helper types
export interface EventWithResponses extends Event {
  responses: EventResponse[];
  confirmedCount: number;
  waitlistCount: number;
}