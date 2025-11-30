import { all } from "redux-saga/effects";
import { authSagas } from "./modules/auth";
import { specialtySagas } from "./modules/specialty";
import { doctorSagas } from "./modules/doctor";
import { appointmentSagas } from "./modules/appointment";
import { bookingSagas } from "./modules/booking";
import { familyMemberSagas } from "./modules/familyMember";
import { roomSagas } from "./modules/room";
import { buildingSagas } from "./modules/building";

export default function* rootSaga() {
  yield all([
    ...authSagas,
    ...specialtySagas,
    ...doctorSagas,
    ...appointmentSagas,
    ...bookingSagas,
    ...familyMemberSagas,
    ...roomSagas,
    ...buildingSagas,
  ]);
}

