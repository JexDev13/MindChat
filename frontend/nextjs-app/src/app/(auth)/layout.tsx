import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background gradients/blobs could go here if global layout doesn't handle them */}
      <div className="relative z-10 w-full max-w-md p-4">
        {children}
      </div>
    </div>
  );
}
