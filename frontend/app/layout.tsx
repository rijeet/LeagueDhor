import '../styles/globals.css';
import { Header } from './components/Header';
import { DailyPopup } from '../components/DailyPopup/DailyPopup';
import { CountdownFooter } from '../components/CountdownFooter/CountdownFooter';

export const metadata = {
  title: 'League Dhor',
  description: 'League Dhor application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black min-h-screen flex flex-col" suppressHydrationWarning>
        <Header />
        <DailyPopup />
        <div className="flex-1">
          {children}
        </div>
        <CountdownFooter />
      </body>
    </html>
  );
}
