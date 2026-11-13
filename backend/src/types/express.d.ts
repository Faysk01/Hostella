import 'express';

declare global {
  namespace Express {
    interface Request {
      admin?: { id: string; role: 'SUPER_ADMIN' | 'ADMIN'; mustChangePassword: boolean; label: string };
    }
  }
}

export {};
