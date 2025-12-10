import React, { useState, useEffect } from 'react';
import { ClipboardList, ListTodo } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { db } from '../../firebase';
import { collection, getDocs, addDoc } from "firebase/firestore";
import useLocalStorage from '../../hooks/useLocalStorage';
import Modal from '../../components/Modal/Modal';
import TaskForm from '../../components/TaskForm/TaskForm';
import ExamForm from '../../components/ExamForm/ExamForm';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarPage = () => {
    const [value, onChange] = useState(new Date());

    const [tasks, setTasks] = useState([]);
    const [exams, setExams] = useState([]);

    const [userUID] = useLocalStorage("userUID", null);

    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showExamModal, setShowExamModal] = useState(false);

    //  Cargar tareas desde Firestore
    const loadTasks = async () => {
        if (!userUID) return;
        const snap = await getDocs(collection(db, "users", userUID, "tasks"));
        setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    //  Cargar exámenes desde Firestore
    const loadExams = async () => {
        if (!userUID) return;
        const snap = await getDocs(collection(db, "users", userUID, "exams"));
        setExams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const [subjects, setSubjects] = useState([]);
    useEffect(() => {
        if (!userUID) return;
        const unsubscribe = getDocs(collection(db, "users", userUID, "subjects")).then(snap => {
            setSubjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }, [userUID]);


    useEffect(() => {
        loadTasks();
        loadExams();
    }, [userUID]);

    // Combinar eventos por fecha
    const getEventsForDate = (date) => {
        const dateStr = date.toLocaleDateString('en-CA');
        const dayTasks = tasks.filter(task => task.date === dateStr);
        const dayExams = exams.filter(exam => exam.date === dateStr);
        return [...dayTasks, ...dayExams];
    };

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

    //  Guardar tarea nueva desde el calendario
    const handleTaskFormSubmit = async (newTaskData) => {
        if (!newTaskData) {
            setShowTaskModal(false);
            return;
        }
        await addDoc(collection(db, "users", userUID, "tasks"), {
            ...newTaskData,
            completed: false
        });

        await loadTasks();
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

        await loadExams();
        setShowExamModal(false);
    };

    const eventsForSelectedDate = selectedDate ? getEventsForDate(selectedDate) : [];

    const formatDateForDisplay = (date) => {
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                                className={`w-1.5 h-1.5 rounded-full ${event.score !== undefined ? 'bg-accent-urgent' : 'bg-primary'}`}
                                title={event.title}
                            />
                        ))}
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 max-w-7xl mx-auto space-y-8"
        >
            <div>
                <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">
                    Calendario Académico
                </h1>
                <p className="text-text-secondary mt-1">Planifica tus entregas y exámenes</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl backdrop-blur-xl">
                <style>{`
                    .react-calendar {
                        background: transparent;
                        border: none;
                        width: 100%;
                        font-family: 'Inter', sans-serif;
                    }
                    .react-calendar__navigation button {
                        color: #F8FAFC;
                        min-width: 44px;
                        background: none;
                        font-size: 1.1rem;
                        font-weight: 600;
                    }
                    .react-calendar__navigation button:enabled:hover,
                    .react-calendar__navigation button:enabled:focus {
                        background-color: rgba(255, 255, 255, 0.05);
                        border-radius: 8px;
                    }
                    .react-calendar__month-view__weekdays__weekday {
                        color: #94A3B8;
                        text-decoration: none;
                        font-weight: 500;
                        font-size: 0.85rem;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }
                    .react-calendar__tile {
                        color: #F8FAFC;
                        padding: 1rem 0.5rem;
                        background: none;
                        border-radius: 12px;
                        transition: all 0.2s;
                    }
                    .react-calendar__tile:enabled:hover,
                    .react-calendar__tile:enabled:focus {
                        background-color: rgba(99, 102, 241, 0.1);
                        color: #6366F1;
                    }
                    .react-calendar__tile--now {
                        background: rgba(99, 102, 241, 0.2);
                        color: #6366F1;
                        font-weight: bold;
                    }
                    .react-calendar__tile--active {
                        background: #6366F1 !important;
                        color: white !important;
                    }
                    .react-calendar__month-view__days__day--neighboringMonth {
                        color: rgba(148, 163, 184, 0.3);
                    }
                `}</style>
                <Calendar
                    onChange={onChange}
                    value={value}
                    onClickDay={handleDateClick}
                    tileContent={tileContent}
                    locale="es-ES"
                    formatDay={(locale, date) =>
                        date.toLocaleDateString('es-ES', { day: 'numeric' })
                    }
                />
            </div>

            {/* Modal de eventos */}
            <AnimatePresence>
                {showEventModal && (
                    <Modal
                        title={`Eventos del ${formatDateForDisplay(selectedDate)}`}
                        onClose={() => setShowEventModal(false)}
                    >
                        <div className="space-y-4">
                            {eventsForSelectedDate.length > 0 ? (
                                <ul className="space-y-3">
                                    {eventsForSelectedDate.map((event, i) => (
                                        <li key={i} className="flex items-start gap-4 p-3 bg-surface/50 rounded-xl border border-white/5">
                                            <div className={`p-2 rounded-lg ${event.score !== undefined ? 'bg-accent-urgent/10 text-accent-urgent' : 'bg-primary/10 text-primary'}`}>
                                                {event.score !== undefined ? <ClipboardList size={20} /> : <ListTodo size={20} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-text-primary">{event.title}</div>
                                                <div className="text-sm text-text-secondary mt-0.5">
                                                    {event.subject || event.name}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-text-secondary py-4">No hay eventos para este día</p>
                            )}

                            <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                                <button className="flex-1 bg-primary hover:bg-primary-action/90 text-white rounded-xl px-4 py-2 transition-colors cursor-pointer" onClick={handleAddTaskClick}>
                                    + Tarea
                                </button>
                                <button className="flex-1 bg-surface hover:bg-white/10 text-text-secondary hover:text-text-primary border border-white/10 rounded-xl px-4 py-2 transition-colors cursor-pointer" onClick={handleAddExamClick}>
                                    + Examen
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* Modal para nueva tarea */}
            <AnimatePresence>
                {showTaskModal && (
                    <Modal
                        title={`Nueva Tarea`}
                        onClose={() => setShowTaskModal(false)}
                    >
                        <TaskForm
                            onSubmit={handleTaskFormSubmit}
                            initialDate={selectedDate}
                            subjects={subjects}
                        />
                    </Modal>
                )}
            </AnimatePresence>

            {/* Modal para nuevo examen */}
            <AnimatePresence>
                {showExamModal && (
                    <Modal
                        title={`Nuevo Examen`}
                        onClose={() => setShowExamModal(false)}
                    >
                        <ExamForm
                            onSubmit={handleExamFormSubmit}
                            initialDate={selectedDate}
                            subjects={subjects}
                        />
                    </Modal>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CalendarPage;
