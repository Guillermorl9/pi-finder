import NumberGuesser from '@/components/NumberGuesser';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Number Guesser Game',
  description: 'Guess the secret number between 1 and 100.',
};

export default function NumberGuesserPage() {
  return <NumberGuesser />;
}
