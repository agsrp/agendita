import { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, onSnapshot, doc } from 'firebase/firestore';

const useReminders = (userUID) => {
    const intervalRef = useRef(null);
    const [intervalMinutes, setIntervalMinutes] = useState(null);

    // Request permission on mount
    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Listen to user profile for reminderInterval changes
    useEffect(() => {
        if (!userUID) return;

        const unsubscribe = onSnapshot(doc(db, "users", userUID), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data.reminderInterval) {
                    setIntervalMinutes(parseInt(data.reminderInterval));
                } else {
                    setIntervalMinutes(null);
                }
            }
        });

        return () => unsubscribe();
    }, [userUID]);

    // Set up the interval based on the fetched setting
    useEffect(() => {
        if (!userUID || !intervalMinutes || intervalMinutes <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        const checkPendingTasks = async () => {
            if (Notification.permission !== 'granted') return;

            try {
                const q = query(collection(db, "users", userUID, "tasks"), where("completed", "==", false));
                const querySnapshot = await getDocs(q);
                const pendingCount = querySnapshot.size;

                if (pendingCount > 0) {
                    new Notification("Tenés tareas pendientes 📝", {
                        body: `Tenés ${pendingCount} tareas sin completar. ¡Revisalas!`,
                        icon: '/vite.svg'
                    });
                }
            } catch (error) {
                console.error("Error checking pending tasks for notification:", error);
            }
        };

        // Clear existing interval
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Schedule new interval
        const ms = intervalMinutes * 60 * 1000;
        intervalRef.current = setInterval(checkPendingTasks, ms);

        console.log(`Reminder interval set for every ${intervalMinutes} minutes.`);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [userUID, intervalMinutes]);
};

export default useReminders;
