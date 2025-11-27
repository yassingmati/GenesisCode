import React from 'react';
import { NextUIProvider } from "@nextui-org/react";
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import AppRouter from './AppRouter';
import { useUserIdFix } from './hooks/useUserIdFix';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  // Automatically fix fake userId on app load
  useUserIdFix();

  return (
    <ThemeProvider>
      <NextUIProvider>
        <MantineProvider>
          <AppRouter />
        </MantineProvider>
      </NextUIProvider>
    </ThemeProvider>
  );
}
