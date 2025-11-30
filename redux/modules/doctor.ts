import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { call, fork, put, take } from "redux-saga/effects";
import { getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor, Doctor } from "@/utils/api/doctor";
import { message } from "antd";

export type DoctorState = {
  readonly doctors: Doctor[];
  readonly currentDoctor: Doctor | null;
  readonly isPending: boolean;
};

const initialState: DoctorState = {
  doctors: [],
  currentDoctor: null,
  isPending: false,
};

const SLICE_NAME = "doctor";

const doctorSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    fetchDoctorsSuccess: (state, action: PayloadAction<Doctor[]>) => ({
      ...state,
      doctors: action.payload,
      isPending: false,
    }),
    fetchDoctorsFailure: (state) => ({
      ...state,
      isPending: false,
    }),
    fetchDoctorByIdSuccess: (state, action: PayloadAction<Doctor>) => ({
      ...state,
      currentDoctor: action.payload,
      isPending: false,
    }),
    createDoctorSuccess: (state, action: PayloadAction<Doctor>) => ({
      ...state,
      doctors: [...state.doctors, action.payload],
      isPending: false,
    }),
    updateDoctorSuccess: (state, action: PayloadAction<Doctor>) => ({
      ...state,
      doctors: state.doctors.map((d) => (d.id === action.payload.id ? action.payload : d)),
      isPending: false,
    }),
    deleteDoctorSuccess: (state, action: PayloadAction<number>) => ({
      ...state,
      doctors: state.doctors.filter((d) => d.id !== action.payload),
      isPending: false,
    }),
    updatePending: (state) => ({
      ...state,
      isPending: true,
    }),
  },
});

export const {
  fetchDoctorsSuccess,
  fetchDoctorsFailure,
  fetchDoctorByIdSuccess,
  createDoctorSuccess,
  updateDoctorSuccess,
  deleteDoctorSuccess,
  updatePending,
} = doctorSlice.actions;

export default doctorSlice.reducer;

export const fetchDoctorsAction = createAction<{ specialtyId?: number; search?: string }>(
  `${SLICE_NAME}/fetchDoctorsRequest`
);

export const fetchDoctorByIdAction = createAction<{ id: number }>(
  `${SLICE_NAME}/fetchDoctorByIdRequest`
);

export const createDoctorAction = createAction<{
  data: {
    fullName: string;
    title?: string;
    specialtyId: number;
    roomId: number;
  };
}>(`${SLICE_NAME}/createDoctorRequest`);

export const updateDoctorAction = createAction<{
  id: number;
  data: {
    fullName?: string;
    title?: string;
    specialtyId?: number;
    roomId?: number;
  };
}>(`${SLICE_NAME}/updateDoctorRequest`);

export const deleteDoctorAction = createAction<{ id: number }>(
  `${SLICE_NAME}/deleteDoctorRequest`
);

function* handleFetchDoctors(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { specialtyId, search },
    }: ReturnType<typeof fetchDoctorsAction> = yield take(fetchDoctorsAction);
    try {
      yield put(updatePending());
      const doctors = yield call(getAllDoctors, specialtyId, search);
      yield put(fetchDoctorsSuccess(doctors));
    } catch (e: any) {
      yield put(fetchDoctorsFailure());
      throw e;
    }
  }
}

function* handleFetchDoctorById(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id },
    }: ReturnType<typeof fetchDoctorByIdAction> = yield take(fetchDoctorByIdAction);
    try {
      yield put(updatePending());
      const doctor = yield call(getDoctorById, id);
      yield put(fetchDoctorByIdSuccess(doctor));
    } catch (e: any) {
      throw e;
    }
  }
}

function* handleCreateDoctor(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { data },
    }: ReturnType<typeof createDoctorAction> = yield take(createDoctorAction);
    try {
      yield put(updatePending());
      const doctor = yield call(createDoctor, data);
      yield put(createDoctorSuccess(doctor));
      message.success("Tạo bác sĩ thành công");
    } catch (e: any) {
      message.error(e?.response?.data?.error || e?.message || "Tạo bác sĩ thất bại");
    }
  }
}

function* handleUpdateDoctor(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id, data },
    }: ReturnType<typeof updateDoctorAction> = yield take(updateDoctorAction);
    try {
      yield put(updatePending());
      const doctor = yield call(updateDoctor, id, data);
      yield put(updateDoctorSuccess(doctor));
      message.success("Cập nhật bác sĩ thành công");
    } catch (e: any) {
      message.error(e?.response?.data?.error || e?.message || "Cập nhật bác sĩ thất bại");
    }
  }
}

function* handleDeleteDoctor(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id },
    }: ReturnType<typeof deleteDoctorAction> = yield take(deleteDoctorAction);
    try {
      yield put(updatePending());
      yield call(deleteDoctor, id);
      yield put(deleteDoctorSuccess(id));
      message.success("Xóa bác sĩ thành công");
    } catch (e: any) {
      yield put(updatePending());
      message.error(e?.response?.data?.error || e?.message || "Xóa bác sĩ thất bại");
    }
  }
}

export const doctorSagas = [
  fork(handleFetchDoctors),
  fork(handleFetchDoctorById),
  fork(handleCreateDoctor),
  fork(handleUpdateDoctor),
  fork(handleDeleteDoctor),
];

