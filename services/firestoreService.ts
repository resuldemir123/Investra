
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    Timestamp,
    doc,
    setDoc,
    getDoc,
    deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { AnalysisResult, SavedAnalysis } from '../types';

export const saveAnalysisToFirestore = async (userId: string, title: string, summary: string, result: AnalysisResult) => {
    try {
        const docRef = await addDoc(collection(db, 'users', userId, 'analyses'), {
            title,
            summary,
            result,
            timestamp: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding document: ", error);
        throw error;
    }
};

export const getAnalysesFromFirestore = async (userId: string): Promise<SavedAnalysis[]> => {
    try {
        const q = query(collection(db, 'users', userId, 'analyses'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                timestamp: data.timestamp.toMillis(),
                title: data.title,
                summary: data.summary,
                result: data.result as AnalysisResult
            };
        });
    } catch (error) {
        console.error("Error getting documents: ", error);
        throw error;
    }
};

export const uploadPdfToStorage = async (userId: string, analysisId: string, pdfBlob: Blob) => {
    try {
        const storageRef = ref(storage, `users/${userId}/reports/${analysisId}.pdf`);
        await uploadBytes(storageRef, pdfBlob);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading PDF: ", error);
        throw error;
    }
};

export const createUserProfile = async (userId: string, data: { name: string; email: string }) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                ...data,
                createdAt: Timestamp.now(),
                role: 'free' // or 'premium'
            });
        }
    } catch (error) {
        console.error("Error creating user profile: ", error);
        throw error;
    }
};

export const getUserProfile = async (userId: string) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
        console.error("Error getting user profile: ", error);
        throw error;
    }
};

export const updateUserProfile = async (userId: string, data: any) => {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, data, { merge: true });
    } catch (error) {
        console.error("Error updating user profile: ", error);
        throw error;
    }
};
