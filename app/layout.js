import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Church Admin',
  description: 'Church Administration System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
