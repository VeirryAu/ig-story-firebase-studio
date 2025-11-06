export interface Slide {
  id: string;
  type: 'image' | 'video';
  url: string;
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
