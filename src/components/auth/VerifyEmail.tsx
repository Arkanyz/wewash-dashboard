import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';

const VerifyEmail = () => {
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Vérifiez votre email
          </h2>
          <div className="mt-4 text-center text-gray-600">
            <p>
              Nous avons envoyé un email de vérification à{' '}
              <span className="font-medium">{email}</span>
            </p>
            <p className="mt-2">
              Veuillez cliquer sur le lien dans l'email pour activer votre compte.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Vous n'avez pas reçu l'email ?
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.reload()}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Renvoyer l'email de vérification
            </button>
          </div>
        </div>

        <div className="text-sm text-center">
          <a
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
