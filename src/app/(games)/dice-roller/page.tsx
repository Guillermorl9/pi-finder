import DiceRoller from '@/components/DiceRoller';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dice Roller Game',
  description: 'Simulate dice rolls and see frequency distributions.',
};

export default function DiceRollerPage() {
  return <DiceRoller />;
}
