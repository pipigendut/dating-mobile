export interface UserInGroupMember {
  id: string;
  status: string;
  full_name: string;
  bio: string;
  height_cm: number;
  age: number;
  location_city?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  verified_at?: string;
  gender?: { id: string; name: string; icon: string };
  relationship_type?: { id: string; name: string; icon: string };
  interested_genders: { id: string; name: string; icon: string }[];
  interests: { id: string; name: string; icon: string }[];
  languages: { id: string; name: string; icon: string }[];
  photos: { id: string; url: string; is_main: boolean }[];
  consumables: { item_type: string; amount: number }[];
}

export interface GroupResponse {
  id: string;
  entity_id: string;
  name: string;
  created_by: string;
  members?: UserInGroupMember[]; // Back to being direct UserResponses
}

export interface EntityResponse {
  id: string;
  type: 'user' | 'group';
  user?: UserInGroupMember;
  group?: GroupResponse;
}
