export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  series: 'The Foundation' | 'Spirit & Truth' | 'Kingdom Builders' | 'Sunday Messages';
  date: string;
  duration: string; // duration formatted as MM:SS
  audioUrl: string; // real or placeholder mp3 URL
  imageUrl: string;
  hasAudio: boolean;
}

export interface Elder {
  name: string;
  role: string;
  imageUrl: string;
  isLead?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  category: 'Event' | 'Course' | 'Retreat' | 'Series' | 'Community';
  date: string;
  summary: string;
  content?: string;
  imageUrl?: string;
}

export interface Involvement {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
}
