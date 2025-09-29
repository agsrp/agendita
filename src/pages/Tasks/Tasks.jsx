import React, { useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import Modal from '../../components/Modal/Modal';
import TaskForm from '../../components/TaskForm/TaskForm'; // Asumiendo que ya lo creaste

const Tasks = () => {
    const [tasks, setTasks] = useLocalStorage('tasks', []);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const handleAddTask = () => {
        setEditingTask(null);
        setShowTaskModal(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setShowTaskModal(true);
    };

    const handleTaskToggle = (taskId) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    };

    const handleTaskFormSubmit = (formData) => {
        if (editingTask) {
            // Editar
            setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...formData } : t));
        } else {
            // Crear
            const newTask = { id: Date.now(), completed: false, ...formData };
            setTasks(prev => [...prev, newTask]);
        }
        setShowTaskModal(false);
    };

    const getPriorityText = (priority) => {
        switch(priority) {
            case 'high': return 'Alta';
            case 'medium': return 'Media';
            case 'low': return 'Baja';
            default: return 'Media';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    return (
        <div>
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Todas las Tareas</h3>
                    <button className="btn btn-primary" onClick={handleAddTask}>+ Nueva Tarea</button>
                </div>
                <ul className="task-list" id="allTasks">
                    {tasks.map(task => {
                        const priorityClass = `priority-${task.priority}`;
                        const subjectColorClass = `subject-color-${Math.floor(Math.random() * 4) + 1}`;

                        return (
                            <li key={task.id} className={`task-item ${subjectColorClass}`}>
                                <input
                                    type="checkbox"
                                    className="task-checkbox"
                                    checked={task.completed}
                                    onChange={() => handleTaskToggle(task.id)}
                                />
                                <div className="task-content">
                                    <div className="task-title">{task.title}</div>
                                    <div className="task-meta">
                                        {task.subject} • Prioridad: <span className={priorityClass}>{getPriorityText(task.priority)}</span> • {formatDate(task.date)}
                                    </div>
                                </div>
                                <button className="btn btn-secondary" onClick={() => handleEditTask(task)} style={{ marginLeft: '10px' }}>Editar</button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {showTaskModal && (
                <Modal title={editingTask ? `Editar Tarea: ${editingTask.title}` : 'Nueva Tarea'} onClose={() => setShowTaskModal(false)}>
                    <TaskForm onSubmit={handleTaskFormSubmit} initialData={editingTask} />
                </Modal>
            )}
        </div>
    );
};

export default Tasks;