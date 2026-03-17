
import { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, collection, query, where, documentId, getDocs } from 'firebase/firestore';
import { useAuth } from './useAuth';

const useBlockUser = () => {
    const { user } = useAuth();
    const [blockedUsers, setBlockedUsers] = useState([]);

    useEffect(() => {
        if (user) {
            const userRef = doc(firestore, 'users', user.uid);
            const unsubscribe = onSnapshot(userRef, async (doc) => {
                if (doc.exists() && doc.data().blockedUsers) {
                    const blockedIds = doc.data().blockedUsers;
                    if (blockedIds && blockedIds.length > 0) {
                        const blockedQuery = query(collection(firestore, 'users'), where(documentId(), 'in', blockedIds));
                        try {
                            const querySnapshot = await getDocs(blockedQuery);
                            const blockedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                            setBlockedUsers(blockedData);
                        } catch (err) {
                            console.error("Error fetching blocked users data: ", err);
                            setBlockedUsers([]);
                        }
                    } else {
                        setBlockedUsers([]);
                    }
                } else {
                    setBlockedUsers([]);
                }
            });

            return () => unsubscribe();
        }
    }, [user]);

    const blockUser = async (userIdToBlock) => {
        if (user) {
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                blockedUsers: arrayUnion(userIdToBlock)
            });
        }
    };

    const unblockUser = async (userIdToUnblock) => {
        if (user) {
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                blockedUsers: arrayRemove(userIdToUnblock)
            });
        }
    };

    return { blockedUsers, blockUser, unblockUser };
};

export default useBlockUser;
