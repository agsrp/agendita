// src/pages/CalendarPage/CalendarPage.jsx
import React, { useState } from 'react';
import Calendar from 'react-calendar'; // Importa el componente de terceros
import 'react-calendar/dist/Calendar.css'; // Importa estilos predeterminados
import useLocalStorage from '../../hooks/useLocalStorage';
import Modal from '../../components/Modal/Modal';
import TaskForm from '../../components/TaskForm/TaskForm';

const CalendarPage = () => {
    const [value, onChange] = useState(new Date());
    const [tasks] = useLocalStorage('tasks', []);
    const [exams] = useLocalStorage('exams', []); // Añadido para mostrar exámenes también
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);

    // Función para obtener eventos (tareas y exámenes) para una fecha específica
    const getEventsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const dayTasks = tasks.filter(task => task.date === dateStr);
        const dayExams = exams.filter(exam => exam.date === dateStr);
        return [...dayTasks, ...dayExams];
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setShowEventModal(true);
    };

    const handleAddEventClick = () => {
        setShowEventModal(false);
        setShowTaskModal(true);
    };

    const handleTaskFormSubmit = (newTaskData) => {
        // Aquí iría la lógica para guardar la tarea, por ejemplo, en el hook de tasks
        console.log("Nueva tarea para fecha:", selectedDate, newTaskData);
        setShowTaskModal(false);
        // Opcionalmente, puedes recargar los datos o actualizar el estado local aquí
    };

    const eventsForSelectedDate = selectedDate ? getEventsForDate(selectedDate) : [];

    const formatDateForDisplay = (date) => {
        return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Función para renderizar eventos en un día del calendario
    const tileContent = ({ date, view }) => {
        if (view === 'month') { // Solo mostrar eventos en la vista mensual
            const dayEvents = getEventsForDate(date);
            if (dayEvents.length > 0) {
                return (
                    <div className="calendar-day-events">
                        {dayEvents.slice(0, 2).map((event, i) => ( // Mostrar solo los primeros 2 eventos
                            <div key={i} className="calendar-day-event">{event.title}</div>
                        ))}
                        {dayEvents.length > 2 && <div className="calendar-day-event">+{dayEvents.length - 2}</div>}
                    </div>
                );
            }
        }
        return null; // No mostrar nada si no hay eventos
    };

    return (
        <div className="card">
            <div className="calendar-container">
                <Calendar
                    onChange={onChange}
                    value={value}
                    onClickDay={handleDateClick}
                    tileContent={tileContent} // Pasa la función para renderizar contenido en los días
                    locale="es-ES" // Asegura el idioma español
                    formatDay={(locale, date) => date.toLocaleDateString('es-ES', { day: 'numeric' })} // Formato del día
                    formatMonthYear={(locale, date) => date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })} // Formato del mes y año
                    formatShortWeekday={(locale, date) => date.toLocaleDateString('es-ES', { weekday: 'short' }).substring(0, 2)} // Formato abreviado del día de la semana
                />
            </div>

            {/* Modal para mostrar eventos del día */}
            {showEventModal && (
                <Modal title={`Eventos del ${formatDateForDisplay(selectedDate)}`} onClose={() => setShowEventModal(false)}>
                    {eventsForSelectedDate.length > 0 ? (
                        <ul>
                            {eventsForSelectedDate.map((event, i) => (
                                <li key={i} className="day-event-item">
                                    <div className="task-title">{event.title}</div>
                                    <div className="task-meta">{event.subject || event.name} • {event.date}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No hay eventos para este día</p>
                    )}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <button className="btn btn-primary" onClick={handleAddEventClick}>+ Agregar Evento</button>
                        <button className="btn btn-secondary" onClick={() => setShowEventModal(false)}>Cerrar</button>
                    </div>
                </Modal>
            )}

            {/* Modal para crear nueva tarea */}
            {showTaskModal && (
                <Modal title={`Nueva Tarea para ${formatDateForDisplay(selectedDate)}`} onClose={() => setShowTaskModal(false)}>
                    <TaskForm onSubmit={handleTaskFormSubmit} initialDate={selectedDate} />
                </Modal>
            )}
        </div>
    );
};

export default CalendarPage;