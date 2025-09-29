import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './styles/App.css'; // Asegúrate de importar el CSS principal aquí si no lo estás haciendo en main.jsx
import {MdMenu, MdSchool, MdDashboard, MdMenuBook, MdChecklist, MdCalendarToday, MdAssignment, MdAnalytics, MdPerson, MdBrightness4, MdBrightness7 } from 'react-icons/md'; 
import useLocalStorage from './hooks/useLocalStorage';
import Dashboard from './pages/Dashboard/Dashboard';
import Subjects from './pages/Subjects/Subjets';
import Tasks from './pages/Tasks/Tasks';
import CalendarPage from './pages/CalendarPage/CalendarPage';
import Exams from './pages/Exams/Exams';
import Stats from './pages/Stats/Stats';
import Profile from './pages/Profile/Profile';

// Componente de la barra de navegación
const NavigationBar = ({ activePage, setActivePage, theme, toggleTheme, menuOpen, setMenuOpen }) => {
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
        { id: 'dashboard', label: 'Dashboard', icon: <MdDashboard/> },
        { id: 'subjects', label: 'Materias', icon: <MdMenuBook/> },
        { id: 'tasks', label: 'Tareas', icon: <MdChecklist/> },
        { id: 'calendar', label: 'Calendario', icon: <MdCalendarToday/> },
        { id: 'exams', label: 'Exámenes', icon: <MdAssignment/> },
        { id: 'stats', label: 'Estadísticas', icon: <MdAnalytics /> },
        { id: 'profile', label: 'Perfil', icon: <MdPerson /> },
    ];

    return (
        <aside className={`navigation-bar ${menuOpen ? 'open' : ''}`} id="navigationBar">
            <div className="logo">
                <MdSchool/>
                <span className="logo-text"> Agendita </span>
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
                        <span className="">{item.icon}</span>
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
                        <span className="">{item.icon}</span>
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

// Componente principal de la aplicación
function App() {
    const [activePage, setActivePage] = useState('dashboard');
    const [theme, setTheme] = useLocalStorage('theme', 'light');
    const [menuOpen, setMenuOpen] = useState(false); // Estado para el menú móvil

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

    return (
        <Router>
            {/* Botón de menú para móviles */}
            <button
                className={`menu-toggle ${menuOpen ? 'hidden' : ''}`}
                id="menuToggle"
                onClick={toggleMenu}
            >
                <MdMenu/>
            </button>

            <div className="app-container">
                {/* Barra de navegación */}
                <NavigationBar
                    activePage={activePage}
                    setActivePage={setActivePage}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    menuOpen={menuOpen}
                    setMenuOpen={setMenuOpen}
                />

                {/* Contenido principal */}
                <main className="main-content" id="mainContent">
                    <header className="header">
                        <h1 className="page-title" id="pageTitle">
                            {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
                        </h1>
                        <div className="user-actions">
                            <button className="theme-toggle" id="themeToggle" onClick={toggleTheme}>
                                <span className="">
                                    {theme === 'dark' ? <MdBrightness7/> : <MdBrightness4/>}
                                </span>
                            </button>
                        </div>
                    </header>
                    <div id="pageContent">
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
                </main>
            </div>
        </Router>
    );
}

export default App;