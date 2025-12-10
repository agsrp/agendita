import React from 'react';
import { motion } from 'framer-motion';

const ChartContainer = ({ type, data, title }) => {
    if (type === 'bar') {
        const maxValue = data.reduce((max, item) => Math.max(max, item.value), 0);

        return (
            <div className="glass-card p-6 h-full">
                <h3 className="text-lg font-semibold text-text-primary mb-6">{title}</h3>
                <div className="space-y-4">
                    {data.map((item, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm text-text-secondary">
                                <span>{item.label}</span>
                                <span>{item.details}</span>
                            </div>
                            <div className="h-3 bg-surface/50 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-primary rounded-full relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2 animate-shimmer" />
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    } else if (type === 'pie') {
        // Cálculo de porcentajes acumulados para el gradiente cónico
        let cumulativePercentage = 0;
        const gradientStops = data.map(item => {
            const start = cumulativePercentage;
            cumulativePercentage += item.value;
            // Map generic variables to tailwind/css variables or hex from config if needed. 
            // Assuming item.color comes as var(--primary) etc.
            // Tailwind colors: primary -> #6366F1, etc.
            // We'll use the passed color or legacy var.
            return `${item.color} ${start}% ${cumulativePercentage}%`;
        }).join(', ');

        return (
            <div className="glass-card p-6 h-full flex flex-col items-center">
                <h3 className="text-lg font-semibold text-text-primary mb-6 w-full text-left">{title}</h3>
                <div className="relative w-48 h-48 rounded-full mb-6 border-4 border-surface/50 shadow-2xl"
                    style={{ background: `conic-gradient(${gradientStops})` }}>
                    {/* Hollow center for Donut Chart effect */}
                    <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center">
                        <span className="text-text-secondary text-xs font-medium">Total</span>
                    </div>
                </div>
                <div className="w-full space-y-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-text-secondary">{item.label}</span>
                            </div>
                            <span className="font-bold text-text-primary">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return <div className="text-red-500">Tipo de gráfico no soportado</div>;
};

export default ChartContainer;