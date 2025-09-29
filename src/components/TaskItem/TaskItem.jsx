import React, { useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';

const TaskItem = ({ task }) => {
    const [tasks, setTasks] = useLocalStorage('tasks', []);
    const [completed, setCompleted] = useState(task.completed);

    const handleToggle = () => {
        const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t);
        setTasks(updatedTasks);
        setCompleted(!completed);
    };

    const priorityClass = `priority-${task.priority}`;
    const subjectColorClass = `subject-color-${Math.floor(Math.random() * 4) + 1}`;

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    const getPriorityText = (priority) => {
        switch(priority) {
            case 'high': return 'Alta';
            case 'medium': return 'Media';
            case 'low': return 'Baja';
            default: return 'Media';
        }
    };

    return (
        <li className={`task-item ${subjectColorClass}`}>
            <input type="checkbox" className="task-checkbox" checked={completed} onChange={handleToggle} />
            <div className="task-content">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                    {task.subject} • Prioridad: <span className={priorityClass}>{getPriorityText(task.priority)}</span> • {formatDate(task.date)}
                </div>
            </div>
        </li>
    );
};

export default TaskItem;