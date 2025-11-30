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

export const getAllSpecialties = (search?: string): Promise<Specialty[]> => {
  const params = search ? { search } : {};
  return api
    .get("/specialties", { params })
    .then((res: AxiosResponse<{ success: boolean; data: Specialty[] }>) => res.data.data);
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

