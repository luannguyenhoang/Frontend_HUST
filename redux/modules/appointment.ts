import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { call, fork, put, take, race } from "redux-saga/effects";
import {
  getAvailableSlots,
  getAllAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  Appointment,
  GroupedAppointment,
  Page,
} from "@/utils/api/appointment";
import { message } from "antd";

export type AppointmentState = {
  readonly page: Page<GroupedAppointment>;
  readonly appointments: Appointment[];
  readonly availableSlots: any[];
  readonly isPending: boolean;
};

const initialState: AppointmentState = {
  page: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 20,
    number: 0,
    first: true,
    last: true,
    numberOfElements: 0,
    empty: true,
  },
  appointments: [],
  availableSlots: [],
  isPending: false,
};

const SLICE_NAME = "appointment";

const appointmentSlice = createSlice({
  name: SLICE_NAME,
  initialState,
  reducers: {
    fetchAppointmentsSuccess: (state, action: PayloadAction<Page<GroupedAppointment>>) => ({
      ...state,
      page: action.payload,
      appointments: action.payload.content.flatMap(group => group.appointments),
      isPending: false,
    }),
    fetchAppointmentsFailure: (state) => ({
      ...state,
      isPending: false,
    }),
    fetchAvailableSlotsSuccess: (state, action: PayloadAction<any[]>) => ({
      ...state,
      availableSlots: action.payload,
      isPending: false,
    }),
    fetchAvailableSlotsFailure: (state) => ({
      ...state,
      isPending: false,
    }),
    createAppointmentSuccess: (state, action: PayloadAction<Appointment>) => ({
      ...state,
      appointments: [...state.appointments, action.payload],
      isPending: false,
    }),
    updateAppointmentSuccess: (state, action: PayloadAction<Appointment>) => ({
      ...state,
      appointments: state.appointments.map((apt) =>
        apt.id === action.payload.id ? action.payload : apt
      ),
      isPending: false,
    }),
    deleteAppointmentSuccess: (state, action: PayloadAction<number>) => ({
      ...state,
      appointments: state.appointments.filter((apt) => apt.id !== action.payload),
      isPending: false,
    }),
    updatePending: (state) => ({
      ...state,
      isPending: true,
    }),
  },
});

export const {
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  fetchAvailableSlotsSuccess,
  fetchAvailableSlotsFailure,
  createAppointmentSuccess,
  updateAppointmentSuccess,
  deleteAppointmentSuccess,
  updatePending,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;

export const fetchAvailableSlotsAction = createAction<{
  specialtyId: number;
  date: string;
  doctorId?: number;
  title?: string;
}>(`${SLICE_NAME}/fetchAvailableSlotsRequest`);

export const fetchAppointmentsAction = createAction<{
  doctorId?: number;
  specialtyId?: number;
  date?: string;
  page?: number;
  size?: number;
}>(`${SLICE_NAME}/fetchAppointmentsRequest`);

export const createAppointmentAction = createAction<{
  data: {
    doctorId: number;
    specialtyId: number;
    date: string;
    timeSlot: string;
    maxPatients?: number;
  };
}>(`${SLICE_NAME}/createAppointmentRequest`);

export const updateAppointmentAction = createAction<{
  id: number;
  data: { maxPatients: number };
}>(`${SLICE_NAME}/updateAppointmentRequest`);

export const deleteAppointmentAction = createAction<{ id: number }>(
  `${SLICE_NAME}/deleteAppointmentRequest`
);

function* handleFetchAvailableSlots(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { specialtyId, date, doctorId, title },
    }: ReturnType<typeof fetchAvailableSlotsAction> = yield take(fetchAvailableSlotsAction);
    try {
      yield put(updatePending());
      const slots = yield call(getAvailableSlots, specialtyId, date, doctorId, title);
      yield put(fetchAvailableSlotsSuccess(slots));
    } catch (e: any) {
      yield put(fetchAvailableSlotsFailure());
      console.error("Error fetching available slots:", e);
      if (e?.response?.status === 401) {
        if (typeof window !== "undefined") {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          window.location.href = "/login";
        }
      } else {
        message.error("Không thể lấy danh sách lịch khám. Vui lòng thử lại.");
      }
    }
  }
}

function* handleFetchAppointments(): Generator<any, void, any> {
  while (true) {
    const {
      payload,
    }: ReturnType<typeof fetchAppointmentsAction> = yield take(fetchAppointmentsAction);
    try {
      yield put(updatePending());
      const page: Page<GroupedAppointment> = yield call(getAllAppointments, payload);
      yield put(fetchAppointmentsSuccess(page));
    } catch (e: any) {
      yield put(fetchAppointmentsFailure());
      message.error(
        e?.response?.data?.error || e?.message || "Lấy danh sách lịch khám thất bại"
      );
    }
  }
}

function* handleCreateAppointment(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { data },
    }: ReturnType<typeof createAppointmentAction> = yield take(createAppointmentAction);
    try {
      yield put(updatePending());
      console.log('Creating appointment with data:', data);
      const appointment = yield call(createAppointment, data);
      console.log('Appointment created successfully:', appointment);
      yield put(createAppointmentSuccess(appointment));
      message.success("Tạo lịch khám thành công");
    } catch (e: any) {
      yield put(updatePending());
      const errorMessage = e?.response?.data?.error || e?.message || "Tạo lịch khám thất bại";
      console.error('Error creating appointment:', e);
      console.error('Error response:', e?.response?.data);
      message.error(errorMessage);
    }
  }
}

function* handleUpdateAppointment(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id, data },
    }: ReturnType<typeof updateAppointmentAction> = yield take(updateAppointmentAction);
    try {
      yield put(updatePending());
      const appointment = yield call(updateAppointment, id, data);
      yield put(updateAppointmentSuccess(appointment));
      message.success("Cập nhật lịch khám thành công");
    } catch (e: any) {
      yield put(updatePending());
      message.error(e?.response?.data?.error || e?.message || "Cập nhật lịch khám thất bại");
    }
  }
}

function* deleteAppointmentTask(id: number): Generator<any, void, any> {
  try {
    yield call(deleteAppointment, id);
    yield put(deleteAppointmentSuccess(id));
    message.success("Xóa lịch khám thành công");
  } catch (e: any) {
    message.error(e?.response?.data?.error || e?.message || "Xóa lịch khám thất bại");
  }
}

function* handleDeleteAppointment(): Generator<any, void, any> {
  while (true) {
    const {
      payload: { id },
    }: ReturnType<typeof deleteAppointmentAction> = yield take(deleteAppointmentAction);
    // Fork để chạy song song, không block - có thể xóa nhiều cái cùng lúc
    yield fork(deleteAppointmentTask, id);
  }
}

export const appointmentSagas = [
  fork(handleFetchAvailableSlots),
  fork(handleFetchAppointments),
  fork(handleCreateAppointment),
  fork(handleUpdateAppointment),
  fork(handleDeleteAppointment),
];
