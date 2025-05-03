import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    console.log('Login attempt with:', { email });

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard'
      });

      console.log('SignIn result:', result);

      if (result?.error) {
        console.error('Login error:', result.error);
        setError('Invalid email or password');
      } else if (result?.ok) {
        console.log('Login successful, navigating to dashboard...');
        await router.replace('/dashboard');
      } else {
        console.error('Unexpected result:', result);
        setError('An unexpected error occurred');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="flex w-full">
        <div className="w-full lg:w-5/12 xl:w-4/12 flex items-center justify-center p-10">
          <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">Admin Log in</h2>
            
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-center text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@cotur.com"
                  className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded transition-colors"
                disabled={isLoading}
              >
                Log in
              </button>
            </form>
          </div>
        </div>
        
        <div className="hidden lg:block lg:w-7/12 xl:w-8/12" style={{ background: '#1e2124' }}>
          <div className="h-full flex items-center justify-center">
            <div className="relative w-full h-full">
              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/4">
                <div className="w-40 h-40 bg-orange-500 rounded-full relative">
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-32 bg-orange-100 rounded-b-full"></div>
                  <div className="absolute inset-4 bg-orange-300 rounded-full"></div>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/4">
                <div className="w-24 h-24 bg-orange-400 rounded-full relative">
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-20 bg-orange-100 rounded-b-full"></div>
                  <div className="absolute inset-3 bg-orange-200 rounded-full"></div>
                </div>
              </div>
              
              <div className="absolute bottom-1/4 right-1/3">
                <div className="w-32 h-32 bg-orange-600 rounded-full relative">
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-28 bg-orange-100 rounded-b-full"></div>
                  <div className="absolute inset-4 bg-orange-400 rounded-full"></div>
                </div>
              </div>
              <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-green-100 rounded-full opacity-50"></div>
              <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-green-200 rounded-full opacity-40"></div>
              <div className="absolute top-1/2 right-1/2 w-8 h-8 bg-yellow-100 rounded-full opacity-60"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-white text-4xl font-bold opacity-20">Mycotur</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;