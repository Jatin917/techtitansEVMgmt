import React from 'react';
import { authenticationPopup } from '../../firebase/firebasePopup';
import { Chrome } from 'lucide-react';

const GoogleAuthButton = () => {
  async function handleGoogleAuth() {
    try {
      await authenticationPopup();
    } catch (error) {
      console.error("Google Authentication failed:", error);
    }
  }

  return (
    <button
      onClick={handleGoogleAuth}
      className="
        flex items-center justify-center
        w-full max-w-xs md:max-w-sm
        px-6 py-3
        text-base font-medium
        text-gray-700
        bg-white
        border border-gray-300
        rounded-lg
        shadow-sm
        hover:bg-gray-50
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        transition-all duration-200
        cursor-pointer
      "
    >
      <span className="mr-2">Sign in with Google</span>
      <Chrome className="w-5 h-5 text-blue-500" />
    </button>
  );
};

export default GoogleAuthButton;