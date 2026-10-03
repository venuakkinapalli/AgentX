import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { StudentList } from './components/StudentList';
import { AddStudentForm } from './components/AddStudentForm';
import { ComplaintList } from './components/ComplaintList';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { Student } from './types/student';
import { fetchStudents, checkHealth } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'overview' | 'students' | 'add-student' | 'complaints'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<string>('database');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchStudents();
      setStudents(result.students);
      setStorageMode(result.storageType);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.message || 'Failed to connect to backend server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyHealth = useCallback(async () => {
    try {
      const health = await checkHealth();
      setStorageMode(health.mode);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadStudents();
    verifyHealth();
  }, [loadStudents, verifyHealth]);

  const handleStudentAdded = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: `Student ${newStudent.name} (${newStudent.phone}) enrolled successfully into ${newStudent.hostel_name}!`,
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Fixed Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        storageMode={storageMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          onNavigateAdd={() => setCurrentTab('add-student')}
          storageMode={storageMode}
          totalStudents={students.length}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <DashboardOverview
              students={students}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              storageMode={storageMode}
            />
          )}

          {currentTab === 'students' && (
            <StudentList
              students={students}
              isLoading={isLoading}
              error={error}
              onRefresh={loadStudents}
              onNavigateAdd={() => setCurrentTab('add-student')}
            />
          )}

          {currentTab === 'add-student' && (
            <AddStudentForm
              onStudentAdded={handleStudentAdded}
              onNavigateToList={() => setCurrentTab('students')}
            />
          )}

          {currentTab === 'complaints' && (
            <ComplaintList />
          )}
        </main>
      </div>

      {/* Floating Alert Toast */}
      <NotificationToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default App;
