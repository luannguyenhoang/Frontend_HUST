import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./modules/auth";
import specialtyReducer from "./modules/specialty";
import doctorReducer from "./modules/doctor";
import appointmentReducer from "./modules/appointment";
import bookingReducer from "./modules/booking";
import familyMemberReducer from "./modules/familyMember";
import roomReducer from "./modules/room";
import buildingReducer from "./modules/building";

export const rootReducer = combineReducers({
  auth: authReducer,
  specialty: specialtyReducer,
  doctor: doctorReducer,
  appointment: appointmentReducer,
  booking: bookingReducer,
  familyMember: familyMemberReducer,
  room: roomReducer,
  building: buildingReducer,
});

