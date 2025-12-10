import React from 'react';
import Auth from '../../components/Auth/Auth';

const AuthPage = ({ isRegistering = false }) => {
    return (
        <div className="min-h-screen grid place-items-center bg-background p-4 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] opacity-40 animate-pulse delay-1000"></div>
            </div>

            <Auth isRegistering={isRegistering} />
        </div>
    );
};

export default AuthPage;