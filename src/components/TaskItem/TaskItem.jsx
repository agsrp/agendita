import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, AlertTriangle, AlertCircle, AlertOctagon, Pencil } from 'lucide-react';
import clsx from 'clsx';

const TaskItem = ({ task, onToggle, onEdit }) => {

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        const [year, month, day] = dateString.split('-');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    const getPriorityInfo = (priority) => {
        switch (priority) {
            case 'high': return { text: 'Alta', color: 'text-accent-urgent', bg: 'bg-accent-urgent/10', icon: AlertOctagon };
            case 'medium': return { text: 'Media', color: 'text-primary', bg: 'bg-primary/10', icon: AlertTriangle };
            case 'low': return { text: 'Baja', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: AlertCircle };
            default: return { text: 'Media', color: 'text-text-secondary', bg: 'bg-white/5', icon: AlertCircle };
        }
    };

    const priorityInfo = getPriorityInfo(task.priority);
    const PriorityIcon = priorityInfo.icon;

    return (
        <motion.li
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "relative group flex items-start gap-4 p-4 rounded-xl border transition-all duration-300",
                task.completed
                    ? "bg-surface/20 border-white/5 opacity-60"
                    : "bg-surface/40 hover:bg-surface/60 border-white/5 hover:border-white/10 shadow-sm hover:shadow-md"
            )}
        >
            {/* Checkbox */}
            <div className="relative flex items-center pt-1">
                <input
                    type="checkbox"
                    className="peer appearance-none w-6 h-6 rounded-lg border-2 border-white/20 checked:border-primary checked:bg-primary transition-all cursor-pointer"
                    checked={task.completed || false}
                    onChange={() => onToggle && onToggle(task.id)}
                />
                <Check
                    size={14}
                    strokeWidth={3}
                    className={clsx(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 text-white",
                        task.completed ? "opacity-100 scale-100" : "opacity-0 scale-50"
                    )}
                />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
                <div className={clsx(
                    "font-medium text-base transition-all duration-300",
                    task.completed ? "text-text-secondary line-through decoration-white/20" : "text-text-primary"
                )}>
                    {task.title}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-text-secondary">
                    <span className="font-medium text-text-primary/80 bg-white/5 px-2 py-0.5 rounded-md">
                        {task.subject}
                    </span>

                    <span className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {formatDate(task.date)}
                    </span>

                    <span className={clsx("flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium", priorityInfo.bg, priorityInfo.color)}>
                        <PriorityIcon size={12} />
                        {priorityInfo.text}
                    </span>
                </div>
            </div>

            {onEdit && (
                <button
                    onClick={() => onEdit(task)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-text-secondary hover:text-primary hover:bg-white/5 rounded-lg transition-all"
                    title="Editar tarea"
                >
                    <Pencil size={18} />
                </button>
            )}
        </motion.li>
    );
};

export default TaskItem;