export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'organization' | 'manager' | 'student';
          college: string | null;
          avatar_url: string | null;
          organization_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'admin' | 'organization' | 'manager' | 'student';
          college?: string | null;
          avatar_url?: string | null;
          organization_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          college: string;
          email: string;
          website: string | null;
          description: string | null;
          status: 'active' | 'suspended';
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      hackathons: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          description: string;
          college: string;
          organization_id: string;
          created_by: string;
          status: 'draft' | 'upcoming' | 'active' | 'ended';
          start_date: string;
          end_date: string;
          registration_deadline: string;
          prize_pool: string;
          min_team_size: number;
          max_team_size: number;
          allow_solo: boolean;
          tags: string[];
          is_featured: boolean;
          rules: string[];
          max_participants: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hackathons']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['hackathons']['Insert']>;
      };
      teams: {
        Row: {
          id: string;
          hackathon_id: string;
          name: string;
          leader_id: string;
          invite_code: string;
          max_size: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['teams']['Insert']>;
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: Omit<Database['public']['Tables']['team_members']['Row'], 'id' | 'joined_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['team_members']['Insert']>;
      };
      submissions: {
        Row: {
          id: string;
          hackathon_id: string;
          hackathon_title: string;
          user_id: string;
          team_id: string | null;
          team_name: string | null;
          project_title: string;
          description: string | null;
          github_url: string | null;
          demo_url: string | null;
          file_url: string | null;
          file_name: string | null;
          file_size: number | null;
          submission_data: Record<string, string> | null;
          status: 'submitted' | 'reviewed' | 'approved' | 'disqualified';
          score: number | null;
          feedback: string | null;
          submitted_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['submissions']['Row'], 'id' | 'submitted_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['submissions']['Insert']>;
      };

      announcements: {
        Row: {
          id: string;
          hackathon_id: string;
          created_by: string;
          title: string;
          content: string;
          type: 'info' | 'warning' | 'success';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>;
      };
      certificates: {
        Row: {
          id: string;
          hackathon_id: string;
          user_id: string;
          team_id: string | null;
          achievement: string;
          verification_code: string;
          issued_at: string;
        };
        Insert: Omit<Database['public']['Tables']['certificates']['Row'], 'id' | 'issued_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['certificates']['Insert']>;
      };
      saved_hackathons: {
        Row: {
          id: string;
          user_id: string;
          hackathon_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['saved_hackathons']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['saved_hackathons']['Insert']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
