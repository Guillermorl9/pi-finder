import PiFinder from '@/components/PiFinder';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pi Finder Game',
  description: 'Search for numbers in the first 2000 decimal places of Pi.',
};

export default function PiFinderPage() {
  return <PiFinder />;
}
