import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ title, children, onClose }) => {
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                />

                {/* Drawer Panel */}
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative w-full max-w-md h-full bg-surface border-l border-white/5 shadow-2xl overflow-y-auto pointer-events-auto"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6 sticky top-0 bg-surface/80 backdrop-blur-md -mx-6 px-6 py-2 border-b border-white/5 z-10">
                            <h2 className="text-xl font-bold font-display text-text-primary tracking-tight">{title}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {children}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default Modal;