import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from "firebase/firestore";
import useLocalStorage from '../../hooks/useLocalStorage';
import ChartContainer from '../../components/ChartContainer/ChartContainer';
import { motion } from 'framer-motion';
import { PieChart, TrendingUp, BarChart3, Download } from 'lucide-react';

const Stats = () => {

    const [tasks, setTasks] = useState([]);
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [userUID] = useLocalStorage("userUID", null);

    //  Cargar tareas
    const loadTasks = async () => {
        if (!userUID) return;
        const snap = await getDocs(collection(db, "users", userUID, "tasks"));
        setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    //  Cargar exámenes
    const loadExams = async () => {
        if (!userUID) return;
        const snap = await getDocs(collection(db, "users", userUID, "exams"));
        setExams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    //  Cargar materias
    const loadSubjects = async () => {
        if (!userUID) return;
        const snap = await getDocs(collection(db, "users", userUID, "subjects"));
        setSubjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    useEffect(() => {
        loadTasks();
        loadExams();
        loadSubjects();
    }, [userUID]);


    //  Calculo de estadisticas

    // Notas promedio
    const examsWithScore = exams.filter(e => e.score !== null && e.score !== undefined);
    const averageScore = examsWithScore.length > 0
        ? (examsWithScore.reduce((sum, e) => sum + e.score, 0) / examsWithScore.length).toFixed(2)
        : 'N/A';

    // Completitud por materia
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

    // Prioridades
    const priorityCounts = {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
    };
    const totalTasks = tasks.length;
    const highPercentage = totalTasks ? Math.round((priorityCounts.high / totalTasks) * 100) : 0;
    const mediumPercentage = totalTasks ? Math.round((priorityCounts.medium / totalTasks) * 100) : 0;
    const lowPercentage = totalTasks ? Math.round((priorityCounts.low / totalTasks) * 100) : 0;

    // Datos para graficos
    const barChartData = Object.entries(subjectCompletion)
        .filter(([_, data]) => data.total > 0)
        .map(([subject, data]) => ({
            label: subject,
            value: Math.round((data.completed / data.total) * 100),
            details: `${data.completed}/${data.total}`
        }));

    // Update colors to use hex codes for canvas gradient compatibility if needed, but CSS vars work for simple divs
    const pieChartData = [
        { label: 'Alta', value: highPercentage, color: '#EF4444' }, // red-500
        { label: 'Media', value: mediumPercentage, color: '#6366F1' }, // primary
        { label: 'Baja', value: lowPercentage, color: '#10B981' } // emerald-500
    ];

    // Tareas por materia
    const tasksPerSubject = {};
    subjects.forEach(subject => {
        tasksPerSubject[subject.name] = 0;
    });
    tasks.forEach(task => {
        if (tasksPerSubject[task.subject] !== undefined) {
            tasksPerSubject[task.subject]++;
        } else if (task.subject) {
            tasksPerSubject[task.subject] = (tasksPerSubject[task.subject] || 0) + 1;
        }
    });

    const tasksPerSubjectData = Object.entries(tasksPerSubject)
        .filter(([_, count]) => count > 0)
        .map(([subject, count]) => ({
            label: subject,
            value: count,
            details: `${count} tareas`
        }));

    // Promedio por materia
    const scoresPerSubject = {};
    subjects.forEach(subject => {
        scoresPerSubject[subject.name] = { sum: 0, count: 0 };
    });

    exams.forEach(exam => {
        if (exam.score !== null && exam.score !== undefined && scoresPerSubject[exam.subject]) {
            scoresPerSubject[exam.subject].sum += exam.score;
            scoresPerSubject[exam.subject].count++;
        }
    });

    const averageScorePerSubjectData = Object.entries(scoresPerSubject)
        .filter(([_, data]) => data.count > 0)
        .map(([subject, data]) => ({
            label: subject,
            value: parseFloat((data.sum / data.count).toFixed(2)),
            details: `${(data.sum / data.count).toFixed(2)} prom.`
        }));

    // Eventos de esta semana
    const isThisWeek = (dateString) => {
        if (!dateString) return false;

        // Parse dateString as local date
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        date.setHours(0, 0, 0, 0);

        // Get start of week (Sunday) for current local time
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayOfWeek = today.getDay(); // 0 = Sunday

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return date >= startOfWeek && date <= endOfWeek;
    };

    const tasksThisWeek = tasks.filter(t => t.completed && isThisWeek(t.date)).length;
    const pendingTasksThisWeek = tasks.filter(t => !t.completed && isThisWeek(t.date)).length;
    const examsThisWeek = exams.filter(e => isThisWeek(e.date)).length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 max-w-7xl mx-auto space-y-8"
        >
            <div>
                <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">
                    Rendimiento Académico
                </h1>
                <p className="text-text-secondary mt-1">Analíticas de tu progreso y hábitos de estudio</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Summary Card - Spans full width on mobile, 1 col on desktop? Maybe make it distinct */}
                <div className="md:col-span-2 lg:col-span-3 glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div className="w-32 h-32 bg-primary/20 blur-[60px] rounded-full" />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h3 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
                                <TrendingUp size={24} className="text-accent-success" />
                                Resumen Semanal
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div>
                                    <div className="text-2xl font-bold text-text-primary">{tasksThisWeek}</div>
                                    <div className="text-xs text-text-secondary uppercase tracking-wider">Completadas</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-text-primary">{pendingTasksThisWeek}</div>
                                    <div className="text-xs text-text-secondary uppercase tracking-wider">Pendientes</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-text-primary">{examsThisWeek}</div>
                                    <div className="text-xs text-text-secondary uppercase tracking-wider">Exámenes</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-text-primary">{averageScore !== 'N/A' ? `${averageScore}/10` : '-'}</div>
                                    <div className="text-xs text-text-secondary uppercase tracking-wider">Promedio Global</div>
                                </div>
                            </div>
                        </div>
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-surface/50 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-sm font-medium text-text-primary"
                            onClick={() => alert('La exportación a PDF está en desarrollo')}
                        >
                            <Download size={16} /> Exportar Reporte
                        </button>
                    </div>
                </div>

                {/* Charts */}
                <ChartContainer type="bar" data={barChartData} title="Completitud por Materia" />

                <ChartContainer type="pie" data={pieChartData} title="Distribución de Tareas" />

                <ChartContainer type="bar" data={tasksPerSubjectData} title="Volumen de Tareas" />

                <div className="md:col-span-2 lg:col-span-3">
                    <ChartContainer type="bar" data={averageScorePerSubjectData} title="Promedio de Notas por Materia" />
                </div>
            </div>
        </motion.div>
    );
};

export default Stats;
