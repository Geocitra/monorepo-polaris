'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function StudioCommentsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/aspirasi?tab=comments');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-xs font-semibold">Mengalihkan ke halaman Suara & Aspirasi Warga...</p>
    </div>
  );
}
