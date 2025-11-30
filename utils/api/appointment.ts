import { AxiosResponse } from "axios";
import { apiWithToken, api } from "../axiosConfig";

export interface AvailableSlot {
  appointmentId: number | null;
  doctorId: number;
  doctorName: string;
  doctorTitle?: string;
  timeSlot: string;
  room?: string;
  building?: string;
  availableCount: number;
  currentPatients: number;
  maxPatients: number;
}

export interface Appointment {
  id: number;
  doctorId: number;
  doctorName?: string;
  doctorTitle?: string;
  specialtyId: number;
  date: string;
  timeSlot: string;
  room?: string;
  building?: string;
  maxPatients: number;
  currentPatients: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupedAppointment {
  date: string;
  doctorId: number;
  doctorName?: string;
  doctorTitle?: string;
  specialtyId: number;
  room?: string;
  building?: string;
  appointments: Appointment[];
  totalSlots: number;
  totalPatients: number;
  totalMaxPatients: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export const getAvailableSlots = (
  specialtyId: number,
  date: string,
  doctorId?: number,
  title?: string
): Promise<AvailableSlot[]> => {
  const params: any = { specialtyId, date };
  if (doctorId) params.doctorId = doctorId;
  if (title) params.title = title;

  return apiWithToken()
    .get("/appointments/available", { params })
    .then((res: AxiosResponse<{ success: boolean; data: AvailableSlot[] }>) => res.data.data);
};

export const getAllAppointments = (params?: {
  doctorId?: number;
  specialtyId?: number;
  date?: string;
  page?: number;
  size?: number;
}): Promise<Page<GroupedAppointment>> => {
  return apiWithToken()
    .get("/appointments", { params })
    .then((res: AxiosResponse<{ success: boolean; data: Page<GroupedAppointment> }>) => res.data.data);
};

export const createAppointment = (data: {
  doctorId: number;
  specialtyId: number;
  date: string;
  timeSlot: string;
  maxPatients?: number;
}): Promise<Appointment> => {
  return apiWithToken()
    .post("/appointments", data)
    .then((res: AxiosResponse<{ success: boolean; data: Appointment }>) => res.data.data);
};

export const updateAppointment = (
  id: number,
  data: { maxPatients: number }
): Promise<Appointment> => {
  return apiWithToken()
    .put(`/appointments/${id}`, data)
    .then((res: AxiosResponse<{ success: boolean; data: Appointment }>) => res.data.data);
};

export const deleteAppointment = (id: number): Promise<void> => {
  return apiWithToken()
    .delete(`/appointments/${id}`)
    .then(() => {});
};
