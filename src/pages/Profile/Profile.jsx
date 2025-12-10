import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import useLocalStorage from '../../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Camera, LogOut, Save } from 'lucide-react';

const Profile = () => {

    const navigate = useNavigate();
    const [userUID] = useLocalStorage("userUID", null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        photoURL: '',
        reminderInterval: ''
    });

    const [isLoading, setIsLoading] = useState(true);
    const auth = getAuth();

    //  Cargar datos desde Firestore + Firebase Auth
    const loadProfile = async (user) => {
        const profileRef = doc(db, "users", user.uid);
        const snap = await getDoc(profileRef);

        if (snap.exists()) {
            // Perfil guardado en Firestore
            setFormData({
                fullName: snap.data().fullName || '',
                email: user.email || '',
                phone: snap.data().phone || '',
                photoURL: snap.data().photoURL || user.photoURL || '',
                reminderInterval: snap.data().reminderInterval || ''
            });
        } else {
            // Crear un perfil base
            const initialProfile = {
                fullName: user.displayName || '',
                email: user.email || '',
                phone: '',
                photoURL: user.photoURL || ''
            };

            await setDoc(profileRef, initialProfile);
            setFormData(initialProfile);
        }

        setIsLoading(false);
    };


    // Escucha de usuario autenticado
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate("/auth");
                return;
            }
            await loadProfile(user);
        });

        return () => unsubscribe();
    }, []);


    // Manejar inputs del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejar imagen de perfil (solo URL local por ahora)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                const fileURL = URL.createObjectURL(file); // previsualización local
                setFormData(prev => ({
                    ...prev,
                    photoURL: fileURL
                }));
            } else {
                alert("Seleccioná una imagen válida");
            }
        }
    };

    //  Guardar cambios en Firestore
    const handleSubmit = async (e) => {
        e.preventDefault();

        const profileRef = doc(db, "users", userUID);

        await updateDoc(profileRef, {
            fullName: formData.fullName,
            phone: formData.phone,
            photoURL: formData.photoURL,
            reminderInterval: formData.reminderInterval ? parseInt(formData.reminderInterval) : null
        });

        alert("Perfil actualizado correctamente 🚀");
    };

    // Cerrar sesión
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/auth");
        } catch (err) {
            alert("Error al cerrar sesión");
        }
    };


    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh] text-text-secondary">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
            Cargando perfil...
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 max-w-2xl mx-auto space-y-8"
        >
            <div>
                <h1 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">
                    Tu Perfil
                </h1>
                <p className="text-text-secondary mt-1">Gestioná tu información personal</p>
            </div>

            <div className="glass-card p-8 border border-white/5 shadow-xl relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-2xl relative bg-surface-card">
                                {formData.photoURL ? (
                                    <img
                                        src={formData.photoURL}
                                        alt="Profile"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-text-secondary">
                                        <User size={48} />
                                    </div>
                                )}

                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="text-white" size={24} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-text-primary">{formData.fullName || 'Estudiante'}</h2>
                            <p className="text-text-secondary text-sm">{formData.email}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-text-secondary uppercase mb-1 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full bg-surface/30 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-text-secondary cursor-not-allowed focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text-secondary uppercase mb-1 ml-1">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text-primary focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50 hover:bg-surface/70"
                                    placeholder="Tu nombre"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text-secondary uppercase mb-1 ml-1">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text-primary focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50 hover:bg-surface/70"
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-text-secondary uppercase mb-1 ml-1">Recordatorio de Tareas (minutos)</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                </div>
                                <input
                                    type="number"
                                    name="reminderInterval"
                                    value={formData.reminderInterval || ''}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full bg-surface/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-text-primary focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50 hover:bg-surface/70"
                                    placeholder="Ej: 30"
                                />
                            </div>
                            <p className="text-xs text-text-secondary mt-1 ml-1">Te notificaremos si tenés tareas pendientes cada X minutos.</p>
                        </div>
                    </div>

                    <div className="pt-6 flex flex-col sm:flex-row gap-3">
                        <button
                            className="flex-1 btn bg-primary hover:bg-primary-action text-white py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 font-medium"
                            type="submit"
                        >
                            <Save size={18} /> Guardar Cambios
                        </button>

                        <button
                            className="flex-1 btn bg-surface hover:bg-red-500/10 text-text-secondary hover:text-red-400 border border-white/10 hover:border-red-500/30 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
                            type="button"
                            onClick={handleLogout}
                        >
                            <LogOut size={18} /> Cerrar Sesión
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default Profile;
