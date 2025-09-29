import React, { useState, useEffect } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import TaskItem from '../../components/TaskItem/TaskItem';
import Card from '../../components/Card/Card';
import {MdTask, MdEvent, MdTrendingUp} from 'react-icons/md';

const Dashboard = () => {
    const [tasks] = useLocalStorage('tasks', [
        { id: 1, title: 'Trabajo final de Matemáticas', subject: 'Matemáticas Discretas', date: '2024-12-15', priority: 'high', completed: false, description: 'Trabajo final de matemáticas discretas' },
        { id: 2, title: 'Lectura de Historia', subject: 'Historia Universal', date: '2024-12-18', priority: 'medium', completed: false, description: 'Lectura de capítulo 5 de historia universal' },
        { id: 3, title: 'Informe de Laboratorio', subject: 'Física I', date: '2024-12-20', priority: 'high', completed: false, description: 'Informe del experimento de movimiento uniforme' }
    ]);
    const [exams] = useLocalStorage('exams', [
        { id: 1, title: 'Examen Final - Matemáticas', subject: 'Matemáticas Discretas', date: '2024-12-15', preparation: 80, topics: [] },
        { id: 2, title: 'Parcial - Física', subject: 'Física I', date: '2024-12-20', preparation: 60, topics: [] }
    ]);

    const pendingTasks = tasks.filter(t => !t.completed).length;
    const nextExams = exams.length;
    const completedPercentage = tasks.length ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

    return (
        <div>
            <div className="dashboard-grid">
                <Card title="Tareas Pendientes" icon={<MdTask/>} content={`${pendingTasks} tareas pendientes`} />
                <Card title="Próximos Exámenes" icon={<MdEvent/>} content={`${nextExams} exámenes próximos`} />
                <Card title="Rendimiento" icon={<MdTrendingUp/>} content={`${completedPercentage}% de tareas completadas`} />
            </div>
            <Card title="Tareas Recientes" headerAction={<button className="btn btn-primary">+ Nueva Tarea</button>}>
                <ul className="task-list" id="recentTasks">
                    {tasks.slice(0, 5).map(task => (
                        <TaskItem key={task.id} task={task} />
                    ))}
                </ul>
            </Card>
        </div>
    );
};

export default Dashboard;