import localFont from 'next/font/local';
import { AuthProvider } from './context/AuthContext';
import AuthModal from "./Components/AuthModal";
import './globals.css';

const plusJakartaSans = localFont({
  src: [
    {
      path: '../../public/Assets/Plus_Jakarta_Sans/static/PlusJakartaSans-Regular.ttf', 
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/Assets/Plus_Jakarta_Sans/static/PlusJakartaSans-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}