import React, { useState } from 'react';
import { auth } from '../../firebase'; // Asegúrate de que la ruta sea correcta
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../../hooks/useLocalStorage'; // Para guardar el UID localmente

const Auth = ({ isRegistering = false }) => { // Añadimos prop para indicar si es registro
    const [isLogin, setIsLogin] = useState(!isRegistering); // true para login, false para registro
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState(''); // Campo adicional para registro
    const [phone, setPhone] = useState(''); // Campo adicional para registro
    const [photoFile, setPhotoFile] = useState(null); // Campo adicional para registro
    const [photoURL, setPhotoURL] = useState(''); // URL local de la foto para previsualización
    const [error, setError] = useState(''); // Estado para manejar mensajes de error
    const [loading, setLoading] = useState(false);
    const [setUserUID] = useLocalStorage('userUID', null); // Guardamos el UID localmente
    const [setProfile] = useLocalStorage('profile', null); // Guardamos el perfil localmente
    const navigate = useNavigate();
    const provider = new GoogleAuthProvider();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Limpiar error anterior
        setLoading(true);

        try {
            let userCredential;
            if (isLogin) {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Validación adicional para registro
                if (!fullName.trim()) {
                    throw new Error('El nombre completo es obligatorio.');
                }
                if (!email.trim()) {
                    throw new Error('El email es obligatorio.');
                }
                if (!password) {
                    throw new Error('La contraseña es obligatoria.');
                }
                if (password.length < 6) {
                    throw new Error('La contraseña debe tener al menos 6 caracteres.');
                }

                userCredential = await createUserWithEmailAndPassword(auth, email, password);

                // Guardamos el perfil inicial en localStorage inmediatamente después del registro
                const initialProfile = {
                    fullName: fullName.trim(),
                    email: email.trim(), // Guardamos el email aquí también
                    phone: phone.trim(), // Puede ser vacío si no se ingresó
                    photoURL: photoURL || '' // Puede ser vacío si no se subió foto
                };
                setProfile(initialProfile);
            }

            // Guardamos el UID del usuario en localStorage
            setUserUID(userCredential.user.uid);
            console.log('Usuario autenticado:', userCredential.user.uid);
            navigate('/dashboard');
        } catch (err) {
            console.error('Error de autenticación:', err);
            // Mostrar un mensaje de error más descriptivo al usuario
            let errorMessage = 'Ocurrió un error inesperado.';
            if (err.code === 'auth/user-not-found') {
                errorMessage = 'No se encontró una cuenta con este email.';
            } else if (err.code === 'auth/wrong-password') {
                errorMessage = 'La contraseña ingresada es incorrecta.';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'El formato del email es inválido.';
            } else if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'Ya existe una cuenta con este email.';
            }
            // Puedes agregar más códigos de error de Firebase aquí según sea necesario
            setError(errorMessage || err.message); // Usa el mensaje específico o el genérico
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(''); // Limpiar error anterior
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Para Google, guardamos el perfil inicial con los datos de Google
            // Si el usuario no tiene nombre o foto en Google, puedes dejar campos vacíos o pedirlos después
            const initialProfile = {
                fullName: user.displayName || '', // Puede ser null si no está en Google
                email: user.email || '', // Siempre debería estar
                phone: '', // Google no proporciona teléfono directamente aquí
                photoURL: user.photoURL || '' // Puede ser null si no tiene foto en Google
            };
            setProfile(initialProfile); // Guardamos el perfil inicial

            setUserUID(user.uid);
            console.log('Usuario de Google autenticado:', user.uid);
            navigate('/dashboard');
        } catch (err) {
            console.error('Error de autenticación con Google:', err);
            let errorMessage = 'Ocurrió un error al iniciar sesión con Google.';
            // Puedes manejar códigos de error específicos de Google Sign-In aquí si es necesario
            setError(errorMessage || err.message);
        } finally {
            setLoading(false);
        }
    };

    // Eliminamos la función handleLogout ya que no se usará en esta vista

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const fileURL = URL.createObjectURL(file);
                setPhotoURL(fileURL);
                setPhotoFile(file); // Guardamos el archivo para posibles usos futuros (subida a storage)
            } else {
                setError('Por favor, selecciona un archivo de imagen.');
                setPhotoFile(null);
                setPhotoURL('');
            }
        }
    };

    // Vista para el formulario de registro
    const renderRegisterForm = () => (
        <>
            <div className="form-group">
                <label className="form-label">Nombre Completo (obligatorio)</label>
                <input
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label className="form-label">Email (obligatorio)</label>
                <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label className="form-label">Contraseña (obligatorio, mínimo 6 caracteres)</label>
                <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="6"
                />
            </div>
             <div className="form-group">
                <label className="form-label">Teléfono (opcional)</label>
                <input
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>
             <div className="form-group">
                <label className="form-label">Foto de Perfil (opcional)</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                />
                 {photoURL && (
                    <div style={{ marginTop: '10px' }}>
                        <p>Previsualización:</p>
                        <img src={photoURL} alt="Previsualización de perfil" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                )}
            </div>
        </>
    );

    // Vista para el formulario de login
    const renderLoginForm = () => (
        <>
            <div className="form-group">
                <label className="form-label">Email</label>
                <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
        </>
    );

    return (
        <div className="card" style={{ maxWidth: '400px', margin: 'auto', padding: '32px' }}>
            <div className="card-header">
                <h3 className="card-title">{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h3>
            </div>
            <div className="card-content">
                {/* Mostrar mensaje de error si existe */}
                {error && <p style={{ color: 'var(--error)', marginBottom: '16px' }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    {isLogin ? renderLoginForm() : renderRegisterForm()}
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
                    </button>
                </form>
                <div style={{ marginTop: '16px' }}>
                    <button className="btn btn-secondary" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
                {!isLogin && (
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <p style={{ marginBottom: '8px' }}>O crea tu cuenta con:</p>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Google
                        </button>
                    </div>
                )}
                {isLogin && (
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <p style={{ marginBottom: '8px' }}>O inicia sesión con:</p>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Google
                        </button>
                    </div>
                )}
                {/* Botón de cerrar sesión REMOVIDO */}
            </div>
        </div>
    );
};

export default Auth;