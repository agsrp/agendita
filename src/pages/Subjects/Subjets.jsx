import React, { useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import Modal from '../../components/Modal/Modal';
import SubjectForm from '../../components/SubjectForm/SubjectForm';

const Subjects = ({ showSubjectModal = false, onCloseSubjectModal }) => {
    const [subjects, setSubjects] = useLocalStorage('subjects', []);
    const [editingSubject, setEditingSubject] = useState(null);

    const handleAddSubject = () => {
        setEditingSubject(null);
        if (onCloseSubjectModal) onCloseSubjectModal(); // Cierra el modal si estaba abierto por otra acción
    };

    const handleEditSubject = (subject) => {
        setEditingSubject(subject);
        if (onCloseSubjectModal) onCloseSubjectModal(); // Cierra el modal si estaba abierto por otra acción
    };

    const handleSubjectFormSubmit = (formData) => {
        if (editingSubject) {
            setSubjects(prev => prev.map(s => s.id === editingSubject.id ? { ...s, ...formData } : s));
        } else {
            const newSubject = { id: Date.now(), ...formData };
            setSubjects(prev => [...prev, newSubject]);
        }
        if (onCloseSubjectModal) onCloseSubjectModal(); // Cierra el modal después de guardar
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

            {/* Modal controlado por props */}
            {showSubjectModal && (
                <Modal title={editingSubject ? `Editar Materia: ${editingSubject.name}` : 'Nueva Materia'} onClose={onCloseSubjectModal}>
                    <SubjectForm onSubmit={handleSubjectFormSubmit} initialData={editingSubject} />
                </Modal>
            )}
        </div>
    );
};

export default Subjects;