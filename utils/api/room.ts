import { AxiosResponse } from "axios";
import { api, apiWithToken } from "../axiosConfig";

export interface Room {
  id: number;
  roomNumber: string;
  buildingId: number;
  building: string;
  specialtyId?: number;
  specialty?: string;
  floor?: number;
  capacity?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllRooms = (params?: {
  building?: string;
  search?: string;
}): Promise<Room[]> => {
  return api
    .get("/rooms", { params })
    .then((res: AxiosResponse<{ success: boolean; data: Room[] }>) => res.data.data);
};

export const getRoomById = (id: number): Promise<Room> => {
  return api
    .get(`/rooms/${id}`)
    .then((res: AxiosResponse<{ success: boolean; data: Room }>) => res.data.data);
};

export const createRoom = (data: {
  roomNumber: string;
  buildingId: number;
  specialtyId?: number;
  floor?: number;
  capacity?: number;
  description?: string;
}): Promise<Room> => {
  return apiWithToken()
    .post("/rooms", data)
    .then((res: AxiosResponse<{ success: boolean; data: Room }>) => res.data.data);
};

export const updateRoom = (
  id: number,
  data: {
    roomNumber?: string;
    buildingId?: number;
    specialtyId?: number;
    floor?: number;
    capacity?: number;
    description?: string;
  }
): Promise<Room> => {
  return apiWithToken()
    .put(`/rooms/${id}`, data)
    .then((res: AxiosResponse<{ success: boolean; data: Room }>) => res.data.data);
};

export const deleteRoom = (id: number): Promise<void> => {
  return apiWithToken()
    .delete(`/rooms/${id}`)
    .then(() => {});
};

