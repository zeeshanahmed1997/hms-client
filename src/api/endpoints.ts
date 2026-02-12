// src/api/endpoints.ts  (or wherever it lives)
const BASE_URL =  'https://localhost:7186';

export const API_ENDPOINTS = {
  auth: {
    login:    `${BASE_URL}/api/Auth/login`,
    register: `${BASE_URL}/api/Auth/register`,
    me:       `${BASE_URL}/api/Auth/me`,
    refresh:  `${BASE_URL}/api/Auth/refresh`,
  },
  users:{
    users : `${BASE_URL}/api/User/users`,
    create : `${BASE_URL}/api/User/user`,
    update : `${BASE_URL}/api/User/edit`,
    delete : `${BASE_URL}/api/User/delete`,
  }
} as const;