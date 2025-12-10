import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import {
    collection,
    onSnapshot,
    addDoc,
    doc
} from "firebase/firestore";
import useLocalStorage from '../../hooks/useLocalStorage';
import Card from '../../components/Card/Card';
import {
    CheckSquare,
    CalendarDays,
    TrendingUp,
    AlertTriangle,
    ClipboardList,
    ListTodo,
    Clock,
    Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Modal from '../../components/Modal/Modal';
import TaskForm from '../../components/TaskForm/TaskForm';
import ExamForm from '../../components/ExamForm/ExamForm';
import NotificationPermissionBanner from '../../components/NotificationPermissionBanner/NotificationPermissionBanner';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [exams, setExams] = useState([]);
    const [userUID] = useLocalStorage("userUID", null);
    const [userName, setUserName] = useState('Estudiante');

    // Modals state
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showExamModal, setShowExamModal] = useState(false);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        if (!userUID) return;

        // Subscribe to User Profile
        const unsubscribeProfile = onSnapshot(doc(db, "users", userUID), (docSnap) => {
            if (docSnap.exists() && docSnap.data().fullName) {
                setUserName(docSnap.data().fullName.split(' ')[0]);
            }
        });

        const unsubscribeTasks = onSnapshot(collection(db, "users", userUID, "tasks"), (snap) => {
            setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubscribeExams = onSnapshot(collection(db, "users", userUID, "exams"), (snap) => {
            setExams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubscribeSubjects = onSnapshot(collection(db, "users", userUID, "subjects"), (snap) => {
            setSubjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubscribeProfile();
            unsubscribeTasks();
            unsubscribeExams();
            unsubscribeSubjects();
        };
    }, [userUID]);

    // Calculations
    const pendingTasksCount = tasks.filter(t => !t.completed).length;

    const top3PendingTasks = tasks
        .filter(t => !t.completed && t.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    const top3Exams = exams
        .filter(e => e.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    const completedPercentage =
        tasks.length ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

    const examsWithScore = exams.filter(e => e.score !== null && e.score !== undefined);
    const averageScore = examsWithScore.length > 0
        ? (examsWithScore.reduce((sum, e) => sum + e.score, 0) / examsWithScore.length).toFixed(2)
        : 'N/A';

    // Upcoming Events logic
    const getUpcomingEvents = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);

        const upcomingTasks = tasks.filter(t => {
            if (t.completed || !t.date) return false;
            const taskDate = new Date(t.date);
            const taskDateLocal = new Date(taskDate.getUTCFullYear(), taskDate.getUTCMonth(), taskDate.getUTCDate());
            return taskDateLocal >= today && taskDateLocal <= threeDaysFromNow;
        }).map(t => ({ ...t, type: 'Tarea', dateObj: new Date(t.date) }));

        const upcomingExams = exams.filter(e => {
            if (!e.date) return false;
            const examDate = new Date(e.date);
            const examDateLocal = new Date(examDate.getUTCFullYear(), examDate.getUTCMonth(), examDate.getUTCDate());
            return examDateLocal >= today && examDateLocal <= threeDaysFromNow;
        }).map(e => ({ ...e, type: 'Examen', dateObj: new Date(e.date) }));

        return [...upcomingTasks, ...upcomingExams].sort((a, b) => a.dateObj - b.dateObj);
    };

    const upcomingEvents = getUpcomingEvents();

    // Calendar logic
    const getEventsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayTasks = tasks.filter(task => task.date === dateStr && !task.completed);
        const dayExams = exams.filter(exam => exam.date === dateStr);
        return [...dayTasks, ...dayExams];
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dayEvents = getEventsForDate(date);
            if (dayEvents.length > 0) {
                return (
                    <div className="flex gap-1 justify-center mt-1">
                        {dayEvents.map((event, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${event.score !== undefined ? 'bg-purple-500' : 'bg-primary'}`}
                                title={event.title}
                            />
                        ))}
                    </div>
                );
            }
        }
        return null;
    };

    // Handlers
    const handleDateClick = (date) => {
        setSelectedDate(date);
        setShowEventModal(true);
    };

    const handleAddTaskClick = () => {
        setShowEventModal(false);
        setShowTaskModal(true);
    };

    const handleAddExamClick = () => {
        setShowEventModal(false);
        setShowExamModal(true);
    };

    const handleTaskFormSubmit = async (newTaskData) => {
        if (!newTaskData) {
            setShowTaskModal(false);
            return;
        }
        await addDoc(collection(db, "users", userUID, "tasks"), {
            ...newTaskData,
            completed: false
        });
        setShowTaskModal(false);
    };

    const handleExamFormSubmit = async (newExamData) => {
        if (!newExamData) {
            setShowExamModal(false);
            return;
        }
        await addDoc(collection(db, "users", userUID, "exams"), {
            preparation: 0,
            ...newExamData
        });
        setShowExamModal(false);
    };

    const eventsForSelectedDate = selectedDate ? getEventsForDate(selectedDate) : [];

    const formatDateForDisplay = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    const formatDateString = (dateString, options = { day: 'numeric', month: 'short' }) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('es-ES', options);
    };

    return (
        <div className="space-y-6">
            {/* Welcome Message */}
            <div className="mb-2 pt-12 lg:pt-0">
                <h1 className="text-4xl font-display font-bold text-white mb-2">
                    Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">{userName}</span> 👋
                </h1>
            </div>

            {/* Notification Banner */}
            <NotificationPermissionBanner />

            {/* Bento Grid Main Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">

                {/* Urgentes Card - Compact 1x1 */}
                <div className="md:col-span-1">
                    <Card
                        title="Urgentes"
                        icon={<AlertTriangle size={20} className="text-white" />}
                        className="bg-gradient-to-br from-accent-urgent to-red-600 border-none text-white shadow-2xl shadow-accent-urgent/20 h-full"
                    >
                        <div className="space-y-2 mt-2">
                            {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 3).map((event, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={`p-1.5 rounded-md ${event.type === 'Examen' ? 'bg-purple-500/20' : 'bg-orange-500/20'}`}>
                                            {event.type === 'Examen' ? <CalendarDays size={14} className="text-white" /> : <CheckSquare size={14} className="text-white" />}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-xs truncate text-white">{event.title}</h4>
                                            <p className="text-[10px] text-white/70 truncate">{event.subject}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-[10px] font-medium bg-white/20 px-1.5 py-0.5 rounded-full text-white">
                                            {formatDateString(event.date)}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-6 text-white/80">
                                    <p className="text-sm">¡Todo al día! 🎉</p>
                                    <p className="text-xs mt-1 text-white/60">No tenés entregas cercanas.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Stats Widget (Donut / Progress) - Span 1 */}
                <Card title="Progreso" icon={<TrendingUp size={20} />} className="min-h-[200px]">
                    <div className="space-y-6 mt-2">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-text-secondary">Tareas Completadas</span>
                                <span className="font-bold text-primary">{completedPercentage}%</span>
                            </div>
                            <div className="h-2 bg-surface rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completedPercentage}%` }}
                                    transition={{ duration: 1 }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-text-secondary">Promedio Exámenes</span>
                                <span className="font-bold text-accent-success">{averageScore !== 'N/A' ? averageScore : '-'}</span>
                            </div>
                            {averageScore !== 'N/A' && (
                                <div className="h-2 bg-surface rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-accent-success"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((parseFloat(averageScore) / 10) * 100, 100)}%` }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Pending Tasks - Span 1 */}
                <Card title="Pendientes" icon={<CheckSquare size={20} />} className="min-h-[200px]">
                    <div className="space-y-3">
                        {top3PendingTasks.length > 0 ? top3PendingTasks.map(task => (
                            <div key={task.id} className="p-3 rounded-xl bg-surface/30 hover:bg-surface/50 transition-colors border border-white/5">
                                <div className="font-medium text-sm truncate">{task.title}</div>
                                <div className="flex justify-between text-xs text-text-secondary mt-1">
                                    <span>{task.subject}</span>
                                    <span className={task.priority === 'high' ? 'text-accent-urgent' : ''}>
                                        {formatDateString(task.date)}
                                    </span>
                                </div>
                            </div>
                        )) : <p className="text-sm text-text-secondary">No hay tareas pendientes.</p>}
                    </div>
                </Card>

                {/* Next Exams - Span 1 */}
                <Card title="Exámenes" icon={<CalendarDays size={20} />} className="min-h-[200px]">
                    <div className="space-y-3">
                        {top3Exams.length > 0 ? top3Exams.map(exam => (
                            <div key={exam.id} className="p-3 rounded-xl bg-surface/30 hover:bg-surface/50 transition-colors border border-white/5 border-l-2 border-l-purple-500">
                                <div className="font-medium text-sm truncate">{exam.title || exam.subject}</div>
                                <div className="flex justify-between text-xs text-text-secondary mt-1">
                                    <span>{exam.subject}</span>
                                    <span>{exam.time}</span>
                                </div>
                                <div className="text-xs text-text-secondary mt-1 text-right">
                                    {formatDateString(exam.date)}
                                </div>
                            </div>
                        )) : <p className="text-sm text-text-secondary">No hay exámenes próximos.</p>}
                    </div>
                </Card>

                {/* Calendar - Span 2 Columns, 2 Rows on Desktop */}
                <div className="md:col-span-2 lg:row-span-2">
                    <Card title="Calendario" icon={<CalendarDays size={20} />} className="h-full">
                        <div className="p-2 flex justify-center h-full">
                            <Calendar
                                tileContent={tileContent}
                                locale="es-ES"
                                formatDay={(locale, date) => date.getDate()}
                                onClickDay={handleDateClick}
                                className="w-full text-sm"
                            />
                        </div>
                    </Card>
                </div>

                {/* Recent Tasks List - Span 1 Column */}
                <div className="md:col-span-1 lg:col-span-1">
                    <Card title="Recientes" icon={<ListTodo size={20} />}>
                        <ul className="space-y-2">
                            {tasks.slice(0, 5).map(task => (
                                <li key={task.id} className="text-sm border-b border-white/5 pb-2 last:border-0">
                                    <div className="font-medium">{task.title}</div>
                                    <div className="text-xs text-text-secondary">{task.subject}</div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>

            {/* Modals Reuse */}
            {showEventModal && (
                <Modal title={`Eventos ${formatDateForDisplay(selectedDate)}`} onClose={() => setShowEventModal(false)}>
                    {eventsForSelectedDate.length > 0 ? (
                        <div className="space-y-3 mb-6">
                            {eventsForSelectedDate.map((event, i) => (
                                <div key={i} className="bg-surface p-3 rounded-xl border border-white/10">
                                    <div className="font-bold">{event.title}</div>
                                    <div className="text-sm text-text-secondary">{event.subject}</div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="mb-6 text-text-secondary">No hay eventos.</p>}

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleAddTaskClick} className="bg-primary text-white py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                            + Tarea
                        </button>
                        <button onClick={handleAddExamClick} className="bg-purple-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
                            + Examen
                        </button>
                    </div>
                </Modal>
            )}

            {showTaskModal && (
                <Modal title="Nueva Tarea" onClose={() => setShowTaskModal(false)}>
                    <TaskForm onSubmit={handleTaskFormSubmit} initialDate={selectedDate} subjects={subjects} />
                </Modal>
            )}
            {showExamModal && (
                <Modal title="Nuevo Examen" onClose={() => setShowExamModal(false)}>
                    <ExamForm onSubmit={handleExamFormSubmit} initialDate={selectedDate} subjects={subjects} />
                </Modal>
            )}
        </div>
    );
};

export default Dashboard;
