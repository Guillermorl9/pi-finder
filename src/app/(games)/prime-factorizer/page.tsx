import PrimeFactorizer from '@/components/PrimeFactorizer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prime Factorizer Game',
  description: 'Find the prime factors of a given number.',
};

export default function PrimeFactorizerPage() {
  return <PrimeFactorizer />;
}
