// src/app/layout.tsx
import { Providers } from '../redux/providers'; // Your existing file
import AuthProvider from '../components/AuthProvider'; // The new file
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}