import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { call, fork, put, take } from "redux-saga/effects";
import {
  getAllBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  Building,
} from "@/utils/api/building";
import { message } from "antd";

export type BuildingState = {
  readonly buildings: Building[];
  readonly currentBuilding: Building | null;
  readonly isPending: boolean;
};

const initialState: BuildingState = {
  buildings: [],
  currentBuilding: null,
  isPending: false,
};

const SLICE_NAME = "building";

const buildingSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    fetchBuildingsSuccess: (state, action: PayloadAction<Building[]>) => ({
      ...state,
      buildings: action.payload,
      isPending: false,
    }),
    fetchBuildingsFailure: (state) => ({
      ...state,
      isPending: false,
    }),
    fetchBuildingByIdSuccess: (state, action: PayloadAction<Building>) => ({
      ...state,
      currentBuilding: action.payload,
      isPending: false,
    }),
    createBuildingSuccess: (state, action: PayloadAction<Building>) => ({
      ...state,
      buildings: [...state.buildings, action.payload],
      isPending: false,
    }),
    updateBuildingSuccess: (state, action: PayloadAction<Building>) => ({
      ...state,
      buildings: state.buildings.map((b) =>
        b.id === action.payload.id ? action.payload : b
      ),
      isPending: false,
    }),
    deleteBuildingSuccess: (state, action: PayloadAction<number>) => ({
      ...state,
      buildings: state.buildings.filter((b) => b.id !== action.payload),
      isPending: false,
    }),
    updatePending: (state) => ({
      ...state,
      isPending: true,
    }),
  },
});

export const {
  fetchBuildingsSuccess,
  fetchBuildingsFailure,
  fetchBuildingByIdSuccess,
  createBuildingSuccess,
  updateBuildingSuccess,
  deleteBuildingSuccess,
  updatePending,
} = buildingSlice.actions;

export default buildingSlice.reducer;

export const fetchBuildingsAction = createAction(`${SLICE_NAME}/fetchBuildingsRequest`);

export const fetchBuildingByIdAction = createAction<{ id: number }>(
  `${SLICE_NAME}/fetchBuildingByIdRequest`
);

export const createBuildingAction = createAction<{
  data: {
    name: string;
    address?: string;
    description?: string;
    floors?: number;
  };
}>(`${SLICE_NAME}/createBuildingRequest`);

export const updateBuildingAction = createAction<{
  id: number;
  data: {
    name?: string;
    address?: string;
    description?: string;
    floors?: number;
  };
}>(`${SLICE_NAME}/updateBuildingRequest`);

export const deleteBuildingAction = createAction<{ id: number }>(
  `${SLICE_NAME}/deleteBuildingRequest`
);

function* handleFetchBuildings(): Generator<any, void, any> {
  while (true) {
    yield take(fetchBuildingsAction);
    try {
      yield put(updatePending());
      const buildings = yield call(getAllBuildings);
      yield put(fetchBuildingsSuccess(buildings));
    } catch (e: any) {
      yield put(fetchBuildingsFailure());
      message.error("Không thể lấy danh sách tòa nhà. Vui lòng thử lại.");
    }
  }
}

function* handleFetchBuildingById(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id },
    }: ReturnType<typeof fetchBuildingByIdAction> = yield take(fetchBuildingByIdAction);
    try {
      yield put(updatePending());
      const building = yield call(getBuildingById, id);
      yield put(fetchBuildingByIdSuccess(building));
    } catch (e: any) {
      yield put(updatePending());
      message.error("Không thể lấy thông tin tòa nhà. Vui lòng thử lại.");
    }
  }
}

function* handleCreateBuilding(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { data },
    }: ReturnType<typeof createBuildingAction> = yield take(createBuildingAction);
    try {
      yield put(updatePending());
      const building = yield call(createBuilding, data);
      yield put(createBuildingSuccess(building));
      message.success("Tạo tòa nhà thành công");
    } catch (e: any) {
      yield put(updatePending());
      message.error(
        e?.response?.data?.error || e?.message || "Tạo tòa nhà thất bại"
      );
    }
  }
}

function* handleUpdateBuilding(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id, data },
    }: ReturnType<typeof updateBuildingAction> = yield take(updateBuildingAction);
    try {
      yield put(updatePending());
      const building = yield call(updateBuilding, id, data);
      yield put(updateBuildingSuccess(building));
      message.success("Cập nhật tòa nhà thành công");
    } catch (e: any) {
      yield put(updatePending());
      message.error(
        e?.response?.data?.error || e?.message || "Cập nhật tòa nhà thất bại"
      );
    }
  }
}

function* handleDeleteBuilding(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id },
    }: ReturnType<typeof deleteBuildingAction> = yield take(deleteBuildingAction);
    try {
      yield put(updatePending());
      yield call(deleteBuilding, id);
      yield put(deleteBuildingSuccess(id));
      message.success("Xóa tòa nhà thành công");
    } catch (e: any) {
      yield put(updatePending());
      message.error(
        e?.response?.data?.error || e?.message || "Xóa tòa nhà thất bại"
      );
    }
  }
}

export const buildingSagas = [
  fork(handleFetchBuildings),
  fork(handleFetchBuildingById),
  fork(handleCreateBuilding),
  fork(handleUpdateBuilding),
  fork(handleDeleteBuilding),
];

