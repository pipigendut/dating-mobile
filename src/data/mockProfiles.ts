export interface Profile {
  id: string;
  name: string;
  age: number;
  location: { city: string; country: string; distance: number };
  height: number;
  bio: string;
  interests: string[];
  photos: string[];
  verified: boolean;
  isPlusMember?: boolean;
  languages?: string[];
  lookingFor?: string[];
  gender: 'male' | 'female' | 'other';
}

// Mock profiles for demo
export const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Citra',
    age: 25,
    location: { city: 'Jakarta', country: 'Indonesia', distance: 5 },
    height: 165,
    bio: 'Coffee lover ☕ | Adventure seeker 🌍 | Dog mom 🐕',
    interests: ['☕ Coffee', '✈️ Travel', '📸 Photography', '🐕 Pets', '🎵 Music'],
    photos: [
      'https://images.unsplash.com/photo-1770364017468-e755d33941e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHh8MXx8eW91bmclMjB3b21hbiUyMGFzaWFuJTIwcG9ydHJhaXQlMjBzbWlsaW5nfGVufDF8fHwxNzcxMzI3MjYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1739301674016-45dddb02e2dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHh8MXx8aGFwcHklMjB3b21hbiUyMGNhc3VhbCUyMHBvcnRyYWl0fGVufDF8fHwxNzcxMzI3MjYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    verified: true,
    isPlusMember: false,
    languages: ['Bahasa Indonesia', 'English'],
    lookingFor: ['Long-term partner', 'New friends'],
    gender: 'female',
  },
  {
    id: '2',
    name: 'Reza',
    age: 28,
    location: { city: 'Bandung', country: 'Indonesia', distance: 12 },
    height: 178,
    bio: 'Foodie 🍕 | Gym enthusiast 💪 | Love good conversations',
    interests: ['🏃 Fitness', '🍕 Foodie', '🎮 Gaming', '🎬 Movies', '🏀 Sports'],
    photos: [
      'https://images.unsplash.com/photo-1621398945253-00498f153e4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHh8MXx8eW91bmclMjBtYW4lMjBpbmRvbmVzaWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcxMzI3MjYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1735777192155-dec95124a585?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHh8MXx8aGFuZHNvbWUlMjBtYW4lMjBwb3J0cmFpdCUyMG91dGRvb3J8ZW58MXx8fHwxNzcxMzI3MjYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    verified: true,
    isPlusMember: true,
    languages: ['Bahasa Indonesia', 'English'],
    lookingFor: ['Long-term partner'],
    gender: 'male',
  },
  {
    id: '3',
    name: 'Sarah',
    age: 23,
    location: { city: 'Surabaya', country: 'Indonesia', distance: 8 },
    height: 160,
    bio: 'Artist 🎨 | Beach lover 🏖️ | Looking for someone to explore with',
    interests: ['🎨 Art', '🏖️ Beach', '📚 Reading', '🎵 Music', '✈️ Travel'],
    photos: [
      'https://images.unsplash.com/photo-1704054006064-2c5b922e7a1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHh8MXx8aGFwcHklMjB5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcxMjYwMzQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    verified: false,
    isPlusMember: false,
    languages: ['Bahasa Indonesia'],
    lookingFor: ['New friends', 'Still figuring it out'],
    gender: 'female',
  },
  {
    id: '4',
    name: 'Budi',
    age: 26,
    location: { city: 'Jakarta', country: 'Indonesia', distance: 3 },
    height: 175,
    bio: 'Photographer 📸 | Coffee addict ☕ | Always up for an adventure',
    interests: ['📸 Photography', '☕ Coffee', '⛰️ Hiking', '🎬 Movies', '🍳 Cooking'],
    photos: [
      'https://images.unsplash.com/photo-1561688961-7588856fe6ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHh8MXx8aGFuZHNvbWUlMjB5b3VuZyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHwxNzcxMzI1NjE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    verified: true,
    isPlusMember: false,
    languages: ['Bahasa Indonesia'],
    lookingFor: ['Short-term fun', 'Still figuring it out'],
    gender: 'male',
  },
];
