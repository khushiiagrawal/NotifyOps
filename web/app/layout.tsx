import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NotifyOps - AI-Powered GitHub Issue Intelligence',
  description: 'Transform GitHub issues into actionable insights with AI-powered analysis and real-time Slack notifications. Intelligent issue processing for modern development teams.',
  keywords: 'GitHub, AI, Slack, notifications, issue management, OpenAI, automation, DevOps',
  authors: [{ name: 'NotifyOps Team' }],
  openGraph: {
    title: 'NotifyOps - AI-Powered GitHub Issue Intelligence',
    description: 'Transform GitHub issues into actionable insights with AI-powered analysis and real-time Slack notifications.',
    url: 'https://notifyops.com',
    siteName: 'NotifyOps',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NotifyOps - AI-Powered GitHub Issue Intelligence',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NotifyOps - AI-Powered GitHub Issue Intelligence',
    description: 'Transform GitHub issues into actionable insights with AI-powered analysis and real-time Slack notifications.',
    images: ['/og-image.png'],
    creator: '@notifyops',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}