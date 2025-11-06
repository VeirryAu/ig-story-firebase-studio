
import type { Story } from '@/types/story';
import { PlaceHolderImages } from './placeholder-images';
import { WelcomeSlide } from '@/components/slides/welcome-slide';
import { CityNightSlide } from '@/components/slides/city-night-slide';

// Helper to find image URL by ID
const getImageUrl = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  return image ? image.imageUrl : 'https://placehold.co/1080x1920/EEE/31343C';
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
        type: 'component',
        duration: 5000,
        alt: 'Welcome slide',
        component: <WelcomeSlide />,
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
  }
];
