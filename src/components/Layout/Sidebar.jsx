import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    CalendarDays,
    BookOpen,
    GraduationCap,
    CheckSquare,
    Settings,
    Menu,
    X,
    LogOut
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import Modal from '../../components/Modal/Modal';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: 'Inicio', path: '/dashboard' },
        { icon: CheckSquare, label: 'Tareas', path: '/tasks' },
        { icon: CalendarDays, label: 'Calendario', path: '/calendar' },
        { icon: BookOpen, label: 'Materias', path: '/subjects' },
        { icon: GraduationCap, label: 'Exámenes', path: '/exams' },
    ];

    const handleLogoutValues = () => {
        signOut(auth);
        setShowLogoutConfirm(false);
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface backdrop-blur-md border border-white/5 rounded-xl text-text-primary shadow-lg"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Backdrop for Mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 z-40 h-screen w-20 lg:w-64
                bg-surface/80 lg:bg-surface/40 backdrop-blur-xl border-r border-white/5
                transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col h-full py-8 px-4">
                    {/* Logo area */}
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                            <GraduationCap className="text-white" size={24} />
                        </div>
                        <span className="hidden lg:block text-xl font-bold font-display tracking-tight text-text-primary">
                            Agendita
                        </span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                                    }
                                `}
                            >
                                <item.icon size={22} className="shrink-0" />
                                <span className="hidden lg:block font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="mt-auto space-y-2 pt-6 border-t border-white/5">
                        <NavLink to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-xl text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors">
                            <Settings size={22} />
                            <span className="hidden lg:block font-medium">Configuración</span>
                        </NavLink>
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-accent-urgent hover:bg-accent-urgent/10 transition-colors"
                        >
                            <LogOut size={22} />
                            <span className="hidden lg:block font-medium">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <Modal title="Cerrar Sesión" onClose={() => setShowLogoutConfirm(false)}>
                    <div className="space-y-4">
                        <p className="text-text-secondary">
                            ¿Estás seguro de que querés cerrar sesión? Tendrás que ingresar tus datos nuevamente para entrar.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl border border-white/10 text-text-secondary hover:text-white hover:bg-white/5 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleLogoutValues}
                                className="flex-1 py-2.5 rounded-xl bg-accent-urgent text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 font-medium"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default Sidebar;
