import { AxiosResponse } from "axios";
import { api, apiWithToken } from "../axiosConfig";

export interface Specialty {
  id: number;
  name: string;
  description?: string;
  symptoms: string[];
  buildingId?: number;
  building?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const getAllSpecialties = (
  search?: string,
  page?: number,
  pageSize?: number
): Promise<Specialty[] | PaginationResponse<Specialty>> => {
  const params: any = {};
  if (search) params.search = search;
  if (page !== undefined) params.page = page;
  if (pageSize !== undefined) params.pageSize = pageSize;
  
  return api
    .get("/specialties", { params })
    .then((res: AxiosResponse<{ success: boolean; data: Specialty[]; pagination?: any }>) => {
      if (res.data.pagination) {
        return {
          data: res.data.data,
          pagination: res.data.pagination
        } as PaginationResponse<Specialty>;
      }
      return res.data.data;
    });
};

export const getSpecialtyById = (id: number): Promise<Specialty> => {
  return api
    .get(`/specialties/${id}`)
    .then((res: AxiosResponse<{ success: boolean; data: Specialty }>) => res.data.data);
};

export const createSpecialty = (data: {
  name: string;
  description?: string;
  symptoms?: string;
  buildingId?: number;
}): Promise<Specialty> => {
  return apiWithToken()
    .post("/specialties", data)
    .then((res: AxiosResponse<{ success: boolean; data: Specialty }>) => res.data.data);
};

export const updateSpecialty = (
  id: number,
  data: {
    name: string;
    description?: string;
    symptoms?: string;
    buildingId?: number;
  }
): Promise<Specialty> => {
  return apiWithToken()
    .put(`/specialties/${id}`, data)
    .then((res: AxiosResponse<{ success: boolean; data: Specialty }>) => res.data.data);
};

