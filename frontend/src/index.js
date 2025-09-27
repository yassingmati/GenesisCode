import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ModalsProvider } from '@mantine/modals';
import { MantineProvider } from '@mantine/core';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode> <MantineProvider withNormalizeCSS withGlobalStyles>
    <ModalsProvider><App /> </ModalsProvider>
  </MantineProvider></React.StrictMode>);
