import { AxiosResponse } from "axios";
import { api, apiWithToken } from "../axiosConfig";

export interface Building {
  id: number;
  name: string;
  address?: string;
  description?: string;
  floors?: number;
  createdAt: string;
  updatedAt: string;
}

export const getAllBuildings = (): Promise<Building[]> => {
  return api
    .get("/buildings")
    .then((res: AxiosResponse<{ success: boolean; data: Building[] }>) => res.data.data);
};

export const getBuildingById = (id: number): Promise<Building> => {
  return api
    .get(`/buildings/${id}`)
    .then((res: AxiosResponse<{ success: boolean; data: Building }>) => res.data.data);
};

export const createBuilding = (data: {
  name: string;
  address?: string;
  description?: string;
  floors?: number;
}): Promise<Building> => {
  return apiWithToken()
    .post("/buildings", data)
    .then((res: AxiosResponse<{ success: boolean; data: Building }>) => res.data.data);
};

export const updateBuilding = (
  id: number,
  data: {
    name?: string;
    address?: string;
    description?: string;
    floors?: number;
  }
): Promise<Building> => {
  return apiWithToken()
    .put(`/buildings/${id}`, data)
    .then((res: AxiosResponse<{ success: boolean; data: Building }>) => res.data.data);
};

export const deleteBuilding = (id: number): Promise<void> => {
  return apiWithToken()
    .delete(`/buildings/${id}`)
    .then(() => {});
};

