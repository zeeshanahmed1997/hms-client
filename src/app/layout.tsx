// src/app/layout.tsx
import { Providers } from '../providers/providers'; // Redux and others
import AuthProvider from '../components/AuthProvider'; 
import ReactQueryProvider from '../providers/ReactQueryProvider'; // <-- Add this
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ReactQueryProvider> 
            <AuthProvider>
              {children}
            </AuthProvider>
          </ReactQueryProvider>
        </Providers>
      </body>
    </html>
  );
}