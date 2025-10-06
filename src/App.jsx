// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'; // Añadimos Navigate aquí
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import useLocalStorage from './hooks/useLocalStorage';
import { MdMenu, MdSchool, MdDashboard, MdMenuBook, MdChecklist, MdCalendarToday, MdAssignment, MdAnalytics, MdPerson, MdBrightness4, MdBrightness7, MdAdd } from 'react-icons/md'; // Importa los iconos
import './styles/App.css';
import Dashboard from './pages/Dashboard/Dashboard';
import Subjects from './pages/Subjects/Subjets';
import Tasks from './pages/Tasks/Tasks';
import CalendarPage from './pages/CalendarPage/CalendarPage';
import Exams from './pages/Exams/Exams';
import Stats from './pages/Stats/Stats';
import Profile from './pages/Profile/Profile';
import AuthPage from './pages/AuthPage/AuthPage';

// Componente de la barra de navegación
const NavigationBar = ({ activePage, setActivePage, theme, toggleTheme, menuOpen, setMenuOpen, profile }) => { // Recibe profile
    const location = useLocation();

    useEffect(() => {
        // Actualiza la página activa basada en la ruta actual
        const path = location.pathname.slice(1); // Remueve el '/'
        if (path) setActivePage(path);
        else setActivePage('dashboard');
        // Cierra el menú móvil al cambiar de página
        if (window.innerWidth <= 768) {
            setMenuOpen(false);
        }
    }, [location, setActivePage, setMenuOpen]);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <MdDashboard /> },
        { id: 'subjects', label: 'Materias', icon: <MdMenuBook /> },
        { id: 'tasks', label: 'Tareas', icon: <MdChecklist /> },
        { id: 'calendar', label: 'Calendario', icon: <MdCalendarToday /> },
        { id: 'exams', label: 'Exámenes', icon: <MdAssignment /> },
        { id: 'stats', label: 'Estadísticas', icon: <MdAnalytics /> },
        { id: 'profile', label: 'Perfil', icon: <MdPerson /> },
    ];

    return (
        <aside className={`navigation-bar ${menuOpen ? 'open' : ''}`} id="navigationBar">
            <div className="logo">
                <MdSchool className="logo-icon" /> {/* Reemplaza el span con el icono */}
                <span className="logo-text">Agenda Digital</span>
            </div>
            <div className="nav-section">
                <div className="nav-section-title">Principal</div>
                {navItems.slice(0, 3).map(item => (
                    <Link
                        key={item.id}
                        to={`/${item.id}`}
                        className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => setActivePage(item.id)}
                    >
                        {item.icon} {/* Renderiza el icono directamente */}
                        {item.label}
                    </Link>
                ))}
            </div>
            <div className="nav-section">
                <div className="nav-section-title">Planificación</div>
                {navItems.slice(3, 5).map(item => (
                    <Link
                        key={item.id}
                        to={`/${item.id}`}
                        className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => setActivePage(item.id)}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                ))}
            </div>
            <div className="nav-section">
                <div className="nav-section-title">Análisis</div>
                <Link
                    to="/stats"
                    className={`nav-item ${activePage === 'stats' ? 'active' : ''}`}
                    onClick={() => setActivePage('stats')}
                >
                    <MdAnalytics />
                    Estadísticas
                </Link>
            </div>
            <div className="nav-section">
                <div className="nav-section-title">Cuenta</div>
                <Link
                    to="/profile"
                    className={`nav-item ${activePage === 'profile' ? 'active' : ''}`}
                    onClick={() => setActivePage('profile')}
                >
                    <MdPerson />
                    Perfil
                </Link>
            </div>
        </aside>
    );
};

// Componente de la cabecera
const Header = ({ activePage, theme, toggleTheme }) => {
    return (
        <header className="header">
            <h1 className="page-title" id="pageTitle">
                {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
            </h1>
            <div className="user-actions">
                <button className="theme-toggle" id="themeToggle" onClick={toggleTheme}>
                    {theme === 'dark' ? <MdBrightness7 /> : <MdBrightness4 />} {/* Reemplaza el span con el icono */}
                </button>
            </div>
        </header>
    );
};

// Componente FAB (ahora integrado en AppContent)
const Fab = ({ onAddTask, onAddSubject, onAddExam }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleItemClick = (action) => {
        action();
        setIsOpen(false); // Cierra el menú después de la acción
    };

    return (
        <div className="fab-container">
            <button className="fab" onClick={toggleMenu}>
                <MdAdd />
            </button>
            <div className={`fab-menu ${isOpen ? 'open' : ''}`}>
                <button className="fab-menu-item" onClick={() => handleItemClick(onAddTask)}>
                    <MdChecklist />
                    <span className="fab-menu-item-label">Tarea</span>
                </button>
                <button className="fab-menu-item" onClick={() => handleItemClick(onAddSubject)}>
                    <MdMenuBook />
                    <span className="fab-menu-item-label">Materia</span>
                </button>
                <button className="fab-menu-item" onClick={() => handleItemClick(onAddExam)}>
                    <MdAssignment />
                    <span className="fab-menu-item-label">Examen</span>
                </button>
            </div>
        </div>
    );
};

// Componente principal de la aplicación
function AppContent() {
    const [activePage, setActivePage] = useState('dashboard');
    const [theme, setTheme] = useLocalStorage('theme', 'light');
    const [menuOpen, setMenuOpen] = useState(false);

    // Estados para modales globales del FAB
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [showExamModal, setShowExamModal] = useState(false);

    const [profile] = useLocalStorage('profile', { fullName: 'Usuario', email: '', phone: '', photoURL: '' }); // Cargamos el perfil

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }, [theme]);

    // Efecto para cerrar el menú al hacer clic fuera en móviles
    useEffect(() => {
        const handleClickOutside = (event) => {
            const navigationBar = document.getElementById('navigationBar');
            const menuToggle = document.getElementById('menuToggle');

            if (
                window.innerWidth <= 768 &&
                menuOpen &&
                navigationBar &&
                menuToggle &&
                !navigationBar.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [menuOpen]);

    const handleAddTask = () => {
        setShowTaskModal(true);
    };

    const handleAddSubject = () => {
        setShowSubjectModal(true);
    };

    const handleAddExam = () => {
        setShowExamModal(true);
    };

    // Funciones para cerrar modales
    const handleCloseTaskModal = () => setShowTaskModal(false);
    const handleCloseSubjectModal = () => setShowSubjectModal(false);
    const handleCloseExamModal = () => setShowExamModal(false);

    return (
        <div className="app-container">
            {/* Botón de menú para móviles */}
            <button
                className={`menu-toggle ${menuOpen ? 'hidden' : ''}`}
                id="menuToggle"
                onClick={toggleMenu}
            >
                <MdMenu /> {/* Reemplaza el span con el icono */}
            </button>

            {/* Barra de navegación */}
            <NavigationBar
                activePage={activePage}
                setActivePage={setActivePage}
                theme={theme}
                toggleTheme={toggleTheme}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                profile={profile} // Pasa profile al componente
            />

            {/* Contenido principal */}
            <main className="main-content" id="mainContent">
                <Header activePage={activePage} theme={theme} toggleTheme={toggleTheme} />
                <div id="pageContent">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/subjects" element={<Subjects showSubjectModal={showSubjectModal} onCloseSubjectModal={handleCloseSubjectModal} />} />
                        <Route path="/tasks" element={<Tasks showTaskModal={showTaskModal} onCloseTaskModal={handleCloseTaskModal} />} />
                        <Route path="/calendar" element={<CalendarPage showTaskModal={showTaskModal} onCloseTaskModal={handleCloseTaskModal} />} />
                        <Route path="/exams" element={<Exams showExamModal={showExamModal} onCloseExamModal={handleCloseExamModal} />} />
                        <Route path="/stats" element={<Stats />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </div>
                {/* Agregar el FAB aquí dentro del main content */}
                <Fab onAddTask={handleAddTask} onAddSubject={handleAddSubject} onAddExam={handleAddExam} />
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
            <Routes>
                <Route path="/auth" element={!userUID ? <AuthPage /> : <Navigate to="/dashboard" />} />
                <Route path="/*" element={userUID ? <AppContent /> : <Navigate to="/auth" />} />
            </Routes>
        </Router>
    );
}

export default App;