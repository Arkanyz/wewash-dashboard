import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CallsNavigation } from './CallsNavigation';
import { CallsTab } from './CallsTab';
import { InfoRequestsTab } from './InfoRequestsTab';
import { ProblemsTab } from './ProblemsTab';
import { CriticalTab } from './CriticalTab';

export function CallsLayout() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <CallsNavigation />
      <div className="container mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/calls" replace />} />
          <Route path="/calls" element={<CallsTab />} />
          <Route path="/info-requests" element={<InfoRequestsTab />} />
          <Route path="/problems" element={<ProblemsTab />} />
          <Route path="/critical" element={<CriticalTab />} />
        </Routes>
      </div>
    </div>
  );
}
