import React, { useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';

const ExamForm = ({ onSubmit, initialData = null }) => {
    const [subjects] = useLocalStorage('subjects', []);
    const [topics, setTopics] = useState(initialData?.topics || [{ id: Date.now(), name: '', studied: false }]);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        subject: initialData?.subject || '',
        date: initialData?.date || '',
        score: initialData?.score ?? '' // Manejar score como string vacío si es null o undefined
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
        // Asegura que los topics vacíos no se guarden
        const filteredTopics = topics.filter(topic => topic.name.trim() !== '');
        // Convierte score a número o null
        const scoreValue = formData.score === '' ? null : parseFloat(formData.score);
        onSubmit({ ...formData, score: scoreValue, topics: filteredTopics });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Título</label>
                <input type="text" className="form-input" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label className="form-label">Materia</label>
                <select className="form-input" name="subject" value={formData.subject} onChange={handleChange} required>
                    <option value="">Seleccionar materia</option>
                    {subjects.map(sub => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Fecha del Examen</label>
                <input type="date" className="form-input" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label className="form-label">Nota (0-10)</label>
                <input
                    type="number"
                    className="form-input"
                    name="score"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.score}
                    onChange={handleChange}
                    placeholder="Ej: 8.5"
                />
            </div>
            <div className="form-group">
                <label className="form-label">Temas a Estudiar</label>
                <div id="topicsContainer">
                    {topics.map((topic, index) => (
                        <div key={topic.id} className="topic-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Tema a estudiar"
                                value={topic.name}
                                onChange={(e) => handleTopicChange(index, 'name', e.target.value)}
                                style={{ flex: 1 }}
                                required
                            />
                            <input
                                type="checkbox"
                                checked={topic.studied}
                                onChange={(e) => handleTopicChange(index, 'studied', e.target.checked)}
                            />
                            <label>Estudiado</label>
                            <button type="button" className="btn btn-secondary remove-topic" onClick={() => removeTopic(index)}>Eliminar</button>
                        </div>
                    ))}
                </div>
                <button type="button" className="btn btn-secondary" onClick={addTopic} style={{ marginTop: '10px' }}>+ Agregar Tema</button>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary">Guardar</button>
                <button type="button" className="btn btn-secondary" onClick={() => onSubmit(null)}>Cancelar</button>
            </div>
        </form>
    );
};

export default ExamForm;