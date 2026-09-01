import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

// A single purchase batch
export interface PantryItem {
  id?: string;
  userId: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  quantityPurchased: number;
  quantityRemaining: number;
  expiryDate: string; // YYYY-MM-DD
  purchaseDate: string; // YYYY-MM-DD
}

// Add a new product to the pantry
export const addToPantry = async (item: Omit<PantryItem, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, "pantry"), item);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

// Get all items for a specific user
export const getUserPantry = async (userId: string) => {
  try {
    const q = query(
      collection(db, "pantry"), 
      where("userId", "==", userId),
      where("quantityRemaining", ">", 0),
      // We will sort them by expiry date on the client side since Firestore 
      // requires an index for multiple field queries
    );
    const querySnapshot = await getDocs(q);
    const items: PantryItem[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as PantryItem);
    });
    
    // Sort by earliest expiry date first
    return items.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  } catch (e) {
    console.error("Error fetching pantry: ", e);
    throw e;
  }
};

// Use a product
export const consumeProduct = async (itemId: string, currentQuantity: number, amountUsed: number) => {
  try {
    const itemRef = doc(db, "pantry", itemId);
    const newQuantity = Math.max(0, currentQuantity - amountUsed);
    
    await updateDoc(itemRef, {
      quantityRemaining: newQuantity
    });
    
    // We would also log this in a 'transactions' collection for analytics here
    
    return newQuantity;
  } catch (e) {
    console.error("Error updating document: ", e);
    throw e;
  }
};
