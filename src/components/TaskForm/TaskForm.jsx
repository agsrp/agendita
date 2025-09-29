import React, { useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';

const TaskForm = ({ onSubmit, initialData = null, initialDate = null }) => {
    const [subjects] = useLocalStorage('subjects', []);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        subject: initialData?.subject || '',
        date: initialData?.date || (initialDate ? initialDate.toISOString().split('T')[0] : ''),
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

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Título</label>
                <input type="text" className="form-input" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label className="form-label">Materia</label>
                <select className="form-input" name="subject" value={formData.subject} onChange={handleChange}>
                    <option value="">Seleccionar materia</option>
                    {subjects.map(sub => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Fecha de Entrega</label>
                <input type="date" className="form-input" name="date" value={formData.date} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select className="form-input" name="priority" value={formData.priority} onChange={handleChange}>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-input" name="description" value={formData.description} onChange={handleChange} rows="3"></textarea>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">Guardar</button>
                <button type="button" className="btn btn-secondary" onClick={() => onSubmit(null)}>Cancelar</button>
            </div>
        </form>
    );
};

export default TaskForm;