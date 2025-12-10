import React, { useState } from 'react';
import { Trash2, Plus, X } from 'lucide-react';

const ExamForm = ({ onSubmit, initialData = null, initialDate = null, subjects = [], onDelete = null }) => {
    const [topics, setTopics] = useState(initialData?.topics || [{ id: Date.now(), name: '', studied: false }]);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        subject: initialData?.subject || '',
        date: initialData?.date || (initialDate ? initialDate.toLocaleDateString('en-CA') : ''),
        time: initialData?.time || '',
        score: initialData?.score ?? ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTopicChange = (index, field, value) => {
        const newTopics = [...topics];
        newTopics[index][field] = value;
        setTopics(newTopics);
    };

    const addTopic = () => {
        setTopics([...topics, { id: Date.now(), name: '', studied: false }]);
    };

    const removeTopic = (index) => {
        if (topics.length > 1) {
            const newTopics = topics.filter((_, i) => i !== index);
            setTopics(newTopics);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const filteredTopics = topics.filter(topic => topic.name.trim() !== '');
        const scoreValue = formData.score === '' ? null : parseFloat(formData.score);
        onSubmit({ ...formData, score: scoreValue, topics: filteredTopics });
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
                    placeholder="Ej: Parcial 1"
                    required
                />
            </div>

            <div>
                <label className={labelClasses}>Materia</label>
                <select className={inputClasses} name="subject" value={formData.subject} onChange={handleChange} required>
                    <option value="">Seleccionar materia</option>
                    {subjects.map(sub => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Fecha</label>
                    <input
                        type="date"
                        className={inputClasses}
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label className={labelClasses}>Hora</label>
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
                <label className={labelClasses}>Nota (0-10)</label>
                <input
                    type="number"
                    className={inputClasses}
                    name="score"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.score}
                    onChange={handleChange}
                    placeholder="Ej: 8.5"
                />
            </div>

            <div className="bg-surface/30 p-4 rounded-xl border border-white/5">
                <label className={`mb-3 flex items-center justify-between ${labelClasses}`}>
                    <span>Temas a Estudiar</span>
                    <span className="text-xs text-text-secondary">Marcar si ya estudiaste</span>
                </label>
                <div className="space-y-2">
                    {topics.map((topic, index) => (
                        <div key={topic.id} className="flex items-center gap-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    className={`${inputClasses} py-2`}
                                    placeholder="Tema..."
                                    value={topic.name}
                                    onChange={(e) => handleTopicChange(index, 'name', e.target.value)}
                                    required
                                />
                            </div>
                            <input
                                type="checkbox"
                                checked={topic.studied}
                                onChange={(e) => handleTopicChange(index, 'studied', e.target.checked)}
                                className="w-5 h-5 rounded border-white/20 bg-surface text-primary focus:ring-primary"
                            />
                            <button
                                type="button"
                                className="p-2 text-text-secondary hover:text-accent-urgent hover:bg-white/5 rounded-lg transition-colors"
                                onClick={() => removeTopic(index)}
                                title="Eliminar tema"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    className="mt-3 flex items-center gap-2 text-primary hover:text-primary-action text-sm font-medium px-2 py-1 hover:bg-white/5 rounded-lg transition-colors"
                    onClick={addTopic}
                >
                    <Plus size={16} />
                    Agregar otro tema
                </button>
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

export default ExamForm;