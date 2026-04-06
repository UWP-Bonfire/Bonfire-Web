import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import useBlockUser from './useBlockUser';
import { firestore } from '../../firebase';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    getDocs,
    where,
    doc,
    updateDoc,
} from 'firebase/firestore';

const CHAT_TYPES = {
    DIRECT: 'direct',
    GLOBAL: 'global',
    GROUP: 'group',
};

const getDirectChatId = (uid1, uid2) => {
    return [uid1, uid2].sort((left, right) => left.localeCompare(right)).join('_');
};

const resolveChatType = (chatTarget) => {
    if (typeof chatTarget === 'string') {
        return chatTarget === CHAT_TYPES.GLOBAL ? CHAT_TYPES.GLOBAL : CHAT_TYPES.DIRECT;
    }

    return chatTarget?.type || CHAT_TYPES.DIRECT;
};

const getMessagePath = (userId, chatId, chatType) => {
    if (!userId || !chatId) {
        return null;
    }

    if (chatType === CHAT_TYPES.GLOBAL || chatId === CHAT_TYPES.GLOBAL) {
        return 'messages';
    }

    if (chatType === CHAT_TYPES.GROUP) {
        return `groupChats/${chatId}/messages`;
    }

    return `chats/${getDirectChatId(userId, chatId)}/messages`;
};

const useChat = (chatTarget) => {
    const { user, userProfile } = useAuth();
    const { blockedUsers } = useBlockUser();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfiles, setUserProfiles] = useState({});
    const profilesRef = useRef({});
    const chatId = typeof chatTarget === 'string' ? chatTarget : chatTarget?.id;
    const chatType = resolveChatType(chatTarget);

    useEffect(() => {
        profilesRef.current = userProfiles;
    }, [userProfiles]);

    const fetchUserProfiles = useCallback(async (uids) => {
        const uidsToFetch = uids.filter(uid => !profilesRef.current[uid]);
        if (uidsToFetch.length === 0) return;

        const newUserProfiles = {};
        const chunks = [];

        for (let i = 0; i < uidsToFetch.length; i += 30) {
            chunks.push(uidsToFetch.slice(i, i + 30));
        }

        for (const chunk of chunks) {
            const usersQuery = query(
                collection(firestore, 'users'),
                where('__name__', 'in', chunk)
            );

            const usersSnapshot = await getDocs(usersQuery);

            usersSnapshot.forEach(doc => {
                newUserProfiles[doc.id] = doc.data();
            });
        }

        setUserProfiles(prevProfiles => ({
            ...prevProfiles,
            ...newUserProfiles
        }));
    }, []);

    useEffect(() => {
        if (!user || !chatId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        setMessages([]);
        setLoading(true);

        const blockedIds = new Set(blockedUsers.map(u => u.id));

        const messagesPath = getMessagePath(user.uid, chatId, chatType);

        if (!messagesPath) {
            setMessages([]);
            setLoading(false);
            return;
        }

        const messagesRef = collection(firestore, messagesPath);
        const q = query(messagesRef, orderBy("timestamp"));

        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                const allMessages = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Filter blocked users
                const filteredMessages = allMessages.filter(
                    msg => !blockedIds.has(msg.senderId)
                );

                setMessages(filteredMessages);

                const uids = [
                    ...new Set(
                        filteredMessages
                            .map(msg => msg.senderId)
                            .filter(Boolean)
                    )
                ];

                if (uids.length > 0) {
                    fetchUserProfiles(uids);
                }

                setLoading(false);
            },
            (err) => {
                console.error("Error fetching messages: ", err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user, chatId, chatType, blockedUsers, fetchUserProfiles]);

    const sendMessage = useCallback(async (text) => {
        if (text.trim() === "" || !user || !userProfile || !chatId) return;

        const messagesPath = getMessagePath(user.uid, chatId, chatType);

        if (!messagesPath) return;

        const messagesRef = collection(firestore, messagesPath);

        try {
            await addDoc(messagesRef, {
                text,
                timestamp: serverTimestamp(),
                senderId: user.uid,
                displayName: userProfile.name || 'Anonymous',
                photoURL: userProfile.avatar,
                read: false,
            });
        } catch (err) {
            console.error("Error sending message: ", err);
        }
    }, [user, userProfile, chatId, chatType]);

    const markMessageAsRead = useCallback(async (messageId) => {
        if (!user || !chatId || chatType !== CHAT_TYPES.DIRECT) return;

        const directChatId = getDirectChatId(user.uid, chatId);
        const messagesPath = `chats/${directChatId}/messages`;
        const messageRef = doc(firestore, messagesPath, messageId);

        try {
            await updateDoc(messageRef, {
                read: true,
            });
        } catch (err) {
            console.error("Error marking message as read: ", err);
        }
    }, [user, chatId, chatType]);

    return {
        messages,
        loading,
        sendMessage,
        userProfiles,
        markMessageAsRead
    };
};

export default useChat;