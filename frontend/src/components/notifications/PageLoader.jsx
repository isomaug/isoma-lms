import React from 'react';
import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className='fixed inset-0 top-16 z-50 bg-background flex items-center justify-center'>
      <Loader2 className='h-8 w-8 animate-spin text-primary' />
    </div>
  );
}
