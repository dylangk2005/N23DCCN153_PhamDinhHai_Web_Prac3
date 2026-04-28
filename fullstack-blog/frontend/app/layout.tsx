import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import Providers from './providers';


export const metadata: Metadata = {
  title: 'Fullstack Blog',
  description: 'Lab 3',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}