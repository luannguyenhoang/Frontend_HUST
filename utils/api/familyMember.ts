import { AxiosResponse } from "axios";
import { apiWithToken } from "../axiosConfig";

export interface FamilyMember {
  id: number;
  userId: number;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  relationship?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllFamilyMembers = (): Promise<FamilyMember[]> => {
  return apiWithToken()
    .get("/family-members")
    .then((res: AxiosResponse<{ success: boolean; data: FamilyMember[] }>) => res.data.data);
};

export const getFamilyMemberById = (id: number): Promise<FamilyMember> => {
  return apiWithToken()
    .get(`/family-members/${id}`)
    .then((res: AxiosResponse<{ success: boolean; data: FamilyMember }>) => res.data.data);
};

export const createFamilyMember = (data: {
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  relationship?: string;
  phone?: string;
  address?: string;
}): Promise<FamilyMember> => {
  return apiWithToken()
    .post("/family-members", data)
    .then((res: AxiosResponse<{ success: boolean; data: FamilyMember }>) => res.data.data);
};

export const updateFamilyMember = (id: number, data: Partial<FamilyMember>): Promise<FamilyMember> => {
  return apiWithToken()
    .put(`/family-members/${id}`, data)
    .then((res: AxiosResponse<{ success: boolean; data: FamilyMember }>) => res.data.data);
};

export const deleteFamilyMember = (id: number): Promise<void> => {
  return apiWithToken()
    .delete(`/family-members/${id}`)
    .then(() => {});
};

