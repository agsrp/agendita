import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckSquare, GraduationCap, BookOpen, X } from 'lucide-react';

const SpeedDial = ({ onAddTask, onAddExam, onAddSubject }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    const actions = [
        { icon: <BookOpen size={20} />, label: 'Materia', onClick: onAddSubject, color: 'bg-indigo-500' },
        { icon: <GraduationCap size={20} />, label: 'Examen', onClick: onAddExam, color: 'bg-purple-500' },
        { icon: <CheckSquare size={20} />, label: 'Tarea', onClick: onAddTask, color: 'bg-emerald-500' },
    ];

    const containerVariants = {
        hidden: { opacity: 0, scale: 0 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                delayChildren: 0.1,
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0, scale: 0.5 },
        visible: { y: 0, opacity: 1, scale: 1 }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="flex flex-col items-end gap-3 mb-2"
                    >
                        {actions.map((action, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="flex items-center gap-3"
                            >
                                <span className="bg-surface/80 backdrop-blur text-text-primary text-xs font-medium px-2 py-1 rounded-md shadow-sm border border-white/5">
                                    {action.label}
                                </span>
                                <button
                                    onClick={() => {
                                        action.onClick();
                                        setIsOpen(false);
                                    }}
                                    className={`${action.color} text-white p-3 rounded-full shadow-lg hover:brightness-110 transition-all flex items-center justify-center`}
                                >
                                    {action.icon}
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={toggleOpen}
                animate={{ rotate: isOpen ? 45 : 0 }}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-surface text-text-primary border border-white/10' : 'bg-primary text-white shadow-primary/40'}`}
            >
                <Plus size={28} />
            </motion.button>
        </div>
    );
};

export default SpeedDial;
