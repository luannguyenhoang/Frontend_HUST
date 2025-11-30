import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { call, fork, put, take } from "redux-saga/effects";
import {
  getAllFamilyMembers,
  getFamilyMemberById,
  createFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  FamilyMember,
} from "@/utils/api/familyMember";

export type FamilyMemberState = {
  readonly familyMembers: FamilyMember[];
  readonly currentFamilyMember: FamilyMember | null;
  readonly isPending: boolean;
};

const initialState: FamilyMemberState = {
  familyMembers: [],
  currentFamilyMember: null,
  isPending: false,
};

const SLICE_NAME = "familyMember";

const familyMemberSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    fetchFamilyMembersSuccess: (state, action: PayloadAction<FamilyMember[]>) => ({
      ...state,
      familyMembers: action.payload,
      isPending: false,
    }),
    fetchFamilyMemberByIdSuccess: (state, action: PayloadAction<FamilyMember>) => ({
      ...state,
      currentFamilyMember: action.payload,
      isPending: false,
    }),
    createFamilyMemberSuccess: (state, action: PayloadAction<FamilyMember>) => ({
      ...state,
      familyMembers: [...state.familyMembers, action.payload],
      isPending: false,
    }),
    updateFamilyMemberSuccess: (state, action: PayloadAction<FamilyMember>) => ({
      ...state,
      familyMembers: state.familyMembers.map((fm) =>
        fm.id === action.payload.id ? action.payload : fm
      ),
      currentFamilyMember:
        state.currentFamilyMember?.id === action.payload.id
          ? action.payload
          : state.currentFamilyMember,
      isPending: false,
    }),
    deleteFamilyMemberSuccess: (state, action: PayloadAction<number>) => ({
      ...state,
      familyMembers: state.familyMembers.filter((fm) => fm.id !== action.payload),
      isPending: false,
    }),
    updatePending: (state) => ({
      ...state,
      isPending: true,
    }),
  },
});

export const {
  fetchFamilyMembersSuccess,
  fetchFamilyMemberByIdSuccess,
  createFamilyMemberSuccess,
  updateFamilyMemberSuccess,
  deleteFamilyMemberSuccess,
  updatePending,
} = familyMemberSlice.actions;

export default familyMemberSlice.reducer;

export const fetchFamilyMembersAction = createAction(
  `${SLICE_NAME}/fetchFamilyMembersRequest`
);

export const fetchFamilyMemberByIdAction = createAction<{ id: number }>(
  `${SLICE_NAME}/fetchFamilyMemberByIdRequest`
);

export const createFamilyMemberAction = createAction<{
  data: {
    fullName: string;
    dateOfBirth?: string;
    gender?: string;
    relationship?: string;
    phone?: string;
    address?: string;
  };
}>(`${SLICE_NAME}/createFamilyMemberRequest`);

export const updateFamilyMemberAction = createAction<{
  id: number;
  data: Partial<FamilyMember>;
}>(`${SLICE_NAME}/updateFamilyMemberRequest`);

export const deleteFamilyMemberAction = createAction<{ id: number }>(
  `${SLICE_NAME}/deleteFamilyMemberRequest`
);

function* handleFetchFamilyMembers(): Generator<any, void, any> {
  while (true) {
    yield take(fetchFamilyMembersAction);
    try {
      yield put(updatePending());
      const members = yield call(getAllFamilyMembers);
      yield put(fetchFamilyMembersSuccess(members));
    } catch (e: any) {
      throw e;
    }
  }
}

function* handleFetchFamilyMemberById(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id },
    }: ReturnType<typeof fetchFamilyMemberByIdAction> = yield take(fetchFamilyMemberByIdAction);
    try {
      yield put(updatePending());
      const member = yield call(getFamilyMemberById, id);
      yield put(fetchFamilyMemberByIdSuccess(member));
    } catch (e: any) {
      throw e;
    }
  }
}

function* handleCreateFamilyMember(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { data },
    }: ReturnType<typeof createFamilyMemberAction> = yield take(createFamilyMemberAction);
    try {
      yield put(updatePending());
      const member = yield call(createFamilyMember, data);
      yield put(createFamilyMemberSuccess(member));
    } catch (e: any) {
      throw e;
    }
  }
}

function* handleUpdateFamilyMember(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id, data },
    }: ReturnType<typeof updateFamilyMemberAction> = yield take(updateFamilyMemberAction);
    try {
      yield put(updatePending());
      const member = yield call(updateFamilyMember, id, data);
      yield put(updateFamilyMemberSuccess(member));
    } catch (e: any) {
      throw e;
    }
  }
}

function* handleDeleteFamilyMember(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id },
    }: ReturnType<typeof deleteFamilyMemberAction> = yield take(deleteFamilyMemberAction);
    try {
      yield put(updatePending());
      yield call(deleteFamilyMember, id);
      yield put(deleteFamilyMemberSuccess(id));
    } catch (e: any) {
      throw e;
    }
  }
}

export const familyMemberSagas = [
  fork(handleFetchFamilyMembers),
  fork(handleFetchFamilyMemberById),
  fork(handleCreateFamilyMember),
  fork(handleUpdateFamilyMember),
  fork(handleDeleteFamilyMember),
];

