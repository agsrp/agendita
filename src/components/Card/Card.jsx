import React from 'react';

const Card = ({ title, icon, content, children, headerAction }) => {
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">{title}</h3>
                {icon && <span className="material-icons">{icon}</span>}
                {headerAction}
            </div>
            {content && <div className="card-content"><p>{content}</p></div>}
            {children}
        </div>
    );
};

export default Card;