
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, PlusSquare, Home, Check } from 'lucide-react';
import useLocalStorage from '../../hooks/useLocalStorage';

const IosInstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useLocalStorage('iosInstallPromptDismissed', false);
    const [stepsCompleted, setStepsCompleted] = useState([false, false, false]);

    useEffect(() => {
        // 1. Check if user already dismissed it forever
        if (dontShowAgain) return;

        // 2. Check if device is iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        // 3. Check if running in standalone mode (PWA)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

        // Show only if iOS and NOT standalone (Immediately)
        if (isIOS && !isStandalone) {
            setShowPrompt(true);
        }
    }, [dontShowAgain]);

    const handleDismiss = () => {
        setShowPrompt(false);
    };

    const handleDontShowAgain = () => {
        setDontShowAgain(true);
        setShowPrompt(false);
    };

    const toggleStep = (index) => {
        const newSteps = [...stepsCompleted];
        newSteps[index] = !newSteps[index];
        setStepsCompleted(newSteps);
    };

    const allStepsCompleted = stepsCompleted.every(Boolean);

    const steps = [
        {
            icon: <Share size={18} className="text-primary" />,
            text: <span>1. Toca el botón <strong>Compartir</strong> abajo</span>
        },
        {
            icon: <PlusSquare size={18} className="text-primary" />,
            text: <span>2. Seleccioná <strong>Agregar a Inicio</strong></span>
        },
        {
            icon: <Home size={18} className="text-primary" />,
            text: <span>3. <strong>Abrir la app</strong> desde el inicio</span>
        }
    ];

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 md:hidden"
                >
                    <div className="glass-card bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-text-primary pr-8">
                                ¡Instalá Agendita! 📲
                            </h3>
                            <button
                                onClick={handleDismiss}
                                className="text-text-secondary hover:text-white p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-text-secondary mb-5">
                            Seguí estos pasos para tener la mejor experiencia:
                        </p>

                        <div className="space-y-4 mb-6">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    onClick={() => toggleStep(index)}
                                    className="flex items-center gap-3 p-3 bg-surface/50 rounded-xl border border-white/5 active:bg-white/5 transition-colors cursor-pointer"
                                >
                                    {/* Custom Checkbox */}
                                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${stepsCompleted[index]
                                        ? 'bg-primary border-primary text-white'
                                        : 'bg-white/5 border-white/20 text-transparent'
                                        }`}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>

                                    {/* Icon Box */}
                                    <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg border border-white/5 shrink-0">
                                        {step.icon}
                                    </div>

                                    {/* Text */}
                                    <div className="text-sm text-text-primary flex-1">
                                        {step.text}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleDontShowAgain}
                                disabled={!allStepsCompleted}
                                className={`flex-1 py-3 text-xs font-medium rounded-xl border border-white/5 transition-colors ${allStepsCompleted
                                        ? 'text-text-secondary hover:text-white hover:bg-white/5'
                                        : 'text-white/20 cursor-not-allowed'
                                    }`}
                            >
                                No volver a mostrar
                            </button>
                            <button
                                onClick={handleDismiss}
                                disabled={!allStepsCompleted}
                                className={`flex-1 py-3 text-xs font-bold text-white rounded-xl shadow-lg transition-all ${allStepsCompleted
                                    ? 'bg-primary hover:bg-primary-action shadow-primary/20 bg-gradient-to-r from-primary to-primary-action'
                                    : 'bg-gray-600/50 text-white/30 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                Entendido
                            </button>
                        </div>

                        {/* Little arrow pointing down */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-surface/90 border-r border-b border-white/10 rotate-45 transform"></div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default IosInstallPrompt;
