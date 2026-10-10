import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sai Monish Cheruku | Full-Stack Software Engineer',
  description:
    'Portfolio of Sai Monish Cheruku, a full-stack software engineer building modern web applications with React, TypeScript, Python, and Django.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
