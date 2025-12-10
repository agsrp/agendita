import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

const TaskForm = ({ onSubmit, initialData = null, initialDate = null, subjects = [], onDelete = null }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        subject: initialData?.subject || '',
        date: initialData?.date || (initialDate ? initialDate.toLocaleDateString('en-CA') : ''),
        time: initialData?.time || '',
        priority: initialData?.priority || 'medium',
        description: initialData?.description || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const inputClasses = "w-full bg-surface/50 border border-white/10 rounded-xl p-3 text-text-primary focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50";
    const labelClasses = "block text-sm font-medium text-text-secondary mb-1.5";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClasses}>Título</label>
                <input
                    type="text"
                    className={inputClasses}
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ej: TP de Matemática"
                    required
                />
            </div>

            <div>
                <label className={labelClasses}>Materia</label>
                <select className={inputClasses} name="subject" value={formData.subject} onChange={handleChange}>
                    <option value="">Seleccionar materia</option>
                    {subjects.map(sub => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Fecha de Entrega</label>
                    <input
                        type="date"
                        className={inputClasses}
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className={labelClasses}>Hora (Opcional)</label>
                    <input
                        type="time"
                        className={inputClasses}
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <label className={labelClasses}>Prioridad</label>
                <select className={inputClasses} name="priority" value={formData.priority} onChange={handleChange}>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                </select>
            </div>

            <div>
                <label className={labelClasses}>Descripción</label>
                <textarea
                    className={inputClasses}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Detalles adicionales..."
                ></textarea>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-6">
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 text-white rounded-xl px-5 py-2.5 font-medium transition-colors cursor-pointer"
                    >
                        Guardar
                    </button>
                    <button
                        type="button"
                        className="bg-surface hover:bg-white/5 text-text-secondary hover:text-text-primary border border-white/10 rounded-xl px-5 py-2.5 font-medium transition-colors cursor-pointer"
                        onClick={() => onSubmit(null)}
                    >
                        Cancelar
                    </button>
                </div>
                {onDelete && (
                    <button
                        type="button"
                        className="flex items-center gap-2 text-accent-urgent hover:bg-accent-urgent/10 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                        onClick={onDelete}
                    >
                        <Trash2 size={18} />
                        <span className="text-sm font-medium">Eliminar</span>
                    </button>
                )}
            </div>
        </form>
    );
};

export default TaskForm;