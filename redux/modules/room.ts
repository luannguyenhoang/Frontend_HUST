import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { call, fork, put, take } from "redux-saga/effects";
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  Room,
} from "@/utils/api/room";
import { message } from "antd";

export type RoomState = {
  readonly rooms: Room[];
  readonly currentRoom: Room | null;
  readonly isPending: boolean;
};

const initialState: RoomState = {
  rooms: [],
  currentRoom: null,
  isPending: false,
};

const SLICE_NAME = "room";

const roomSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    fetchRoomsSuccess: (state, action: PayloadAction<Room[]>) => ({
      ...state,
      rooms: action.payload,
      isPending: false,
    }),
    fetchRoomsFailure: (state) => ({
      ...state,
      isPending: false,
    }),
    fetchRoomByIdSuccess: (state, action: PayloadAction<Room>) => ({
      ...state,
      currentRoom: action.payload,
      isPending: false,
    }),
    createRoomSuccess: (state, action: PayloadAction<Room>) => ({
      ...state,
      rooms: [...state.rooms, action.payload],
      isPending: false,
    }),
    updateRoomSuccess: (state, action: PayloadAction<Room>) => ({
      ...state,
      rooms: state.rooms.map((r) =>
        r.id === action.payload.id ? action.payload : r
      ),
      isPending: false,
    }),
    deleteRoomSuccess: (state, action: PayloadAction<number>) => ({
      ...state,
      rooms: state.rooms.filter((r) => r.id !== action.payload),
      isPending: false,
    }),
    updatePending: (state) => ({
      ...state,
      isPending: true,
    }),
  },
});

export const {
  fetchRoomsSuccess,
  fetchRoomsFailure,
  fetchRoomByIdSuccess,
  createRoomSuccess,
  updateRoomSuccess,
  deleteRoomSuccess,
  updatePending,
} = roomSlice.actions;

export default roomSlice.reducer;

export const fetchRoomsAction = createAction<{
  building?: string;
  search?: string;
}>(`${SLICE_NAME}/fetchRoomsRequest`);

export const fetchRoomByIdAction = createAction<{ id: number }>(
  `${SLICE_NAME}/fetchRoomByIdRequest`
);

export const createRoomAction = createAction<{
  data: {
    roomNumber: string;
    buildingId: number;
    floor?: number;
    capacity?: number;
    description?: string;
  };
}>(`${SLICE_NAME}/createRoomRequest`);

export const updateRoomAction = createAction<{
  id: number;
  data: {
    roomNumber?: string;
    buildingId?: number;
    floor?: number;
    capacity?: number;
    description?: string;
  };
}>(`${SLICE_NAME}/updateRoomRequest`);

export const deleteRoomAction = createAction<{ id: number }>(
  `${SLICE_NAME}/deleteRoomRequest`
);

function* handleFetchRooms(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { building, search },
    }: ReturnType<typeof fetchRoomsAction> = yield take(fetchRoomsAction);
    try {
      yield put(updatePending());
      const rooms = yield call(getAllRooms, { building, search });
      yield put(fetchRoomsSuccess(rooms));
    } catch (e: any) {
      yield put(fetchRoomsFailure());
      message.error("Không thể lấy danh sách phòng. Vui lòng thử lại.");
    }
  }
}

function* handleFetchRoomById(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id },
    }: ReturnType<typeof fetchRoomByIdAction> = yield take(fetchRoomByIdAction);
    try {
      yield put(updatePending());
      const room = yield call(getRoomById, id);
      yield put(fetchRoomByIdSuccess(room));
    } catch (e: any) {
      yield put(updatePending());
      message.error("Không thể lấy thông tin phòng. Vui lòng thử lại.");
    }
  }
}

function* handleCreateRoom(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { data },
    }: ReturnType<typeof createRoomAction> = yield take(createRoomAction);
    try {
      yield put(updatePending());
      const room = yield call(createRoom, data);
      yield put(createRoomSuccess(room));
      message.success("Tạo phòng thành công");
    } catch (e: any) {
      yield put(updatePending());
      message.error(
        e?.response?.data?.error || e?.message || "Tạo phòng thất bại"
      );
    }
  }
}

function* handleUpdateRoom(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id, data },
    }: ReturnType<typeof updateRoomAction> = yield take(updateRoomAction);
    try {
      yield put(updatePending());
      const room = yield call(updateRoom, id, data);
      yield put(updateRoomSuccess(room));
      message.success("Cập nhật phòng thành công");
    } catch (e: any) {
      yield put(updatePending());
      message.error(
        e?.response?.data?.error || e?.message || "Cập nhật phòng thất bại"
      );
    }
  }
}

function* handleDeleteRoom(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id },
    }: ReturnType<typeof deleteRoomAction> = yield take(deleteRoomAction);
    try {
      yield put(updatePending());
      yield call(deleteRoom, id);
      yield put(deleteRoomSuccess(id));
      message.success("Xóa phòng thành công");
    } catch (e: any) {
      yield put(updatePending());
      message.error(
        e?.response?.data?.error || e?.message || "Xóa phòng thất bại"
      );
    }
  }
}

export const roomSagas = [
  fork(handleFetchRooms),
  fork(handleFetchRoomById),
  fork(handleCreateRoom),
  fork(handleUpdateRoom),
  fork(handleDeleteRoom),
];

