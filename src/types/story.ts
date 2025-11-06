import type { ReactNode } from 'react';

export interface Slide {
  id: string;
  type: 'image' | 'video' | 'component';
  url?: string; // Optional for component type
  component?: ReactNode; // For React components
  duration: number;
  alt: string;
  title?: string;
  description?: string;
  aiHint?: string;
}

export interface StoryUser {
  name: string;
  avatar: string;
}

export interface Story {
  id: string;
  user: StoryUser;
  slides: Slide[];
}
