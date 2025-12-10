import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, updateDoc, deleteDoc, onSnapshot, doc } from 'firebase/firestore';
import useLocalStorage from '../../hooks/useLocalStorage';
import Modal from '../../components/Modal/Modal';
import ExamForm from '../../components/ExamForm/ExamForm';
import { Trash2, CalendarDays, Pencil, GraduationCap, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

const Exams = () => {

    const [exams, setExams] = useState([]);
    const [editingExam, setEditingExam] = useState(null);
    const [userUID] = useLocalStorage("userUID", null);

    // Estado para el modal de EDICIÓN (local)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    //  Cargar examenes desde Fs (Real-time)
    const loadExams = () => {
        if (!userUID) return;

        const unsubscribe = onSnapshot(collection(db, "users", userUID, "exams"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setExams(data);
        });

        return unsubscribe;
    };

    useEffect(() => {
        const unsubscribe = loadExams();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userUID]);

    // Editar examen existente
    const editExam = async (examId, formData) => {
        await updateDoc(
            doc(db, "users", userUID, "exams", examId),
            formData
        );
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

    //  Eliminar examen
    const handleDeleteExam = async (examId) => {
        const idToDelete = examId || editingExam?.id;
        if (!idToDelete) return;

        if (window.confirm('¿Estás seguro de que deseas eliminar este examen?')) {
            await deleteDoc(doc(db, "users", userUID, "exams", idToDelete));
            if (editingExam) {
                setEditingExam(null);
                setIsEditModalOpen(false);
            }
        }
    };

    // Guardar examen desde el formulario (Edición)
    const handleExamFormSubmit = (formData) => {
        if (!formData) {
            setEditingExam(null);
            setIsEditModalOpen(false);
            return;
        }

        if (editingExam) {
            editExam(editingExam.id, formData);
        }

        setEditingExam(null);
        setIsEditModalOpen(false);
    };

    // Marcar lo estudiado
    const handleTopicToggle = async (examId, topicId) => {
        const exam = exams.find(e => e.id === examId);
        if (!exam) return;

        const updatedTopics = exam.topics.map(t =>
            t.id === topicId ? { ...t, studied: !t.studied } : t
        );

        const completed = updatedTopics.filter(t => t.studied).length;
        const total = updatedTopics.length;
        const newPreparation = total ? Math.round((completed / total) * 100) : 0;

        await updateDoc(doc(db, "users", userUID, "exams", examId), {
            topics: updatedTopics,
            preparation: newPreparation
        });
    };

    // Actualizar nota
    const handleScoreChange = async (examId, newScore) => {
        await updateDoc(doc(db, "users", userUID, "exams", examId), {
            score: newScore === "" ? null : parseFloat(newScore)
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const handleEditExam = (exam) => {
        setEditingExam(exam);
        setIsEditModalOpen(true);
    };

    // Filtros y Ordenamiento
    const [filterSubject, setFilterSubject] = useState('all');
    const [sortBy, setSortBy] = useState('date'); // date, score

    const filteredExams = exams
        .filter(exam => {
            if (filterSubject === 'all') return true;
            return exam.subject === filterSubject;
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(a.date || '9999-12-31') - new Date(b.date || '9999-12-31');
            } else if (sortBy === 'score') {
                return (b.score || 0) - (a.score || 0);
            }
            return 0;
        });

    // Obtener lista única de materias de los exámenes
    const uniqueSubjects = [...new Set(exams.map(e => e.subject))];

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
                        Próximos Exámenes
                    </h1>
                    <p className="text-text-secondary mt-1">Prepará tus evaluaciones y seguí tu progreso</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="glass-panel p-4 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs text-text-secondary font-medium flex items-center gap-1.5">
                        <GraduationCap size={12} /> Materia
                    </label>
                    <select
                        className={selectClasses}
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                    >
                        <option value="all">Todas las materias</option>
                        {uniqueSubjects.map(subj => (
                            <option key={subj} value={subj}>{subj}</option>
                        ))}
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
                        <option value="date">Ordenar por Fecha</option>
                        <option value="score">Ordenar por Nota</option>
                    </select>
                </div>
            </div>

            {/* Grid de Exámenes */}
            <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExams.length > 0 ? (
                        filteredExams.map(exam => {
                            const calculatedPreparation = exam.topics
                                ? Math.round(
                                    (exam.topics.filter(t => t.studied).length / exam.topics.length) * 100
                                )
                                : 0;

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={exam.id}
                                    className="glass-card flex flex-col p-6 h-full relative group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-surface/50 rounded-xl border border-white/5 text-primary">
                                            <CalendarDays size={24} />
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditExam(exam)}
                                                className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteExam(exam.id)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-text-primary mb-1">{exam.title}</h3>
                                    <p className="text-sm text-primary font-medium mb-4">{exam.subject}</p>

                                    <div className="mb-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">Fecha</span>
                                            <span className="text-text-primary font-medium">{formatDate(exam.date)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm items-center">
                                            <span className="text-text-secondary">Nota</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                value={exam.score ?? ""}
                                                onChange={(e) => handleScoreChange(exam.id, e.target.value)}
                                                className="w-16 bg-surface/50 border border-white/10 rounded px-2 py-1 text-right text-text-primary focus:ring-1 focus:ring-primary outline-none"
                                                placeholder="-"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-6 space-y-2">
                                        <div className="flex justify-between text-xs text-text-secondary mb-1">
                                            <span>Preparación</span>
                                            <span>{calculatedPreparation}%</span>
                                        </div>
                                        <div className="h-2 bg-surface/50 rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                className="h-full bg-primary"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${calculatedPreparation}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Temas */}
                                    <div className="flex-1 space-y-2">
                                        <h4 className="text-sm font-semibold text-text-primary mb-3">Temas a estudiar</h4>
                                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                            {exam.topics?.map(topic => (
                                                <label key={topic.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group/topic">
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={topic.studied}
                                                            onChange={() => handleTopicToggle(exam.id, topic.id)}
                                                            className="peer appearance-none w-4 h-4 rounded border border-white/20 checked:bg-primary checked:border-primary transition-all"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 pointer-events-none text-white overflow-hidden">
                                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <span className={`text-sm transition-all ${topic.studied ? 'text-text-secondary line-through decoration-white/20' : 'text-text-primary'}`}>
                                                        {topic.name}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center bg-surface/20 rounded-2xl border border-white/5 border-dashed">
                            <p className="text-text-secondary">No hay exámenes que coincidan con los filtros.</p>
                        </div>
                    )}
                </div>
            </AnimatePresence>

            {/* Modal de Edición Local */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <Modal
                        title={`Editar Examen`}
                        onClose={() => setIsEditModalOpen(false)}
                    >
                        <ExamForm
                            onSubmit={handleExamFormSubmit}
                            initialData={editingExam}
                            subjects={subjects}
                            onDelete={() => handleDeleteExam()}
                        />
                    </Modal>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Exams;
