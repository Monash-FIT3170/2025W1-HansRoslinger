
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import {HomePage} from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<h2>404: Page Not Found</h2>} />
      </Routes>
    </BrowserRouter>
  );
}
