import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ title, icon, content, children, headerAction, className = '' }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`glass-card p-6 flex flex-col h-full ${className}`}
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    {icon && <span className="text-primary p-2 bg-primary/10 rounded-lg">{icon}</span>}
                    <h3 className="text-lg font-bold text-text-primary tracking-tight font-display">{title}</h3>
                </div>
                {headerAction}
            </div>
            {content && <div className="text-text-secondary"><p>{content}</p></div>}
            <div className="flex-1">
                {children}
            </div>
        </motion.div>
    );
};

export default Card;