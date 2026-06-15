// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\shared\api\userClient.js
import authClient from './authClient.js';
import { ENDPOINTS } from '../constants/endpoints.js';

export async function getProfile() {
  const response = await authClient.get(ENDPOINTS.PROFILE);
  return response.data?.user || response.data;
}

export async function updateProfile(data) {
  const id = data?._id || data?.id;

  if (!id) {
    throw new Error('No se puede actualizar el perfil sin id de usuario');
  }

  const response = await authClient.patch(`${ENDPOINTS.AUTH}/users/${id}`, data);
  return response.data?.user || response.data;
}
