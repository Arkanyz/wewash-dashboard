import '../styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '../providers/SupabaseProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WeWash Dashboard',
  description: 'Tableau de bord de gestion des laveries WeWash',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
