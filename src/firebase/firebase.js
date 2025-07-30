// Re-export Firebase configuration from centralized file
export { app, analytics, db, storage, auth } from './firebaseConfig';

// This file is kept for backward compatibility
// All Firebase services are now initialized in firebaseConfig.js
