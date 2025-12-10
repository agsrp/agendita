import React, { useState } from 'react';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../../hooks/useLocalStorage';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, Check, AlertTriangle, ArrowRight, Loader2, Camera } from 'lucide-react';

const Auth = ({ isRegistering = false }) => {
    const [isLogin, setIsLogin] = useState(!isRegistering);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoURL, setPhotoURL] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [setUserUID] = useLocalStorage('userUID', null);
    const [setProfile] = useLocalStorage('profile', null);
    const navigate = useNavigate();
    const provider = new GoogleAuthProvider();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let userCredential;
            if (isLogin) {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                if (!fullName.trim()) throw new Error('El nombre completo es obligatorio.');
                if (!email.trim()) throw new Error('El email es obligatorio.');
                if (!password || password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');

                userCredential = await createUserWithEmailAndPassword(auth, email, password);

                const initialProfile = {
                    fullName: fullName.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    photoURL: photoURL || ''
                };
                setProfile(initialProfile);
            }

            setUserUID(userCredential.user.uid);
            navigate('/dashboard');
        } catch (err) {
            console.error('Error de autenticación:', err);
            let errorMessage = 'Ocurrió un error inesperado.';
            if (err.code === 'auth/user-not-found') errorMessage = 'No existe cuenta con este email.';
            else if (err.code === 'auth/wrong-password') errorMessage = 'Contraseña incorrecta.';
            else if (err.code === 'auth/email-already-in-use') errorMessage = 'El email ya está uso.';
            else if (err.code === 'auth/invalid-credential') errorMessage = 'Credenciales inválidas.';
            else errorMessage = err.message;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const initialProfile = {
                fullName: user.displayName || '',
                email: user.email || '',
                phone: '',
                photoURL: user.photoURL || ''
            };
            setProfile(initialProfile);
            setUserUID(user.uid);
            navigate('/dashboard');
        } catch (err) {
            console.error('Google Auth Error:', err);
            setError('Error al iniciar con Google.');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const fileURL = URL.createObjectURL(file);
            setPhotoURL(fileURL);
            setPhotoFile(file);
        }
    };

    // Input Helper
    const InputField = ({ icon: Icon, type, placeholder, value, onChange, required, minLength, accept }) => (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                <Icon size={18} />
            </div>
            {type === 'file' ? (
                <div className="relative">
                    <input
                        type="file"
                        accept={accept}
                        onChange={onChange}
                        className="hidden"
                        id="photo-upload"
                    />
                    <label
                        htmlFor="photo-upload"
                        className="flex items-center gap-3 w-full bg-surface/50 border border-white/5 rounded-xl p-3 pl-10 text-sm text-text-secondary hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        {photoURL ? 'Cambiar foto' : 'Subir foto de perfil'}
                    </label>
                </div>

            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    minLength={minLength}
                    className="w-full bg-surface/50 border border-white/5 rounded-xl p-3 pl-10 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                />
            )}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10 -ml-16 -mb-16 pointer-events-none" />

                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        {isLogin ? '¡Hola de nuevo!' : 'Crear Cuenta'}
                    </h2>
                    <p className="text-text-secondary text-sm mt-2">
                        {isLogin ? 'Ingresá tus datos para continuar' : 'Registrate para organizar tus estudios'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg mb-6 flex items-start gap-2 text-sm"
                        >
                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 overflow-hidden"
                            >
                                <InputField icon={User} type="text" placeholder="Nombre Completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                <InputField icon={Phone} type="tel" placeholder="Teléfono (Opcional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                <div className="flex gap-4 items-center">
                                    <div className="grow">
                                        <InputField icon={Camera} type="file" accept="image/*" onChange={handlePhotoChange} />
                                    </div>
                                    {photoURL && (
                                        <motion.img
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            src={photoURL}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                                        />
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <InputField icon={Mail} type="email" placeholder="Correo Electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <InputField icon={Lock} type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group mb-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                        {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0F1115] px-2 text-text-secondary">O continúa con</span></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full bg-surface hover:bg-surface/80 border border-white/10 text-text-primary p-3 rounded-xl transition-all flex items-center justify-center gap-3 text-sm font-medium"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                </button>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-text-secondary hover:text-primary transition-colors font-medium"
                    >
                        {isLogin ? '¿No tenés cuenta? Create una acá' : '¿Ya tenés cuenta? Iniciá sesión'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Auth;