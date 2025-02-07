'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    console.log('[Layout] Component mounted');
    console.log('[Layout] Current theme classes:', {
      background: window.getComputedStyle(document.body).backgroundColor,
      foreground: window.getComputedStyle(document.body).color,
    });
  }, []);

  console.log('[Layout] Rendering layout component');

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <title>Smart Thumbnail Maker</title>
      </head>
      <body 
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <div className="relative flex min-h-screen">
          {/* Sidebar */}
          <div className="hidden md:flex w-72 flex-col fixed inset-y-0 border-r bg-card">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
                <h1 className="text-lg font-semibold">Smart Thumbnail Maker</h1>
              </div>
              <div className="flex-1 flex flex-col overflow-y-auto">
                <nav className="flex-1 px-4 py-4 space-y-2">
                  <Link 
                    href="/"
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-primary/10 text-primary"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/history"
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    History
                  </Link>
                  <Link 
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    Settings
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col md:pl-72">
            <main className="flex-1 bg-background">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
