import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import useFcm from '../../hooks/useFcm'; // Hook reuse
import useLocalStorage from '../../hooks/useLocalStorage'; // To persist dismissal? Maybe session based.

const NotificationPermissionBanner = () => {
    // We use a new instance of the hook here mostly to check permission status and trigger request
    // We don't pass userUID here because we don't need to save token *here* (App.jsx instance does that, 
    // or if this instance gets token, the useEffect in usage might save it if we passed uid.
    // For simplicity, we just want the requestPermission function.

    // Actually, checking permission status via hook is fine.
    const { requestPermission, permissionStatus } = useFcm();
    const [isVisible, setIsVisible] = React.useState(true);

    if (permissionStatus === 'granted' || permissionStatus === 'denied' || !isVisible) {
        return null;
    }

    // Only show if mobile (simple check) or if PWA mode?
    // User requested "in the PWA".
    // We can show it generally if default.

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/20 backdrop-blur-md relative overflow-hidden"
            >
                <div className="flex items-start gap-4 relative z-10">
                    <div className="p-3 bg-surface/50 rounded-xl border border-white/10 shrink-0 text-primary">
                        <Bell size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-white mb-1">Activar Notificaciones</h3>
                        <p className="text-sm text-text-secondary mb-3">
                            Agendita te avisará de tus entregas y exámenes. Activá las notificaciones para no perderte nada.
                        </p>
                        <button
                            onClick={requestPermission}
                            className="bg-primary hover:bg-primary-action text-white px-5 py-2 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-primary/20"
                        >
                            Activar Ahora
                        </button>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-text-secondary hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NotificationPermissionBanner;
