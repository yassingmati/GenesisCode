import React from 'react';
import { NextUIProvider } from "@nextui-org/react";
import AppRouter from './AppRouter';

export default function App() {
  return (
    <NextUIProvider>
      <AppRouter />
    </NextUIProvider>
  );
}
