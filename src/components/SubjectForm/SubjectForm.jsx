import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';

const SubjectForm = ({ onSubmit, initialData = null, onDelete = null }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        code: initialData?.code || '',
        professor: initialData?.professor || '',
    });

    const [schedules, setSchedules] = useState([{ day: '', startTime: '', endTime: '' }]);

    useEffect(() => {
        if (initialData?.schedule) {
            const scheduleParts = initialData.schedule.split(', ');
            const parsedSchedules = scheduleParts.map(part => {
                const parts = part.split(' ');
                if (parts.length >= 4) {
                    return {
                        day: parts[0],
                        startTime: parts[1],
                        endTime: parts[3]
                    };
                }
                return { day: '', startTime: '', endTime: '' };
            }).filter(s => s.day !== '');

            if (parsedSchedules.length > 0) {
                setSchedules(parsedSchedules);
            }
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleScheduleChange = (index, field, value) => {
        const newSchedules = [...schedules];
        newSchedules[index][field] = value;
        setSchedules(newSchedules);
    };

    const addSchedule = () => {
        setSchedules([...schedules, { day: '', startTime: '', endTime: '' }]);
    };

    const removeSchedule = (index) => {
        const newSchedules = schedules.filter((_, i) => i !== index);
        setSchedules(newSchedules);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const scheduleString = schedules
            .filter(s => s.day && s.startTime && s.endTime)
            .map(s => `${s.day} ${s.startTime} - ${s.endTime}`)
            .join(', ');

        onSubmit({
            name: formData.name,
            code: formData.code,
            professor: formData.professor,
            schedule: scheduleString
        });
    };

    const inputClasses = "w-full bg-surface/50 border border-white/10 rounded-xl p-3 text-text-primary focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/50";
    const labelClasses = "block text-sm font-medium text-text-secondary mb-1.5";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClasses}>Nombre</label>
                <input
                    type="text"
                    className={inputClasses}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>Código</label>
                    <input
                        type="text"
                        className={inputClasses}
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label className={labelClasses}>Profesor</label>
                    <input
                        type="text"
                        className={inputClasses}
                        name="professor"
                        value={formData.professor}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="bg-surface/30 p-4 rounded-xl border border-white/5">
                <label className={`mb-3 flex items-center justify-between ${labelClasses}`}>
                    <span>Horarios de Cursada</span>
                </label>
                <div className="space-y-3">
                    {schedules.map((schedule, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-surface/40 p-3 rounded-lg border border-white/5">
                            <div className="w-full sm:flex-1">
                                <span className="text-xs text-text-secondary mb-1 block sm:hidden">Día</span>
                                <select
                                    className={`${inputClasses} py-2`}
                                    value={schedule.day}
                                    onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                                    required
                                >
                                    <option value="">Día</option>
                                    <option value="Lunes">Lunes</option>
                                    <option value="Martes">Martes</option>
                                    <option value="Miércoles">Miércoles</option>
                                    <option value="Jueves">Jueves</option>
                                    <option value="Viernes">Viernes</option>
                                    <option value="Sábado">Sábado</option>
                                    <option value="Domingo">Domingo</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="flex-1">
                                    <span className="text-xs text-text-secondary mb-1 block sm:hidden">Inicio</span>
                                    <input
                                        type="time"
                                        className={`${inputClasses} py-2`}
                                        value={schedule.startTime}
                                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                                        required
                                    />
                                </div>
                                <span className="text-text-secondary pt-4 sm:pt-0">-</span>
                                <div className="flex-1">
                                    <span className="text-xs text-text-secondary mb-1 block sm:hidden">Fin</span>
                                    <input
                                        type="time"
                                        className={`${inputClasses} py-2`}
                                        value={schedule.endTime}
                                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {schedules.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSchedule(index)}
                                    className="p-2 text-text-secondary hover:text-accent-urgent hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
                                    title="Eliminar horario"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    className="mt-3 flex items-center gap-2 text-primary hover:text-primary-action text-sm font-medium px-2 py-1 hover:bg-white/5 rounded-lg transition-colors"
                    onClick={addSchedule}
                >
                    <Plus size={16} />
                    Agregar otro horario
                </button>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-6">
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 text-white rounded-xl px-5 py-2.5 font-medium transition-colors cursor-pointer"
                    >
                        Guardar
                    </button>
                    <button
                        type="button"
                        className="bg-surface hover:bg-white/5 text-text-secondary hover:text-text-primary border border-white/10 rounded-xl px-5 py-2.5 font-medium transition-colors cursor-pointer"
                        onClick={() => onSubmit(null)}
                    >
                        Cancelar
                    </button>
                </div>
                {onDelete && (
                    <button
                        type="button"
                        className="flex items-center gap-2 text-accent-urgent hover:bg-accent-urgent/10 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                        onClick={onDelete}
                    >
                        <Trash2 size={18} />
                        <span className="text-sm font-medium">Eliminar</span>
                    </button>
                )}
            </div>
        </form>
    );
};

export default SubjectForm;