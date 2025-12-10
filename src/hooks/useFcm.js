import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const useFcm = (userUID) => {
    const [fcmToken, setFcmToken] = useState(null);
    const [notification, setNotification] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState(Notification.permission);
    const [error, setError] = useState(null);

    const retrieveToken = async () => {
        try {
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            if (!vapidKey) {
                const msg = 'VITE_FIREBASE_VAPID_KEY is missing';
                console.warn(msg);
                setError(msg);
                return;
            }

            let registration;
            try {
                registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                console.log('Service Worker registered with scope:', registration.scope);
            } catch (err) {
                console.error('Service Worker registration failed:', err);
                setError(`SW Error: ${err.message}`);
                return;
            }

            const token = await getToken(messaging, {
                vapidKey: vapidKey,
                serviceWorkerRegistration: registration
            });

            if (token) {
                console.log('FCM Token:', token);
                setFcmToken(token);
                setError(null);
            } else {
                console.log('No registration token available.');
                setError('No registration token available.');
            }
        } catch (error) {
            console.error('An error occurred while retrieving token. ', error);
            setError(`Token Error: ${error.message}`);
        }
    };

    const requestPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            setPermissionStatus(permission);
            if (permission === 'granted') {
                await retrieveToken();
            } else {
                setError(`Permission ${permission}`);
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
            setError(`Request Permission Error: ${error.message}`);
        }
    };

    useEffect(() => {
        if (permissionStatus === 'granted') {
            retrieveToken();
        }

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground Message received: ', payload);
            setNotification(payload);

            if (Notification.permission === 'granted') {
                new Notification(payload.notification.title, {
                    body: payload.notification.body,
                    icon: '/vite.svg',
                });
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const saveToken = async () => {
            if (fcmToken && userUID) {
                try {
                    await updateDoc(doc(db, "users", userUID), {
                        fcmToken: fcmToken
                    });
                    console.log('FCM Token saved to Firestore');
                } catch (error) {
                    console.error('Error saving FCM token to Firestore:', error);
                }
            }
        };

        const timeoutId = setTimeout(saveToken, 1000);
        return () => clearTimeout(timeoutId);
    }, [fcmToken, userUID]);

    return { fcmToken, notification, requestPermission, permissionStatus, error };
};

export default useFcm;
