import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LevelPageTest from './LevelPageTest';

// Routes de test pour l'intégration des exercices
const TestRoutes = () => {
  return (
    <Routes>
      <Route path="/test-level" element={<LevelPageTest />} />
    </Routes>
  );
};

export default TestRoutes;


