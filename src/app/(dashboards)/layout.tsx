// app/(dashboard)/layout.tsx
import type { ReactNode } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import TopNavbar from '../../components/dashboard/TopNavBar';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('hms_auth_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET as string);
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return { id: payload.sub, role: payload.role };
  } catch { return null; }
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <>
      {/* Import Bootstrap for the grid */}
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      
      <div className="container-fluid p-0 vh-100 overflow-hidden bg-light">
        <div className="row g-0 h-100">
          
          {/* 1. SIDEBAR - 3 Columns */}
          <div className="col-md-3 col-lg-2 bg-white border-end h-100 overflow-y-auto">
            <Sidebar />
          </div>

          {/* 2. MAIN AREA - 9 Columns (Remaining space) */}
          <div className="col-md-9 col-lg-10 d-flex flex-column h-100 overflow-hidden">
            
            <TopNavbar />

            {/* 3. SCROLLABLE CONTENT */}
            <main className="flex-grow-1 overflow-y-auto p-4" style={{ overflowX: 'auto' }}>
              {children}
            </main>
            
          </div>
        </div>
      </div>
    </>
  );
}