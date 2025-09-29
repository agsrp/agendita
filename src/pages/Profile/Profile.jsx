import React, { useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';

const Profile = () => {
    const [profile, setProfile] = useLocalStorage('profile', {
        fullName: 'Juan Pérez',
        institution: 'Universidad Tecnológica',
        career: 'Ingeniería Informática',
        semester: '5to Semestre',
        focusMode: false
    });

    const [formData, setFormData] = useState(profile);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProfile(formData);
        alert('Perfil guardado correctamente');
    };

    return (
        <div>
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Configuración de Perfil</h3>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div className="form-group">
                        <label className="form-label">Nombre Completo</label>
                        <input
                            type="text"
                            className="form-input"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Institución</label>
                        <input
                            type="text"
                            className="form-input"
                            name="institution"
                            value={formData.institution}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Carrera</label>
                        <input
                            type="text"
                            className="form-input"
                            name="career"
                            value={formData.career}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Semestre</label>
                        <input
                            type="text"
                            className="form-input"
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            <input
                                type="checkbox"
                                name="focusMode"
                                checked={formData.focusMode}
                                onChange={handleChange}
                            />
                            Activar modo de enfoque
                        </label>
                    </div>
                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                </form>
            </div>
        </div>
    );
};

export default Profile;