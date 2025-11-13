
import { Header } from '@/components/header';
import AboutPageClient from '@/components/about-page-client';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <Header />
      <AboutPageClient />
    </div>
  );
}
