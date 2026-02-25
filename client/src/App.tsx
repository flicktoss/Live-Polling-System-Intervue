import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import RoleSelect from './components/RoleSelect';
import TeacherLanding from './components/TeacherLanding';
import StudentLanding from './components/StudentLanding';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import KickedOut from './components/KickedOut';

const TeacherPage: React.FC = () => {
  const { state } = useApp();
  if (state.isJoined && state.role === 'teacher') return <TeacherDashboard />;
  return <TeacherLanding />;
};

const StudentPage: React.FC = () => {
  const { state } = useApp();
  if (state.isKicked) return <KickedOut />;
  if (state.isJoined && state.role === 'student') return <StudentDashboard />;
  return <StudentLanding />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              style: { background: '#10b981' },
            },
            error: {
              style: { background: '#ef4444' },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<RoleSelect />} />
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="/student" element={<StudentPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
