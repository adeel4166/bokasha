import './globals.css';
import { Inter } from 'next/font/google';
import GlobalNavbar from '@/components/GlobalNavbar';
import GlobalFooter from '@/components/GlobalFooter';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'BOKASHA - Verified Product Reviews & Buying Guides',
  description: 'Unbiased and dynamic product review articles and comparisons from global Amazon marketplaces.',
  keywords: ['Bokasha reviews', 'Amazon product reviews', 'buying guides', 'top picks', 'best seller reviews', 'product comparisons'],
  authors: [{ name: 'BOKASHA Team' }],
  metadataBase: new URL('https://bokasha.com'), // Base URL for resolving relative links
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'BOKASHA - Verified Product Reviews',
    description: 'Dynamic product review articles and comparisons from global Amazon marketplaces.',
    url: 'https://bokasha.com',
    siteName: 'BOKASHA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BOKASHA - Product Reviews',
    description: 'Dynamic product review articles from global Amazon marketplaces.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'light' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-[#070a13] dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-200`}>
        <GlobalNavbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <GlobalFooter />
      </body>
    </html>
  );
}
