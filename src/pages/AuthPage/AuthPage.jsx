import React from 'react';
import Auth from '../../components/Auth/Auth';

const AuthPage = ({ isRegistering = false }) => { // Recibe prop
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Auth isRegistering={isRegistering} /> {/* Pasa la prop */}
        </div>
    );
};

export default AuthPage;