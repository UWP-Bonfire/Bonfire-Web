import { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { useAuth } from './useAuth';

export const useFavoritedChats = () => {
    const { user } = useAuth();
    const [favoritedChats, setFavoritedChats] = useState([]);

    useEffect(() => {
        if (!user) {
            setFavoritedChats([]);
            return;
        }

        const userRef = doc(firestore, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (userSnap) => {
            setFavoritedChats(userSnap.data()?.favoritedChats || []);
        });

        return unsubscribe;
    }, [user]);

    const toggleFavorite = async (chatKey) => {
        if (!user) return;

        const isCurrentlyFavorited = favoritedChats.includes(chatKey);
        const newFavorited = isCurrentlyFavorited
            ? favoritedChats.filter(id => id !== chatKey)
            : [...favoritedChats, chatKey];

        setFavoritedChats(newFavorited); // optimistic update

        try {
            await updateDoc(doc(firestore, 'users', user.uid), {
                favoritedChats: isCurrentlyFavorited ? arrayRemove(chatKey) : arrayUnion(chatKey)
            });
        } catch (err) {
            console.error("Error toggling favorite:", err);
            setFavoritedChats(favoritedChats); // revert on error
        }
    };

    return { favoritedChats, toggleFavorite };
};