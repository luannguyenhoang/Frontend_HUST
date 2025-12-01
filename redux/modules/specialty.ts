import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { call, fork, put, take } from "redux-saga/effects";
import { getAllSpecialties, getSpecialtyById, createSpecialty, updateSpecialty, Specialty } from "@/utils/api/specialty";
import { message } from "antd";

export type SpecialtyState = {
  readonly specialties: Specialty[];
  readonly currentSpecialty: Specialty | null;
  readonly isPending: boolean;
  readonly pagination: { total: number; page: number; pageSize: number; totalPages: number } | null;
};

const initialState: SpecialtyState = {
  specialties: [],
  currentSpecialty: null,
  isPending: false,
  pagination: null,
};

const SLICE_NAME = "specialty";

const specialtySlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    fetchSpecialtiesSuccess: (state, action: PayloadAction<{ specialties: Specialty[]; pagination?: any }>) => ({
      ...state,
      specialties: action.payload.specialties,
      pagination: action.payload.pagination || null,
      isPending: false,
    }),
    fetchSpecialtiesFailure: (state) => ({
      ...state,
      isPending: false,
    }),
    fetchSpecialtyByIdSuccess: (state, action: PayloadAction<Specialty>) => ({
      ...state,
      currentSpecialty: action.payload,
      isPending: false,
    }),
    createSpecialtySuccess: (state, action: PayloadAction<Specialty>) => ({
      ...state,
      specialties: [...state.specialties, action.payload],
      isPending: false,
    }),
    updateSpecialtySuccess: (state, action: PayloadAction<Specialty>) => ({
      ...state,
      specialties: state.specialties.map((s) =>
        s.id === action.payload.id ? action.payload : s
      ),
      isPending: false,
    }),
    updatePending: (state) => ({
      ...state,
      isPending: true,
    }),
  },
});

export const {
  fetchSpecialtiesSuccess,
  fetchSpecialtiesFailure,
  fetchSpecialtyByIdSuccess,
  createSpecialtySuccess,
  updateSpecialtySuccess,
  updatePending,
} = specialtySlice.actions;

export default specialtySlice.reducer;

export const fetchSpecialtiesAction = createAction<{ search?: string; page?: number; pageSize?: number }>(
  `${SLICE_NAME}/fetchSpecialtiesRequest`
);

export const fetchSpecialtyByIdAction = createAction<{ id: number }>(
  `${SLICE_NAME}/fetchSpecialtyByIdRequest`
);

export const createSpecialtyAction = createAction<{
  data: {
    name: string;
    description?: string;
    symptoms?: string;
    buildingId?: number;
  };
}>(`${SLICE_NAME}/createSpecialtyRequest`);

export const updateSpecialtyAction = createAction<{
  id: number;
  data: {
    name: string;
    description?: string;
    symptoms?: string;
    buildingId?: number;
  };
}>(`${SLICE_NAME}/updateSpecialtyRequest`);

function* handleFetchSpecialties(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { search, page, pageSize },
    }: ReturnType<typeof fetchSpecialtiesAction> = yield take(fetchSpecialtiesAction);
    try {
      yield put(updatePending());
      const result = yield call(getAllSpecialties, search, page, pageSize);
      if (Array.isArray(result)) {
        yield put(fetchSpecialtiesSuccess({ specialties: result, pagination: null }));
      } else {
        yield put(fetchSpecialtiesSuccess({ specialties: result.data, pagination: result.pagination }));
      }
    } catch (e: any) {
      yield put(fetchSpecialtiesFailure());
      throw e;
    }
  }
}

function* handleFetchSpecialtyById(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id },
    }: ReturnType<typeof fetchSpecialtyByIdAction> = yield take(fetchSpecialtyByIdAction);
    try {
      yield put(updatePending());
      const specialty = yield call(getSpecialtyById, id);
      yield put(fetchSpecialtyByIdSuccess(specialty));
    } catch (e: any) {
      throw e;
    }
  }
}

function* handleCreateSpecialty(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { data },
    }: ReturnType<typeof createSpecialtyAction> = yield take(createSpecialtyAction);
    try {
      yield put(updatePending());
      const specialty = yield call(createSpecialty, data);
      yield put(createSpecialtySuccess(specialty));
      message.success("Tạo chuyên khoa thành công");
    } catch (e: any) {
      yield put(updatePending());
      message.error(e?.response?.data?.error || e?.message || "Tạo chuyên khoa thất bại");
    }
  }
}

function* handleUpdateSpecialty(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id, data },
    }: ReturnType<typeof updateSpecialtyAction> = yield take(updateSpecialtyAction);
    try {
      yield put(updatePending());
      const specialty = yield call(updateSpecialty, id, data);
      yield put(updateSpecialtySuccess(specialty));
      message.success("Cập nhật chuyên khoa thành công");
    } catch (e: any) {
      yield put(updatePending());
      message.error(e?.response?.data?.error || e?.message || "Cập nhật chuyên khoa thất bại");
    }
  }
}

export const specialtySagas = [
  fork(handleFetchSpecialties),
  fork(handleFetchSpecialtyById),
  fork(handleCreateSpecialty),
  fork(handleUpdateSpecialty),
];

