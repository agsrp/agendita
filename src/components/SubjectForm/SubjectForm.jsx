import React, { useState } from 'react';

const SubjectForm = ({ onSubmit, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        code: initialData?.code || '',
        professor: initialData?.professor || '',
        schedule: initialData?.schedule || ''
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
                <label className="form-label">Nombre</label>
                <input type="text" className="form-input" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label className="form-label">Código</label>
                <input type="text" className="form-input" name="code" value={formData.code} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label className="form-label">Profesor</label>
                <input type="text" className="form-input" name="professor" value={formData.professor} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label className="form-label">Horario</label>
                <input type="text" className="form-input" name="schedule" value={formData.schedule} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">Guardar</button>
                <button type="button" className="btn btn-secondary" onClick={() => onSubmit(null)}>Cancelar</button>
            </div>
        </form>
    );
};

export default SubjectForm;