
import type { Story } from '@/types/story';
import { PlaceHolderImages } from './placeholder-images';

// Helper to find image URL by ID
const getImageUrl = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  return image ? image.imageUrl : 'https://placehold.co/400x400/EEE/31343C';
};

const getImageHint = (id: string) => {
    const image = PlaceHolderImages.find(img => img.id === id);
    return image ? image.imageHint : '';
}

export const stories: Story[] = [
  {
    id: 'story1',
    user: {
      name: 'Sarah',
      avatar: getImageUrl('user1-avatar'),
    },
    slides: [
      {
        id: 'slide1',
        type: 'image',
        url: getImageUrl('story1-slide1'),
        duration: 5000,
        alt: 'A beautiful mountain landscape',
        aiHint: getImageHint('story1-slide1'),
      },
      {
        id: 'slide2',
        type: 'image',
        url: getImageUrl('story1-slide2'),
        duration: 5000,
        alt: 'A serene lake at dawn',
        aiHint: getImageHint('story1-slide2'),
      },
    ],
  },
  {
    id: 'story2',
    user: {
      name: 'John',
      avatar: getImageUrl('user2-avatar'),
    },
    slides: [
      {
        id: 'slide1',
        type: 'image',
        url: getImageUrl('story2-slide1'),
        duration: 7000,
        alt: 'Bustling city street at night',
        aiHint: getImageHint('story2-slide1'),
      },
    ],
  },
];
