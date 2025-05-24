import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {  interface User extends DefaultUser {
    role?: string;
    accessToken?: string;
    uuid?: string;
    status?: string;
    categories?: string[];
  }

  interface Session extends DefaultSession {
    user?: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    accessToken?: string;
    uuid?: string;
    status?: string;
  }
}