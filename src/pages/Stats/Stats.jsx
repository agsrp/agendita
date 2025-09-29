import React from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import ChartContainer from '../../components/ChartContainer/ChartContainer'; // Asumiendo que lo creas

const Stats = () => {
    const [tasks] = useLocalStorage('tasks', []);
    const [exams] = useLocalStorage('exams', []);
    const [subjects] = useLocalStorage('subjects', []);

    // Lógica para calcular estadísticas
    const subjectCompletion = {};
    subjects.forEach(subject => {
        subjectCompletion[subject.name] = { total: 0, completed: 0 };
    });
    tasks.forEach(task => {
        if (subjectCompletion[task.subject]) {
            subjectCompletion[task.subject].total++;
            if (task.completed) {
                subjectCompletion[task.subject].completed++;
            }
        }
    });

    const priorityCounts = {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
    };
    const totalTasks = tasks.length;
    const highPercentage = totalTasks ? Math.round((priorityCounts.high / totalTasks) * 100) : 0;
    const mediumPercentage = totalTasks ? Math.round((priorityCounts.medium / totalTasks) * 100) : 0;
    const lowPercentage = totalTasks ? Math.round((priorityCounts.low / totalTasks) * 100) : 0;

    // Datos para gráficos
    const barChartData = Object.entries(subjectCompletion).filter(([_, data]) => data.total > 0).map(([subject, data]) => ({
        label: subject,
        value: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        details: `${data.completed}/${data.total}`
    }));

    const pieChartData = [
        { label: 'Alta', value: highPercentage, color: 'var(--primary)' },
        { label: 'Media', value: mediumPercentage, color: 'var(--secondary)' },
        { label: 'Baja', value: lowPercentage, color: 'var(--tertiary)' }
    ];

    // Simulación de tiempo dedicado
    const timeSpentData = [
        { label: 'Matemáticas', value: 45 },
        { label: 'Historia', value: 30 },
        { label: 'Física', value: 25 },
    ];

    const isThisWeek = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return date >= startOfWeek && date <= endOfWeek;
    };

    const tasksThisWeek = tasks.filter(t => t.completed && isThisWeek(t.date)).length;
    const examsThisWeek = exams.filter(e => isThisWeek(e.date)).length;

    return (
        <div>
            <div className="chart-container">
                <h2>Rendimiento Académico</h2>
                <ChartContainer type="bar" data={barChartData} title="Completitud por Materia" />
            </div>
            <div className="dashboard-grid">
                <div className="chart-container">
                    <ChartContainer type="pie" data={pieChartData} title="Distribución de Prioridades" />
                </div>
                <div className="chart-container">
                    <ChartContainer type="bar" data={timeSpentData.map(d => ({ label: d.label, value: d.value, details: `${d.value}h` }))} title="Tiempo Dedicado por Materia (Horas)" />
                </div>
            </div>
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Resumen Semanal</h3>
                    <button className="btn btn-primary" onClick={() => alert('Exportación de PDF en desarrollo')}>Exportar PDF</button>
                </div>
                <div className="card-content">
                    <p>Tareas completadas esta semana: {tasksThisWeek}</p>
                    <p>Exámenes próximos esta semana: {examsThisWeek}</p>
                    <p>Materias activas: {subjects.length}</p>
                </div>
            </div>
        </div>
    );
};

export default Stats;