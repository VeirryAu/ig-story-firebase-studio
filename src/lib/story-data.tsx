
import type { Story } from '@/types/story';
import { PlaceHolderImages } from './placeholder-images';
import { WelcomeSlide } from '@/components/slides/welcome-slide';
import { CityNightSlide } from '@/components/slides/city-night-slide';
import { Screen1 } from '@/components/screens/screen-1';
import { Screen2 } from '@/components/screens/screen-2';
import { Screen3 } from '@/components/screens/screen-3';
import { Screen4 } from '@/components/screens/screen-4';
import { Screen5 } from '@/components/screens/screen-5';
import { Screen6 } from '@/components/screens/screen-6';
import { Screen7 } from '@/components/screens/screen-7';
import { Screen8 } from '@/components/screens/screen-8';
import { Screen9 } from '@/components/screens/screen-9';
import { Screen10 } from '@/components/screens/screen-10';
import { Screen11 } from '@/components/screens/screen-11';
import { Screen12 } from '@/components/screens/screen-12';
import config from './const.json';

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
  // {
  //   id: 'story1',
  //   user: {
  //     name: 'Sarah',
  //     avatar: getImageUrl('user1-avatar'),
  //   },
  //   slides: [
  //     {
  //       id: 'slide1',
  //       type: 'component',
  //       duration: 5000,
  //       alt: 'Welcome slide',
  //       component: <WelcomeSlide />,
  //     },
  //     {
  //       id: 'slide2',
  //       type: 'image',
  //       url: getImageUrl('story1-slide2'),
  //       duration: 5000,
  //       alt: 'A serene lake at dawn',
  //       aiHint: getImageHint('story1-slide2'),
  //     },
  //   ],
  // },
  {
    id: 'year-recap',
    user: {
      name: '',
      avatar: '/stories-asset/main/fore-logo.svg',
    },
    slides: [
      {
        id: 'screen-1',
        type: 'component',
        duration: config.slideDuration,
        alt: 'Welcome to Year in Review',
        component: <Screen1 />,
      },
      {
        id: 'screen-2',
        type: 'component',
        duration: config.slideDuration,
        alt: 'Year number display',
        component: <Screen2 />,
      },
      {
        id: 'screen-3',
        type: 'component',
        duration: config.slideDuration,
        alt: 'Statistics and numbers',
        component: <Screen3 />,
      },
      {
        id: 'screen-4',
        type: 'component',
        duration: config.slideDuration,
        alt: 'Highlights showcase',
        component: <Screen4 />,
      },
      {
        id: 'screen-5',
        type: 'component',
        duration: config.slideDuration,
        alt: 'Achievements display',
        component: <Screen5 />,
      },
      {
        id: 'screen-6',
        type: 'component',
        duration: config.slideDuration,
        alt: 'Memories collection',
        component: <Screen6 />,
      },
      {
        id: 'screen-7',
        type: 'component',
        duration: config.slideDuration,
        alt: 'Growth progress',
        component: <Screen7 />,
      },
      {
        id: 'screen-8',
        type: 'component',
        duration: config.slideDuration,
        alt: 'Challenges overcome',
        component: <Screen8 />,
      },
      {
        id: 'screen-9',
        type: 'component',
        duration: config.slideDuration,
        alt: 'Milestones timeline',
        component: <Screen9 />,
      },
      {
        id: 'screen-10',
        type: 'component',
        duration: config.slideDuration,
        alt: 'Thank you message',
        component: <Screen10 />,
      },
      {
        id: 'screen-11',
        type: 'component',
        duration: config.slideDuration,
        alt: 'Looking forward to next year',
        component: <Screen11 />,
      },
      {
        id: 'screen-12',
        type: 'component',
        duration: config.slideDuration,
        alt: 'Final message',
        component: <Screen12 />,
      },
      {
        id: 'screen-14',
        type: 'video',
        duration: 0, // Will be set dynamically from video duration
        alt: 'Barista video showcase',
        url: '/stories-asset/slides14/forecap-video-barista-h264.mp4', // Fallback URL
      },
    ],
  }
];
