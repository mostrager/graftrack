// Demo authentication functions
// This will be replaced with real Firebase auth once configuration is complete

export interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

// Mock auth functions for demo purposes
export const signInWithGoogle = () => {
  return Promise.resolve();
};

export const logOut = () => {
  return Promise.resolve();
};

export const onAuthChange = (callback: (user: DemoUser | null) => void) => {
  // Return empty function since we're using demo mode
  return () => {};
};