import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase-config";

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<UserCredential>} User credential object
 */
export const emailSignUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};
