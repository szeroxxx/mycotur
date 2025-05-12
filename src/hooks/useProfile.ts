import { useState } from 'react';
import { Agent } from '../types/agent';

interface Toast {
  type: 'success' | 'error';
  message: string;
}

interface UseProfileReturn {
  updateProfile: (data: Partial<Agent>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  validateSocialUrl: (url: string) => boolean;
  toast: Toast | null;
}

export const useProfile = (): UseProfileReturn => {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const validateSocialUrl = (url: string): boolean => {
    if (!url) return true; // Allow empty URLs
    try {
      const parsedUrl = new URL(url);
      return ['facebook.com', 'instagram.com', 'youtube.com'].some(domain => 
        parsedUrl.hostname.includes(domain)
      );
    } catch {
      return false;
    }
  };

  const updateProfile = async (data: Partial<Agent>) => {
    try {
      // Validate social media URLs
      const socialUrls = [
        data.social?.facebook,
        data.social?.instagram,
        data.social?.youtube
      ].filter(Boolean);

      const invalidUrls = socialUrls.filter(url => !validateSocialUrl(url as string));
      if (invalidUrls.length > 0) {
        throw new Error('Invalid social media URL format');
      }

      // TODO: Implement API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      showToast('success', 'Profile updated successfully');    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      showToast('error', message);
      throw err;
    }
  };
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // TODO: Implement API call to change password
      await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      showToast('success', 'Password changed successfully');    } catch (err) {
      showToast('error', 'Failed to change password');
      throw err;
    }
  };
  const requestPasswordReset = async (email: string) => {
    try {
      // Send password reset request to the API
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      showToast('success', 'Password reset link sent to your email');    } catch (err) {
      showToast('error', 'Failed to send password reset link');
      throw err;
    }
  };

  return {
    updateProfile,
    changePassword,
    requestPasswordReset,
    validateSocialUrl,
    toast
  };
};