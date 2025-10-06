import React, { useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import Modal from '../../components/Modal/Modal';
import ExamForm from '../../components/ExamForm/ExamForm';

const Exams = ({ showExamModal = false, onCloseExamModal }) => {
    const [exams, setExams] = useLocalStorage('exams', []);
    const [editingExam, setEditingExam] = useState(null);

    const handleAddExam = () => {
        setEditingExam(null);
        if (onCloseExamModal) onCloseExamModal(); // Cierra el modal si estaba abierto por otra acción
    };

    const handleEditExam = (exam) => {
        setEditingExam(exam);
        if (onCloseExamModal) onCloseExamModal(); // Cierra el modal si estaba abierto por otra acción
    };

    const handleExamFormSubmit = (formData) => {
        if (editingExam) {
            setExams(prev => prev.map(e => e.id === editingExam.id ? { ...e, ...formData } : e));
        } else {
            const newExam = { id: Date.now(), preparation: 0, topics: [], ...formData };
            setExams(prev => [...prev, newExam]);
        }
        if (onCloseExamModal) onCloseExamModal(); // Cierra el modal después de guardar
    };

    const handleTopicToggle = (examId, topicId) => {
        setExams(prev => prev.map(exam => {
            if (exam.id === examId) {
                const updatedTopics = exam.topics.map(topic => {
                    if (topic.id === topicId) {
                        return { ...topic, studied: !topic.studied };
                    }
                    return topic;
                });
                const completedTopics = updatedTopics.filter(t => t.studied).length;
                const totalTopics = updatedTopics.length;
                const newPreparation = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;
                return { ...exam, topics: updatedTopics, preparation: newPreparation };
            }
            return exam;
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    const getPriorityText = (priority) => {
        switch(priority) {
            case 'high': return 'Alta';
            case 'medium': return 'Media';
            case 'low': return 'Baja';
            default: return 'Media';
        }
    };

    return (
        <div>
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Próximos Exámenes</h3>
                    <button className="btn btn-primary" onClick={handleAddExam}>+ Nuevo Examen</button>
                </div>
                <div className="dashboard-grid" id="examsGrid">
                    {exams.map(exam => {
                        const priorityClass = `priority-${exam.priority || 'high'}`;
                        const calculatedPreparation = exam.topics.length ? Math.round((exam.topics.filter(t => t.studied).length / exam.topics.length) * 100) : 0;

                        return (
                            <div key={exam.id} className="card">
                                <div className="card-header">
                                    <h3 className="card-title">{exam.title}</h3>
                                    <span className="material-icons priority-high">event</span>
                                </div>
                                <div className="card-content">
                                    <p>Fecha: {formatDate(exam.date)}</p>
                                    <p>Materia: {exam.subject}</p>
                                    <p>Preparación: {calculatedPreparation}%</p>
                                    <div style={{ marginTop: '10px' }}>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={calculatedPreparation}
                                            className="preparation-slider"
                                            disabled
                                        />
                                    </div>
                                    <div style={{ marginTop: '15px' }}>
                                        <label htmlFor={`score-${exam.id}`} className="form-label">Nota (0-10):</label>
                                        <input
                                            id={`score-${exam.id}`}
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={exam.score ?? ''}
                                            onChange={(e) => handleScoreChange(exam.id, e.target.value)}
                                            className="form-input"
                                            style={{ width: '80px' }}
                                        />
                                    </div>
                                    <h4 style={{ margin: '15px 0 10px 0' }}>Temas a estudiar:</h4>
                                    <div id={`topics-${exam.id}`}>
                                        {exam.topics.map(topic => (
                                            <div key={topic.id} className="topic-item">
                                                <input
                                                    type="checkbox"
                                                    className="topic-checkbox"
                                                    checked={topic.studied}
                                                    onChange={() => handleTopicToggle(exam.id, topic.id)}
                                                />
                                                <div className="topic-content">
                                                    <div className="topic-title">{topic.name}</div>
                                                    <div className="topic-meta">Estudiado: {topic.studied ? 'Sí' : 'No'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                        <button className="btn btn-secondary" onClick={() => handleEditExam(exam)}>Editar Examen</button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => handleDeleteExam(exam.id)}
                                            style={{ backgroundColor: 'var(--error)', color: 'var(--on-error)' }}
                                        >
                                            <MdDelete style={{ marginRight: '4px' }} /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal controlado por props */}
            {showExamModal && (
                <Modal title={editingExam ? `Editar Examen: ${editingExam.title}` : 'Nuevo Examen'} onClose={onCloseExamModal}>
                    <ExamForm onSubmit={handleExamFormSubmit} initialData={editingExam} />
                </Modal>
            )}
        </div>
    );
};

export default Exams;