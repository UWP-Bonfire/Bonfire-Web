import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { useAuth } from './useAuth';
// Compare function: sort chats by most recent message (descending)
export const compareChatsByRecent = (a, b) => {
    return (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0);
};

// ...existing code...

const useChatSettings = () => {
    const { user } = useAuth();

    // Custom compare function: always put user.uid first
    const getChatId = (uid1, uid2) => {
        // If you want a different order, adjust this logic
        return `${uid1}_${uid2}`;
    };

    const toggleLimit = async (friendId, currentStatus) => {
        if (!user) return;
        const chatId = getChatId(user.uid, friendId);
        const chatRef = doc(firestore, 'chats', chatId);

        try {
            const chatSnap = await getDoc(chatRef);
            if (!chatSnap.exists()) {
                await setDoc(chatRef, { 
                    limitNotifications: !currentStatus,
                    users: [user.uid, friendId],
                    consecutiveUnread: { [user.uid]: 0, [friendId]: 0 }
                });
            } else {
                await updateDoc(chatRef, { limitNotifications: !currentStatus });
            }
        } catch (error) {
            console.error("Error toggling notification limit: ", error);
        }
    };

    return { toggleLimit };
};

export default useChatSettings;
