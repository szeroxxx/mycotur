import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useSessionStorage() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      localStorage.setItem('userData', JSON.stringify(session.user));
      localStorage.setItem('token', session.user.accessToken || '');
    }
  }, [session]);

  return session;
}
