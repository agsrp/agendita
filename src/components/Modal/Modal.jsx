import React from 'react';

const Modal = ({ title, children, onClose }) => {
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal" style={{ display: 'flex' }} onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="close-modal" onClick={onClose}>&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;