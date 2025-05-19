import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/pi-finder');
  // return null; // redirect will stop rendering. Next.js handles this.
}
