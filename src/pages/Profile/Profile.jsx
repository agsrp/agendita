import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    // Inicializamos con un objeto vacío en lugar de null
    const [profile, setProfile] = useLocalStorage('profile', {
        fullName: '',
        email: '',
        phone: '',
        photoURL: ''
    });
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);

    // Inicializamos formData con valores seguros, protegiéndonos contra profile = null
    const [formData, setFormData] = useState(() => {
        // Usamos el objeto profile o un objeto vacío como fallback para evitar el acceso directo a propiedades de null
        const safeProfile = profile || { fullName: '', email: '', phone: '', photoURL: '' };
        return {
            fullName: safeProfile.fullName || '',
            email: safeProfile.email || '',
            phone: safeProfile.phone || '',
            photoURL: safeProfile.photoURL || ''
        };
    });

    const navigate = useNavigate();

    // Cargar datos iniciales del usuario autenticado
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && !initialDataLoaded) {
                // Si el perfil local está vacío o no tiene email (lo que indica que es la primera vez),
                // lo inicializamos con los datos de Firebase Auth
                const currentProfile = profile || { fullName: '', email: '', phone: '', photoURL: '' }; // Asegura que currentProfile no sea null
                if (!currentProfile.email) {
                    const initialProfile = {
                        fullName: user.displayName || currentProfile.fullName || '', // Prioriza Google, luego lo local, luego vacío
                        email: user.email || '', // Siempre debería estar
                        phone: currentProfile.phone || '', // Mantener lo local si existe
                        photoURL: user.photoURL || currentProfile.photoURL || '' // Prioriza Google, luego lo local, luego vacío
                    };
                    setProfile(initialProfile); // Actualiza el hook
                    setFormData(initialProfile); // Actualiza el estado local también
                } else {
                    // Si ya había datos locales, solo actualizamos el estado local con ellos
                    setFormData(currentProfile);
                }
                setInitialDataLoaded(true);
            } else if (!user) {
                // Usuario no autenticado, resetear datos
                setProfile({
                    fullName: '',
                    email: '',
                    phone: '',
                    photoURL: ''
                });
                setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    photoURL: ''
                });
            }
        });

        return () => unsubscribe();
    }, [setProfile, initialDataLoaded, profile]); // Agregamos 'profile' a las dependencias

    // Este useEffect se encarga de actualizar el estado local formData
    // si el hook profile cambia DESPUÉS de la carga inicial
    useEffect(() => {
        if (initialDataLoaded) {
            // Asegura que profile no sea null antes de acceder a sus propiedades
            const safeProfile = profile || { fullName: '', email: '', phone: '', photoURL: '' };
            if (safeProfile.fullName !== formData.fullName ||
                safeProfile.email !== formData.email ||
                safeProfile.phone !== formData.phone ||
                safeProfile.photoURL !== formData.photoURL) {
                 setFormData({
                    fullName: safeProfile.fullName,
                    email: safeProfile.email,
                    phone: safeProfile.phone,
                    photoURL: safeProfile.photoURL
                });
            }
        }
    }, [profile, initialDataLoaded, formData.fullName, formData.email, formData.phone, formData.photoURL]); // Dependencias específicas


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const fileURL = URL.createObjectURL(file);
                setFormData(prev => ({
                    ...prev,
                    photoURL: fileURL
                }));
            } else {
                alert('Por favor, selecciona un archivo de imagen.');
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProfile(formData);
        alert('Perfil guardado correctamente');
    };

    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            setProfile(null); // Limpia el perfil local (esto lo reiniciará a {} en la próxima carga)
            setFormData({ fullName: '', email: '', phone: '', photoURL: '' }); // Limpia el estado local
            console.log('Usuario deslogueado');
            navigate('/auth');
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
            alert('Hubo un error al cerrar sesión. Por favor, inténtalo de nuevo.');
        }
    };

    return (
        <div>
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Configuración de Perfil</h3>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div className="form-group">
                        <label className="form-label">Email (obligatorio)</label>
                        <input
                            type="email"
                            className="form-input"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled // Deshabilitar edición del email
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Nombre Completo (obligatorio)</label>
                        <input
                            type="text"
                            className="form-input"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Teléfono (opcional)</label>
                        <input
                            type="tel"
                            className="form-input"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                     <div className="form-group">
                        <label className="form-label">Foto de Perfil (opcional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                         {formData.photoURL && (
                            <div style={{ marginTop: '10px' }}>
                                <p>Foto Actual:</p>
                                <img src={formData.photoURL} alt="Foto de perfil" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                            </div>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleLogout}
                        style={{ marginLeft: '10px' }}
                    >
                        Cerrar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;