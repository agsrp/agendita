// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'; // Añadimos Navigate aquí
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import useLocalStorage from './hooks/useLocalStorage';
import useFcm from './hooks/useFcm';
import useReminders from './hooks/useReminders'; // Importa el hook de recordatorios
import { LuMenu, LuGraduationCap, LuLayoutDashboard, LuBookOpen, LuListTodo, LuCalendar, LuClipboardList, LuTrendingUp, LuUser, LuMoon, LuSun } from 'react-icons/lu'; // Importa los iconos
import { db } from './firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import Modal from './components/Modal/Modal';
import TaskForm from './components/TaskForm/TaskForm';
import SubjectForm from './components/SubjectForm/SubjectForm';
import ExamForm from './components/ExamForm/ExamForm';
// import './styles/App.css'; // REMOVED
import Dashboard from './pages/Dashboard/Dashboard';
import Subjects from './pages/Subjects/Subjects';
import Tasks from './pages/Tasks/Tasks';
import CalendarPage from './pages/CalendarPage/CalendarPage';
import Exams from './pages/Exams/Exams';
import Stats from './pages/Stats/Stats';
import Profile from './pages/Profile/Profile';
import AuthPage from './pages/AuthPage/AuthPage';

// Componente de la barra de navegación (REMOVED)
// Componente de la cabecera (REMOVED)
// Componente FAB (REMOVED)

import Sidebar from './components/Layout/Sidebar';
import SpeedDial from './components/Fab/SpeedDial';
import IosInstallPrompt from './components/IosInstallPrompt/IosInstallPrompt';


// Componente principal de la aplicación
function AppContent() {
    const [theme, setTheme] = useLocalStorage('theme', 'dark'); // Default to dark for new aesthetic

    // Modals state
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [showExamModal, setShowExamModal] = useState(false);

    const [userUID] = useLocalStorage('userUID', null);
    const fcmState = useFcm(userUID);
    useReminders(userUID); // Activa los recordatorios periódicos

    // Data fetching (Subjects)
    const [subjects, setSubjects] = useState([]);
    useEffect(() => {
        if (!userUID) return;
        const unsubscribe = onSnapshot(collection(db, "users", userUID, "subjects"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSubjects(data);
        });
        return () => unsubscribe();
    }, [userUID]);

    // Handlers
    const handleCreateTask = async (formData) => {
        if (!userUID) return;
        await addDoc(collection(db, "users", userUID, "tasks"), { completed: false, ...formData });
        setShowTaskModal(false);
    };

    const handleCreateSubject = async (formData) => {
        if (!userUID) return;
        await addDoc(collection(db, "users", userUID, "subjects"), formData);
        setShowSubjectModal(false);
    };

    const handleCreateExam = async (formData) => {
        if (!userUID) return;
        await addDoc(collection(db, "users", userUID, "exams"), { preparation: 0, ...formData });
        setShowExamModal(false);
    };

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary/30">
            <Sidebar />

            {/* Main Content Area */}
            <main className="lg:ml-64 min-h-screen transition-all duration-300">
                <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
                    {/* Header could be dynamic/per page, for now just route outlet */}
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/subjects" element={<Subjects />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/calendar" element={<CalendarPage />} />
                        <Route path="/exams" element={<Exams />} />
                        <Route path="/stats" element={<Stats />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </div>

                {/* Floating Action Button (Modernized) */}
                {/* Floating Action Button (Speed Dial) */}
                <SpeedDial
                    onAddTask={() => setShowTaskModal(true)}
                    onAddExam={() => setShowExamModal(true)}
                    onAddSubject={() => setShowSubjectModal(true)}
                />

                {/* Modals */}
                {showTaskModal && (
                    <Modal title="Nueva Tarea" onClose={() => setShowTaskModal(false)}>
                        <TaskForm onSubmit={handleCreateTask} subjects={subjects} />
                    </Modal>
                )}
                {showSubjectModal && (
                    <Modal title="Nueva Materia" onClose={() => setShowSubjectModal(false)}>
                        <SubjectForm onSubmit={handleCreateSubject} />
                    </Modal>
                )}
                {showExamModal && (
                    <Modal title="Nuevo Examen" onClose={() => setShowExamModal(false)}>
                        <ExamForm onSubmit={handleCreateExam} subjects={subjects} />
                    </Modal>
                )}
                {/* Mobile Debug Overlay - ALWAYS VISIBLE */}
                <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white text-[10px] p-2 z-[9999] break-words font-mono opacity-80 pointer-events-none">
                    <div className="flex justify-between items-center mb-1">
                        <span className={fcmState.permissionStatus === 'granted' ? 'text-green-400' : 'text-yellow-400'}>
                            Perm: {fcmState.permissionStatus}
                        </span>
                        <span className={fcmState.fcmToken ? 'text-green-400' : 'text-red-400'}>
                            {fcmState.fcmToken ? 'Token OK' : 'No Token'}
                        </span>
                    </div>
                    {fcmState.error && <div className="text-red-500 font-bold">{fcmState.error}</div>}
                    {!fcmState.fcmToken && !fcmState.error && <div className="text-blue-400">Requesting...</div>}
                </div>
            </main>


        </div>
    );
}

function App() {
    const [userUID, setUserUID] = useLocalStorage('userUID', null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserUID(user.uid);
            } else {
                setUserUID(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setUserUID]);

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <Router>
            <IosInstallPrompt />
            <Routes>
                <Route path="/auth" element={!userUID ? <AuthPage /> : <Navigate to="/dashboard" />} />
                <Route path="/*" element={userUID ? <AppContent /> : <Navigate to="/auth" />} />
            </Routes>
        </Router>
    );
}

export default App;