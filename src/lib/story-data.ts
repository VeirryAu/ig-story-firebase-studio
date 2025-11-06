
import type { Story } from '@/types/story';

export const stories: Story[] = [
  {
    id: 'story1',
    user: {
      name: 'Sarah',
      avatar: 'https://picsum.photos/seed/user1/200/200',
    },
    slides: [
      {
        id: 'slide1',
        type: 'image',
        url: 'https://picsum.photos/seed/s1/450/800',
        duration: 5000,
        alt: 'A beautiful mountain landscape',
      },
      {
        id: 'slide2',
        type: 'image',
        url: 'https://picsum.photos/seed/s2/450/800',
        duration: 5000,
        alt: 'A serene lake at dawn',
      },
    ],
  },
  {
    id: 'story2',
    user: {
      name: 'John',
      avatar: 'https://picsum.photos/seed/user2/200/200',
    },
    slides: [
      {
        id: 'slide1',
        type: 'image',
        url: 'https://picsum.photos/seed/s3/450/800',
        duration: 7000,
        alt: 'Bustling city street at night',
      },
    ],
  },
];
