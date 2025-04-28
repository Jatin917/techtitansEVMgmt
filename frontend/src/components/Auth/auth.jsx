import React from 'react';
import './Auth.css';
import GoogleAuthButton from '../GoogleAuthenticationButton/GoogleButton';

const Auth = () => {

  return (
    <section className="auth-section">
      <div className="auth-container-2">
        <GoogleAuthButton />
      </div>
    </section>
  );
};

export default Auth;
