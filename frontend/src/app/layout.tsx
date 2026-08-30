import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AuthModal from "./Components/AuthModal";
import './globals.css'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
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