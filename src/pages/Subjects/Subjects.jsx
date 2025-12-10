import React, { useEffect, useState } from 'react';
import { BookOpen, Pencil } from 'lucide-react';
import { db } from '../../firebase';
import { collection, updateDoc, deleteDoc, onSnapshot, doc } from 'firebase/firestore';
import useLocalStorage from '../../hooks/useLocalStorage';
import Modal from '../../components/Modal/Modal';
import SubjectForm from '../../components/SubjectForm/SubjectForm';
import { motion, AnimatePresence } from 'framer-motion';

const Subjects = () => {

    const [subjects, setSubjects] = useState([]);
    const [editingSubject, setEditingSubject] = useState(null);
    const [userUID] = useLocalStorage('userUID', null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const loadSubjects = () => {
        if (!userUID) return;

        const unsubscribe = onSnapshot(collection(db, "users", userUID, "subjects"), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSubjects(data);
        });

        return unsubscribe;
    };

    useEffect(() => {
        const unsubscribe = loadSubjects();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userUID]);

    const editSubject = async (subjectId, data) => {
        await updateDoc(doc(db, "users", userUID, "subjects", subjectId), data);
    };

    const handleSubjectFormSubmit = (formData) => {
        if (formData && editingSubject) {
            editSubject(editingSubject.id, formData);
        }

        setEditingSubject(null);
        setIsEditModalOpen(false);
    };

    const handleEditSubject = (subject) => {
        setEditingSubject(subject);
        setIsEditModalOpen(true);
    };

    const handleDeleteSubject = async () => {
        if (!editingSubject) return;
        if (window.confirm('¿Estás seguro de que deseas eliminar esta materia?')) {
            await deleteDoc(doc(db, "users", userUID, "subjects", editingSubject.id));
            setEditingSubject(null);
            setIsEditModalOpen(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 max-w-7xl mx-auto space-y-8"
        >
            <div>
                <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">
                    Mis Materias
                </h1>
                <p className="text-text-secondary mt-1">Configurá tus cursos y horarios</p>
            </div>

            <motion.div
                variants={container}
                initial="show"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {subjects.map(subject => (
                    <motion.div
                        key={subject.id}
                        variants={item}
                        className="glass-card group relative p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:shadow-lg overflow-hidden"
                    >
                        {/* Decorative Gradient Blob */}
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/20 blur-[50px] rounded-full group-hover:bg-primary/30 transition-all duration-500"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-surface/50 rounded-xl border border-white/5">
                                    <BookOpen size={24} className="text-primary" />
                                </div>
                                <button
                                    onClick={() => handleEditSubject(subject)}
                                    className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Pencil size={18} />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-text-primary mb-1">{subject.name}</h3>
                            <p className="text-sm text-primary font-medium mb-4">{subject.code}</p>

                            <div className="space-y-2 text-sm text-text-secondary">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-text-primary/70">Profesor:</span>
                                    <span>{subject.professor || 'No asignado'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium text-text-primary/70">Horario:</span>
                                    <span className="text-xs bg-surface/50 p-2 rounded-lg border border-white/5">
                                        {subject.schedule || 'Sin horario'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <Modal
                        title={`Editar Materia`}
                        onClose={() => setIsEditModalOpen(false)}
                    >
                        <SubjectForm
                            onSubmit={handleSubjectFormSubmit}
                            initialData={editingSubject}
                            onDelete={handleDeleteSubject}
                        />
                    </Modal>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Subjects;
