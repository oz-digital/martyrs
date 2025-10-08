import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import InitiativesListPage from './pages/InitiativesListPage';
import InitiativeDetailPage from './pages/InitiativeDetailPage';
import InitiativeMilestonesPage from './pages/InitiativeMilestonesPage';
import RoadmapPage from './pages/RoadmapPage';
import MilestoneDetailPage from './pages/MilestoneDetailPage';
import TaskDetailPage from './pages/TaskDetailPage';
import VotingsListPage from './pages/VotingsListPage';
import VotingDetailPage from './pages/VotingDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InitiativesListPage />} />
        <Route path="/initiatives/:id" element={<InitiativeDetailPage />} />
        <Route path="/initiatives/:id/milestones" element={<InitiativeMilestonesPage />} />
        <Route path="/initiatives/:id/roadmap" element={<RoadmapPage />} />
        <Route path="/milestones/:id" element={<MilestoneDetailPage />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="/votings" element={<VotingsListPage />} />
        <Route path="/votings/:id" element={<VotingDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
