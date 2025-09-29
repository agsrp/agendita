import React, { useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import Modal from '../../components/Modal/Modal';
import SubjectForm from '../../components/SubjectForm/SubjectForm'; // Asumiendo que lo creas

const Subjects = () => {
    const [subjects, setSubjects] = useLocalStorage('subjects', []);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);

    const handleAddSubject = () => {
        setEditingSubject(null);
        setShowSubjectModal(true);
    };

    const handleEditSubject = (subject) => {
        setEditingSubject(subject);
        setShowSubjectModal(true);
    };

    const handleSubjectFormSubmit = (formData) => {
        if (editingSubject) {
            // Editar
            setSubjects(prev => prev.map(s => s.id === editingSubject.id ? { ...s, ...formData } : s));
        } else {
            // Crear
            const newSubject = { id: Date.now(), ...formData };
            setSubjects(prev => [...prev, newSubject]);
        }
        setShowSubjectModal(false);
    };

    return (
        <div>
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Mis Materias</h3>
                    <button className="btn btn-primary" onClick={handleAddSubject}>+ Nueva Materia</button>
                </div>
                <div className="dashboard-grid" id="subjectsGrid">
                    {subjects.map(subject => (
                        <div key={subject.id} className="card">
                            <div className="card-header">
                                <h3 className="card-title">{subject.name}</h3>
                                <span className="material-icons">menu_book</span>
                            </div>
                            <div className="card-content">
                                <p><strong>Código:</strong> {subject.code}</p>
                                <p><strong>Profesor:</strong> {subject.professor}</p>
                                <p><strong>Horario:</strong> {subject.schedule}</p>
                                <button className="btn btn-secondary" onClick={() => handleEditSubject(subject)} style={{ marginTop: '10px' }}>Editar</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showSubjectModal && (
                <Modal title={editingSubject ? `Editar Materia: ${editingSubject.name}` : 'Nueva Materia'} onClose={() => setShowSubjectModal(false)}>
                    <SubjectForm onSubmit={handleSubjectFormSubmit} initialData={editingSubject} />
                </Modal>
            )}
        </div>
    );
};

export default Subjects;