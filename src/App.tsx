import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import AttendancePage from './pages/Attendance';
import MembersPage from './pages/Members';
import UsersPage from './pages/Users';
import ReportsPage from './pages/Reports';
import Layout from './components/Sidebar/Layout';

type User = {
  id: string;
  name: string;
  role: string;
  username: string;
};

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  if (!currentUser) {
    return <LoginPage onLoginSuccess={setCurrentUser} />;
  }

  return (
    <BrowserRouter>
      <Layout currentUser={currentUser} onLogout={() => setCurrentUser(null)}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;