// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\profile\hooks\useProfile.js
import { useState, useEffect, useCallback } from 'react';
import { getProfile, updateProfile } from '../../../shared/api/userClient.js';
import { useAuthStore } from '../../../shared/store/authStore.js';

const normalizeApiProfile = (data) => {
  if (!data) {
    return data;
  }

  const profile = { ...data };

  Object.keys(profile).forEach((key) => {
    if (Array.isArray(profile[key])) {
      profile[key] = profile[key].join(', ');
    }
  });

  return profile;
};

const serializeProfilePayload = (original, values) => {
  const payload = { ...values };

  if (original) {
    Object.keys(original).forEach((key) => {
      if (Array.isArray(original[key]) && typeof values[key] === 'string') {
        payload[key] = values[key]
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    });
  }

  return payload;
};

export function useProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProfile();
      setOriginalProfile(response);
      setProfile(normalizeApiProfile(response));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = useCallback(
    async (values) => {
      setLoading(true);
      setError(null);

      try {
        const payload = serializeProfilePayload(originalProfile, values);
        payload._id = originalProfile?._id;
        payload.id = originalProfile?.id;
        const response = await updateProfile(payload);
        setOriginalProfile(response);
        const updatedProfile = normalizeApiProfile(response);
        setProfile(updatedProfile);
        updateUser(response);
        return updatedProfile;
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error al actualizar el perfil');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [originalProfile, updateUser]
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    loading,
    error,
    profile,
    fetchProfile,
    saveProfile,
    logout
  };
}
