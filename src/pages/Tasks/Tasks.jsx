import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, updateDoc, deleteDoc, onSnapshot, doc } from 'firebase/firestore';
import useLocalStorage from '../../hooks/useLocalStorage';
import Modal from '../../components/Modal/Modal';
import TaskForm from '../../components/TaskForm/TaskForm';
import TaskItem from '../../components/TaskItem/TaskItem';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ArrowUpDown } from 'lucide-react';

const Tasks = () => {

    const [tasks, setTasks] = useState([]); // Firestore
    const [editingTask, setEditingTask] = useState(null);
    const [userUID] = useLocalStorage("userUID", null);

    // Estado para el modal de EDICIÓN (local)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Cargar tareas desde Firestore (Real-time)
    const loadTasks = () => {
        if (!userUID) return;

        const unsubscribe = onSnapshot(collection(db, "users", userUID, "tasks"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTasks(data);
        });

        return unsubscribe;
    };

    useEffect(() => {
        const unsubscribe = loadTasks();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userUID]);

    // Editar tarea
    const editTask = async (taskId, formData) => {
        await updateDoc(
            doc(db, "users", userUID, "tasks", taskId),
            formData
        );
    };

    // Marcar completada
    const handleTaskToggle = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        await updateDoc(
            doc(db, "users", userUID, "tasks", taskId),
            { completed: !task.completed }
        );
    };

    // Guardar EDICIÓN
    const handleTaskFormSubmit = (formData) => {
        if (editingTask) {
            editTask(editingTask.id, formData);
        }

        setEditingTask(null);
        setIsEditModalOpen(false);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setIsEditModalOpen(true);
    };

    // Fetch subjects for edit form
    const [subjects, setSubjects] = useState([]);
    useEffect(() => {
        if (!userUID) return;
        const unsubscribe = onSnapshot(collection(db, "users", userUID, "subjects"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSubjects(data);
        });
        return () => unsubscribe();
    }, [userUID]);

    // Eliminar tarea
    const handleDeleteTask = async () => {
        if (!editingTask) return;
        if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
            await deleteDoc(doc(db, "users", userUID, "tasks", editingTask.id));
            setEditingTask(null);
            setIsEditModalOpen(false);
        }
    };

    // Filtros y Ordenamiento
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed
    const [filterPriority, setFilterPriority] = useState('all'); // all, high, medium, low
    const [sortBy, setSortBy] = useState('date'); // date, priority

    const filteredTasks = tasks
        .filter(task => {
            if (filterStatus === 'pending') return !task.completed;
            if (filterStatus === 'completed') return task.completed;
            return true;
        })
        .filter(task => {
            if (filterPriority === 'all') return true;
            return task.priority === filterPriority;
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(a.date || '9999-12-31') - new Date(b.date || '9999-12-31');
            } else if (sortBy === 'priority') {
                const priorityOrder = { high: 1, medium: 2, low: 3 };
                return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
            }
            return 0;
        });

    const selectClasses = "bg-surface/50 border border-white/10 text-text-primary text-sm rounded-lg p-2.5 focus:ring-primary focus:border-primary block w-full outline-none hover:bg-surface/70 transition-colors";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 max-w-7xl mx-auto space-y-8"
        >
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">
                        Mis Tareas
                    </h1>
                    <p className="text-text-secondary mt-1">Gestioná tus entregas y pendientes</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="glass-panel p-4 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                        <Filter size={12} /> Estado
                    </label>
                    <select
                        className={selectClasses}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="pending">Pendientes</option>
                        <option value="completed">Completadas</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                        <Filter size={12} /> Prioridad
                    </label>
                    <select
                        className={selectClasses}
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                    >
                        <option value="all">Todas las prioridades</option>
                        <option value="high">Alta</option>
                        <option value="medium">Media</option>
                        <option value="low">Baja</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                        <ArrowUpDown size={12} /> Ordenar por
                    </label>
                    <select
                        className={selectClasses}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="date">Fecha de entrega</option>
                        <option value="priority">Prioridad</option>
                    </select>
                </div>
            </div>

            {/* Lista de Tareas */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredTasks.length > 0 ? (
                        <ul className="grid grid-cols-1 gap-3">
                            {filteredTasks.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onToggle={handleTaskToggle}
                                    onEdit={handleEditTask}
                                />
                            ))}
                        </ul>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 bg-surface/20 rounded-2xl border border-white/5 border-dashed"
                        >
                            <p className="text-text-secondary">No encontramos tareas con esos filtros.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal de Edición Local */}
            {isEditModalOpen && (
                <Modal
                    title={`Editar Tarea`}
                    onClose={() => setIsEditModalOpen(false)}
                >
                    <TaskForm
                        onSubmit={handleTaskFormSubmit}
                        initialData={editingTask}
                        subjects={subjects}
                        onDelete={handleDeleteTask}
                    />
                </Modal>
            )}
        </motion.div>
    );
};

export default Tasks;
