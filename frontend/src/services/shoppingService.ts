import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export interface ShoppingItem {
  id?: string;
  userId: string;
  name: string;
  completed: boolean;
}

export const getShoppingList = async (userId: string) => {
  const q = query(collection(db, "shoppingList"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const items: ShoppingItem[] = [];
  querySnapshot.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() } as ShoppingItem);
  });
  return items;
};

export const addShoppingItem = async (item: Omit<ShoppingItem, 'id'>) => {
  const docRef = await addDoc(collection(db, "shoppingList"), item);
  return docRef.id;
};

export const toggleShoppingItem = async (itemId: string, completed: boolean) => {
  await updateDoc(doc(db, "shoppingList", itemId), { completed });
};

export const deleteShoppingItem = async (itemId: string) => {
  await deleteDoc(doc(db, "shoppingList", itemId));
};
