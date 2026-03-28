import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthProvider';

export const metadata: Metadata = {
  title: 'HackForge — Premium Hackathon Management Platform',
  description: 'The most powerful hackathon management platform for colleges and organizations. Run world-class tech events with ease.',
  keywords: ['hackathon', 'management', 'platform', 'college', 'tech events', 'competitive coding'],
  openGraph: {
    title: 'HackForge',
    description: 'Premium Hackathon Management Platform',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
