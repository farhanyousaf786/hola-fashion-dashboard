import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const USERS_COLLECTION = 'users';

// Get all users with a computed orderCount from the 'orders' subcollection
export const getAllUsersWithOrderCounts = async () => {
  const usersCol = collection(db, USERS_COLLECTION);
  const snapshot = await getDocs(usersCol);
  const users = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  // For each user, count orders in subcollection 'orders'
  const withCounts = await Promise.all(
    users.map(async (u) => {
      try {
        const ordersSnap = await getDocs(collection(db, USERS_COLLECTION, u.uid || u.id, 'orders'));
        return { ...u, orderCount: ordersSnap.size };
      } catch (e) {
        console.error('Failed to count orders for user', u.uid || u.id, e);
        return { ...u, orderCount: 0 };
      }
    })
  );

  return withCounts;
};

// Get single user by uid (document id)
export const getUserById = async (uid) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

// Get all orders for a user (from subcollection 'orders')
export const getUserOrders = async (uid) => {
  const ordersCol = collection(db, USERS_COLLECTION, uid, 'orders');
  const snapshot = await getDocs(ordersCol);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Get a single order by id for a user
export const getUserOrder = async (uid, orderId) => {
  const orderRef = doc(db, USERS_COLLECTION, uid, 'orders', orderId);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};
