import '../src/styles/global.css';
import MotionProvider from '../src/components/MotionProvider';
import type { ReactNode } from 'react';

export const Provider = ({ children }: { children: ReactNode }) => (
  <MotionProvider>{children}</MotionProvider>
);
