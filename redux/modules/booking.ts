import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { call, fork, put, take } from "redux-saga/effects";
import { message } from "antd";
import {
  getAllBookings,
  getAllBookingsAdmin,
  getBookingById,
  createBooking,
  cancelBooking,
  getQueueInfo,
  Booking,
  QueueInfo,
} from "@/utils/api/booking";

export type BookingState = {
  readonly bookings: Booking[];
  readonly currentBooking: Booking | null;
  readonly queueInfo: QueueInfo | null;
  readonly isPending: boolean;
};

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  queueInfo: null,
  isPending: false,
};

const SLICE_NAME = "booking";

const bookingSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    fetchBookingsSuccess: (state, action: PayloadAction<Booking[]>) => ({
      ...state,
      bookings: action.payload,
      isPending: false,
    }),
    fetchBookingByIdSuccess: (state, action: PayloadAction<Booking>) => ({
      ...state,
      currentBooking: action.payload,
      isPending: false,
    }),
    createBookingSuccess: (state, action: PayloadAction<Booking>) => ({
      ...state,
      bookings: [action.payload, ...state.bookings],
      isPending: false,
    }),
    cancelBookingSuccess: (state, action: PayloadAction<Booking>) => ({
      ...state,
      bookings: state.bookings.map((b) =>
        b.id === action.payload.id ? action.payload : b
      ),
      currentBooking: state.currentBooking?.id === action.payload.id ? action.payload : state.currentBooking,
      isPending: false,
    }),
    fetchQueueInfoSuccess: (state, action: PayloadAction<QueueInfo>) => ({
      ...state,
      queueInfo: action.payload,
      isPending: false,
    }),
    updatePending: (state) => ({
      ...state,
      isPending: true,
    }),
  },
});

export const {
  fetchBookingsSuccess,
  fetchBookingByIdSuccess,
  createBookingSuccess,
  cancelBookingSuccess,
  fetchQueueInfoSuccess,
  updatePending,
} = bookingSlice.actions;

export default bookingSlice.reducer;

export const fetchBookingsAction = createAction(`${SLICE_NAME}/fetchBookingsRequest`);

export const fetchBookingsAdminAction = createAction(`${SLICE_NAME}/fetchBookingsAdminRequest`);

export const fetchBookingByIdAction = createAction<{ id: number }>(
  `${SLICE_NAME}/fetchBookingByIdRequest`
);

export const createBookingAction = createAction<{
  data: {
    appointmentId?: number;
    doctorId?: number;
    specialtyId: number;
    date: string;
    timeSlot: string;
    patientId?: number;
    symptoms?: string;
    fee?: number;
  };
}>(`${SLICE_NAME}/createBookingRequest`);

export const cancelBookingAction = createAction<{ id: number }>(
  `${SLICE_NAME}/cancelBookingRequest`
);

export const fetchQueueInfoAction = createAction<{ id: number }>(
  `${SLICE_NAME}/fetchQueueInfoRequest`
);

function* handleFetchBookings(): Generator<any, void, any> {
  while (true) {
    yield take(fetchBookingsAction);
    try {
      yield put(updatePending());
      const bookings = yield call(getAllBookings);
      yield put(fetchBookingsSuccess(bookings));
    } catch (e: any) {
      throw e;
    }
  }
}

function* handleFetchBookingsAdmin(): Generator<any, void, any> {
  while (true) {
    yield take(fetchBookingsAdminAction);
    try {
      yield put(updatePending());
      const bookings = yield call(getAllBookingsAdmin);
      yield put(fetchBookingsSuccess(bookings));
    } catch (e: any) {
      yield put(updatePending());
      message.error(e?.response?.data?.error || e?.message || "Lấy danh sách đặt lịch thất bại");
    }
  }
}

function* handleFetchBookingById(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id },
    }: ReturnType<typeof fetchBookingByIdAction> = yield take(fetchBookingByIdAction);
    try {
      yield put(updatePending());
      const booking = yield call(getBookingById, id);
      yield put(fetchBookingByIdSuccess(booking));
    } catch (e: any) {
      throw e;
    }
  }
}

function* handleCreateBooking(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { data },
    }: ReturnType<typeof createBookingAction> = yield take(createBookingAction);
    try {
      yield put(updatePending());
      const booking = yield call(createBooking, data);
      yield put(createBookingSuccess(booking));
    } catch (e: any) {
      yield put(updatePending());
      message.error(e?.response?.data?.error || e?.message || "Đặt lịch thất bại");
      throw e;
    }
  }
}

function* handleCancelBooking(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id },
    }: ReturnType<typeof cancelBookingAction> = yield take(cancelBookingAction);
    try {
      yield put(updatePending());
      const booking = yield call(cancelBooking, id);
      yield put(cancelBookingSuccess(booking));
    } catch (e: any) {
      yield put(updatePending());
      message.error(e?.response?.data?.error || e?.message || "Hủy đặt lịch thất bại");
      throw e;
    }
  }
}

function* handleFetchQueueInfo(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id },
    }: ReturnType<typeof fetchQueueInfoAction> = yield take(fetchQueueInfoAction);
    try {
      yield put(updatePending());
      const queueInfo = yield call(getQueueInfo, id);
      yield put(fetchQueueInfoSuccess(queueInfo));
    } catch (e: any) {
      throw e;
    }
  }
}

export const bookingSagas = [
  fork(handleFetchBookings),
  fork(handleFetchBookingsAdmin),
  fork(handleFetchBookingById),
  fork(handleCreateBooking),
  fork(handleCancelBooking),
  fork(handleFetchQueueInfo),
];

