import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, CheckCircle, XCircle } from 'lucide-react';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('worker');
  const [message, setMessage] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [passwordFocused, setPasswordFocused] = useState(false); // For showing password rules

  // Password validation rules
  const hasMinLength = password.length >= 8;
  const hasTwoNumbersOrSymbols = (password.match(/[0-9\W]/g) || []).length >= 2;

  const validatePassword = () => {
    return hasMinLength && hasTwoNumbersOrSymbols;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    if (!validatePassword()) {
      setMessage(
        'Password must be at least 8 characters long and contain at least 2 numbers or symbols.'
      );
      return;
    }

    try {
      const result = await signup(email, password, role); // Call the signup function from AuthContext
      if (result.success) {
        setMessage(result.message);
        setTimeout(() => navigate('/login'), 2000); // Redirect to login page after 2 seconds
      } else {
        setMessage(result.message); // Show error message
      }
    } catch (err) {
      console.error('Sign-up error:', err);
      setMessage('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <UserPlus className="mx-auto h-12 w-auto text-indigo-600" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              {/* Display password rules */}
              {passwordFocused && (
                <div className="mt-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 p-2 rounded-md">
                  <p>Password must:</p>
                  <ul className="list-disc list-inside">
                    <li className="flex items-center">
                      {hasMinLength ? (
                        <CheckCircle className="text-green-500 mr-2" />
                      ) : (
                        <XCircle className="text-red-500 mr-2" />
                      )}
                      Be at least 8 characters long
                    </li>
                    <li className="flex items-center">
                      {hasTwoNumbersOrSymbols ? (
                        <CheckCircle className="text-green-500 mr-2" />
                      ) : (
                        <XCircle className="text-red-500 mr-2" />
                      )}
                      Contain at least 2 numbers or symbols
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="worker">Worker</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {message && (
            <div
              className={`text-sm text-center ${
                message.includes('successful')
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}
            >
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          <span className="text-gray-600">Already have an account?</span>{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
