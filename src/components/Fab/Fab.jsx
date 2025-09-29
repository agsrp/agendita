import React, { useState } from 'react';

const Fab = ({ onAddTask, onAddSubject, onAddExam }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleItemClick = (action) => {
        action();
        setIsOpen(false); // Cierra el menú después de la acción
    };

    return (
        <div className="fab-container"> {/* Este contenedor puede ayudar con la posición si es necesario */}
            <button className="fab" onClick={toggleMenu}>
                <span className="material-icons">add</span>
            </button>
            <div className={`fab-menu ${isOpen ? 'open' : ''}`}>
                <button className="fab-menu-item" onClick={() => handleItemClick(onAddTask)}>
                    <span className="material-icons">checklist</span>
                    <span className="fab-menu-item-label">Tarea</span>
                </button>
                <button className="fab-menu-item" onClick={() => handleItemClick(onAddSubject)}>
                    <span className="material-icons">menu_book</span>
                    <span className="fab-menu-item-label">Materia</span>
                </button>
                <button className="fab-menu-item" onClick={() => handleItemClick(onAddExam)}>
                    <span className="material-icons">assignment</span>
                    <span className="fab-menu-item-label">Examen</span>
                </button>
            </div>
        </div>
    );
};

export default Fab;