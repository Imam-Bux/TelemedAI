import localFont from 'next/font/local';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AuthModal from "./Components/AuthModal";
import './globals.css';

const plusJakartaSans = localFont({
  src: [
    {
      path: '../public/Assets/PlusJakartaSans-Regular.ttf', 
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/Assets/PlusJakartaSans-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.className}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}