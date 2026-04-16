'use client';

import { Toaster } from 'sonner';
import 'sonner/dist/styles.css';

export function SonnerWrapper() {
  return <Toaster position="top-right" richColors closeButton />;
}
