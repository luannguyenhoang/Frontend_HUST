import { AxiosResponse } from "axios";
import { api, apiWithToken } from "../axiosConfig";

export interface Doctor {
  id: number;
  fullName: string;
  title?: string;
  specialtyId: number;
  roomId?: number;
  room?: string;
  building?: string;
  createdAt: string;
  updatedAt: string;
}

import { PaginationResponse } from "./specialty";

export const getAllDoctors = (
  specialtyId?: number,
  search?: string,
  page?: number,
  pageSize?: number
): Promise<Doctor[] | PaginationResponse<Doctor>> => {
  const params: any = {};
  if (specialtyId) params.specialtyId = specialtyId;
  if (search) params.search = search;
  if (page !== undefined) params.page = page;
  if (pageSize !== undefined) params.pageSize = pageSize;
  
  return api
    .get("/doctors", { params })
    .then((res: AxiosResponse<{ success: boolean; data: Doctor[]; pagination?: any }>) => {
      if (res.data.pagination) {
        return {
          data: res.data.data,
          pagination: res.data.pagination
        } as PaginationResponse<Doctor>;
      }
      return res.data.data;
    });
};

export const getDoctorById = (id: number): Promise<Doctor> => {
  return api
    .get(`/doctors/${id}`)
    .then((res: AxiosResponse<{ success: boolean; data: Doctor }>) => res.data.data);
};

export const createDoctor = (data: {
  fullName: string;
  title?: string;
  specialtyId: number;
  roomId: number;
}): Promise<Doctor> => {
  return apiWithToken()
    .post("/doctors", data)
    .then((res: AxiosResponse<{ success: boolean; data: Doctor }>) => res.data.data);
};

export const updateDoctor = (
  id: number,
  data: {
    fullName?: string;
    title?: string;
    specialtyId?: number;
    roomId?: number;
  }
): Promise<Doctor> => {
  return apiWithToken()
    .put(`/doctors/${id}`, data)
    .then((res: AxiosResponse<{ success: boolean; data: Doctor }>) => res.data.data);
};

export const deleteDoctor = (id: number): Promise<void> => {
  return apiWithToken()
    .delete(`/doctors/${id}`)
    .then(() => undefined);
};

