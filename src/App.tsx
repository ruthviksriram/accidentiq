import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CaseProvider } from './context/CaseContext';
import { AppShell } from './components/layout/AppShell';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewCasePage } from './pages/NewCasePage';
import { AnalysisResultsPage } from './pages/AnalysisResultsPage';
import { SceneReconstructionPage } from './pages/SceneReconstructionPage';
import { CaseReportPage, ReportsListPage } from './pages/CaseReportPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CaseProvider>
        <Router>
          <Routes>
            {/* Public standalone pages without AppShell */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Authenticated / Investigative Workspace with AppShell */}
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/cases/new" element={<NewCasePage />} />
              <Route path="/cases/:id/edit" element={<NewCasePage />} />
              <Route path="/cases/:id/analysis" element={<AnalysisResultsPage />} />
              <Route path="/cases/:id/reconstruction" element={<SceneReconstructionPage />} />
              <Route path="/cases/:id/report" element={<CaseReportPage />} />
              <Route path="/cases/:id" element={<CaseReportPage />} />
              <Route path="/reports" element={<ReportsListPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CaseProvider>
    </ThemeProvider>
  );
};

export default App;
