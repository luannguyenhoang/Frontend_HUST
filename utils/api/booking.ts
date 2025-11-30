import { AxiosResponse } from "axios";
import { apiWithToken } from "../axiosConfig";

export interface Booking {
  id: number;
  userId: number;
  patientId: number;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  appointmentId: number;
  doctorId: number;
  doctorName?: string;
  doctorTitle?: string;
  specialtyId: number;
  specialtyName?: string;
  symptoms?: string;
  bookingCode: string;
  queueNumber: string;
  status: string;
  examinationDate: string;
  examinationTime: string;
  room?: string;
  building?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueueInfo {
  bookingCode: string;
  queueNumber: string;
  waitingCount: number;
  examinationDate: string;
  examinationTime: string;
  room?: string;
  building?: string;
}

export const getAllBookings = (): Promise<Booking[]> => {
  return apiWithToken()
    .get("/bookings")
    .then((res: AxiosResponse<{ success: boolean; data: Booking[] }>) => res.data.data);
};

export const getBookingById = (id: number): Promise<Booking> => {
  return apiWithToken()
    .get(`/bookings/${id}`)
    .then((res: AxiosResponse<{ success: boolean; data: Booking }>) => res.data.data);
};

export const createBooking = (data: {
  appointmentId?: number;
  doctorId?: number;
  specialtyId: number;
  date: string;
  timeSlot: string;
  patientId?: number;
  symptoms?: string;
}): Promise<Booking> => {
  return apiWithToken()
    .post("/bookings", data)
    .then((res: AxiosResponse<{ success: boolean; data: Booking }>) => res.data.data);
};

export const cancelBooking = (id: number): Promise<Booking> => {
  return apiWithToken()
    .post(`/bookings/${id}/cancel`)
    .then((res: AxiosResponse<{ success: boolean; data: Booking }>) => res.data.data);
};

export const getQueueInfo = (id: number): Promise<QueueInfo> => {
  return apiWithToken()
    .get(`/bookings/${id}/queue`)
    .then((res: AxiosResponse<{ success: boolean; data: QueueInfo }>) => res.data.data);
};

export const getAllBookingsAdmin = (): Promise<Booking[]> => {
  return apiWithToken()
    .get("/bookings/admin/all")
    .then((res: AxiosResponse<{ success: boolean; data: Booking[] }>) => res.data.data);
};

