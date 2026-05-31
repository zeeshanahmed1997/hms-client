import { all } from "axios";

// src/api/endpoints.ts  (or wherever it lives)
const BASE_URL =  'https://localhost:7186';

export const API_ENDPOINTS = {
  auth: {
    login:    `${BASE_URL}/api/Auth/login`,
    register: `${BASE_URL}/api/Auth/register`,
    me:       `${BASE_URL}/api/Auth/me`,
    refresh:  `${BASE_URL}/api/Auth/refresh`,
  },
  appointments:{
    list : `${BASE_URL}/api/Appointments/appointments`,
    all : `${BASE_URL}/api/Appointments/all-appointments`,
    create : `${BASE_URL}/api/Appointments/create`,
    update : `${BASE_URL}/api/Appointments/update`,
    delete : `${BASE_URL}/api/Appointments/cancel`,
    generateToken: '/api/appointments/generate-token',
  updateQueueStatus: '/api/appointments/queue-status',
  todayQueue: '/api/appointments/today-queue',
  },
  dashboard: {
    adminStats: `${BASE_URL}/api/Dashboard/admin-stats`,
    appointmentsByDepartment: `${BASE_URL}/api/Dashboard/appointments-by-department`,
    topDoctors: `${BASE_URL}/api/Dashboard/top-doctors`,
  },
  users:{
    users : `${BASE_URL}/api/User/users`,
    create : `${BASE_URL}/api/User/user`,
    update : `${BASE_URL}/api/User/edit`,
    patients: `${BASE_URL}/api/User/patients`,
    delete : `${BASE_URL}/api/User/delete`,
    doctors : `${BASE_URL}/api/User/doctors`,
    patientsByDoctor : (doctorId: number) => `${BASE_URL}/api/User/patients-by-doctor?doctorId=${doctorId}`,
  },
  reports: {
  admin:  `${BASE_URL}/api/reports/admin`,
  doctor: `${BASE_URL}/api/reports/doctor`,
},
 // endpoints.ts
chat: {
    hub: `${BASE_URL}/hubs/chat`,
    // REMOVED "userId=" to match https://localhost:7186/api/Chat/history/1
    history: (userId: number) => `${BASE_URL}/api/Chat/history/${userId}`,
},
  departments: {
    list : `${BASE_URL}/api/Departments`,
  },
prescriptions: {
    list: `${BASE_URL}/api/Prescriptions`,
    all: `${BASE_URL}/api/Prescriptions/all`,
    create: `${BASE_URL}/api/Prescriptions/create`,
    // Ensure this exactly matches the [HttpGet("{id}")]
    detail: (id: number) => `${BASE_URL}/api/Prescriptions/${id}`, 
  },
medicines: {
  list: `${BASE_URL}/api/Medicines`,
  lowStock: `${BASE_URL}/api/Medicines/low-stock`,
  create: `${BASE_URL}/api/Medicines`,
  update: `${BASE_URL}/api/Medicines`,
  delete: `${BASE_URL}/api/Medicines`, // DELETE with ID in URL
  stock: `${BASE_URL}/api/Medicines/stock`,                 // PATCH for stock update
},
} as const;





// # API Configuration
// NEXT_PUBLIC_API_URL=https://localhost:7186

// # Authentication (If using NextAuth.js or similar)
// NEXTAUTH_URL=http://localhost:3000
// NEXTAUTH_SECRET=YourSuperSecretKeyWithAtLeast32Characters

// # Optional: Environment Name
// NODE_ENV=development
// JWT_SECRET=YourSuperSecretKeyWithAtLeast32Characters!!