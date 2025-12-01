"use client";

import { useState, useEffect, useMemo } from "react";
import DefaultLayout from "@/components/templates/DefaultLayout";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import {
  fetchSpecialtiesAction,
  fetchAvailableSlotsAction,
  fetchDoctorsAction,
  fetchFamilyMembersAction,
} from "@/redux/modules";
import { createBookingAction } from "@/redux/modules/booking";
import { Card, Form, Select, Button, Input, message, Pagination } from "antd";
import { ArrowLeftOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import "dayjs/locale/vi";

dayjs.locale("vi");

const { TextArea } = Input;

interface GroupedSlot {
  specialtyId?: number;
  specialty?: string;
  room: string;
  building: string;
  slots: Array<{
    appointmentId: number | null;
    doctorId: number;
    doctorName: string;
    doctorTitle?: string;
    timeSlot: string;
    availableCount: number;
  }>;
}

export default function BookingPage() {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { specialties, pagination: specialtyPagination } = useAppSelector((state) => state.specialty);
  const { doctors, pagination: doctorPagination } = useAppSelector((state) => state.doctor);
  const { availableSlots } = useAppSelector((state) => state.appointment);
  const { currentUser } = useAppSelector((state) => state.auth);
  const { familyMembers } = useAppSelector((state) => state.familyMember);
  const { isPending } = useAppSelector((state) => state.booking);
  const router = useRouter();
  
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [currentDoctorPage, setCurrentDoctorPage] = useState<number>(1);
  const [doctorPageSize] = useState<number>(10);

  const [bookingMode, setBookingMode] = useState<"select" | "specialty" | "doctor">("select");
  const [selectedDoctorFromList, setSelectedDoctorFromList] = useState<number | null>(null);

  useEffect(() => {
    if (!currentUser) {
      message.warning("Vui lòng đăng nhập để đặt lịch khám");
      router.push("/login");
      return;
    }
    dispatch(fetchFamilyMembersAction());
    setSelectedPatientId(null);
  }, [dispatch, currentUser, router]);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchSpecialtiesAction({ search: searchKeyword || undefined, page: currentPage, pageSize }));
    }
  }, [dispatch, searchKeyword, currentPage, pageSize, currentUser]);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchDoctorsAction({ page: currentDoctorPage, pageSize: doctorPageSize }));
    }
  }, [dispatch, currentDoctorPage, doctorPageSize, currentUser]);

  const dates = useMemo(() => {
    const datesList = [];
    for (let i = 0; i < 7; i++) {
      const date = dayjs().add(i, "day");
      datesList.push({
        date: date.format("YYYY-MM-DD"),
        display: date.format("DD/MM"),
        dayName: date.format("ddd").toUpperCase(),
        full: date.format("DD/MM ddd"),
      });
    }
    return datesList;
  }, []);

  const groupedSlots = useMemo(() => {
    // Group theo specialty trước, sau đó group theo room/building
    const specialtyGroups: { [key: number]: { [key: string]: GroupedSlot } } = {};
    
    availableSlots.forEach((slot: any) => {
      const specialtyId = slot.specialtyId || 0;
      const specialtyName = slot.specialty || "Chưa phân loại";
      
      if (!specialtyGroups[specialtyId]) {
        specialtyGroups[specialtyId] = {};
      }
      
      const roomBuildingKey = `${slot.room || "N/A"}_${slot.building || "N/A"}`;
      if (!specialtyGroups[specialtyId][roomBuildingKey]) {
        specialtyGroups[specialtyId][roomBuildingKey] = {
          specialtyId: specialtyId || undefined,
          specialty: specialtyName,
          room: slot.room || "N/A",
          building: slot.building || "N/A",
          slots: [],
        };
      }
      specialtyGroups[specialtyId][roomBuildingKey].slots.push({
        appointmentId: slot.appointmentId,
        doctorId: slot.doctorId,
        doctorName: slot.doctorName,
        doctorTitle: slot.doctorTitle,
        timeSlot: slot.timeSlot,
        availableCount: slot.availableCount,
      });
    });

    // Flatten thành array, group theo specialty
    const result: GroupedSlot[] = [];
    Object.keys(specialtyGroups).sort().forEach((specialtyIdStr) => {
      const specialtyId = parseInt(specialtyIdStr);
      const rooms = Object.values(specialtyGroups[specialtyId]);
      result.push(...rooms);
    });

    return result;
  }, [availableSlots]);


  const handleSpecialtySelect = (specialtyId: number) => {
    setSelectedSpecialtyId(specialtyId);
    form.setFieldsValue({ specialtyId });
    dispatch(fetchDoctorsAction({ specialtyId, page: 1, pageSize: doctorPageSize }));
    form.setFieldsValue({ doctorId: undefined, title: undefined });
    setSelectedDoctorId(undefined);
    setSearchKeyword("");
    setCurrentPage(1);
  };

  const handleSpecialtyPageChange = (page: number) => {
    setCurrentPage(page);
    dispatch(fetchSpecialtiesAction({ search: searchKeyword || undefined, page, pageSize }));
  };

  const handleDoctorPageChange = (page: number) => {
    setCurrentDoctorPage(page);
    dispatch(fetchDoctorsAction({ page, pageSize: doctorPageSize }));
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    const specialtyId = form.getFieldValue("specialtyId");
    const title = form.getFieldValue("title");
    const doctorId = form.getFieldValue("doctorId");
    
    if (specialtyId) {
      dispatch(
        fetchAvailableSlotsAction({
          specialtyId,
          date,
          doctorId,
          title,
        })
      );
    }
    setSelectedTimeSlot("");
    setSelectedAppointmentId(null);
  };

  const handleTitleChange = (title: string | undefined) => {
    const specialtyId = form.getFieldValue("specialtyId");
    if (specialtyId && selectedDate) {
      dispatch(
        fetchAvailableSlotsAction({
          specialtyId,
          date: selectedDate,
          doctorId: undefined,
          title,
        })
      );
    }
    setSelectedTimeSlot("");
    setSelectedAppointmentId(null);
  };

  const handleTimeSlotSelect = (timeSlot: string, doctorId: number, appointmentId: number | null) => {
    setSelectedTimeSlot(timeSlot);
    setSelectedDoctorId(doctorId);
    setSelectedAppointmentId(appointmentId);
    form.setFieldsValue({ timeSlot, doctorId });
  };

  const onFinish = async (values: any) => {
    if (!selectedTimeSlot) {
      message.error("Vui lòng chọn giờ khám");
      return;
    }

    // Lưu thông tin vào sessionStorage để chuyển sang trang confirmation
    const bookingInfo = {
      appointmentId: selectedAppointmentId,
      specialtyId: values.specialtyId,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      doctorId: selectedDoctorId || values.doctorId,
      symptoms: values.symptoms || "",
      patientId: selectedPatientId,
    };
    
    sessionStorage.setItem("bookingInfo", JSON.stringify(bookingInfo));
    router.push("/booking/confirm");
  };

  const specialtyId = form.getFieldValue("specialtyId");

  // Nếu đang ở mode select, hiển thị trang chọn
  if (bookingMode === "select") {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-green-600 text-white py-4">
            <div className="container mx-auto px-4 flex items-center">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                className="text-white"
                onClick={() => router.back()}
              />
              <h1 className="text-xl font-bold ml-4">ĐẶT LỊCH KHÁM</h1>
            </div>
          </div>

          <div className="container mx-auto px-4 py-6">
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-300 text-gray-600">
                    1
                  </div>
                  <div className="flex-1 h-1 bg-gray-300"></div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-green-600 text-white">
                    2
                  </div>
                  <div className="flex-1 h-1 bg-gray-300"></div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-300 text-gray-600">
                    3
                  </div>
                  <div className="flex-1 h-1 bg-gray-300"></div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-300 text-gray-600">
                    4
                  </div>
                </div>
                <div className="ml-4 text-blue-600 font-bold text-lg">
                  BƯỚC 2
                </div>
              </div>
            </div>

            {/* Nút Theo chuyên khoa */}
            <div className="mb-6">
              <Button
                type="primary"
                size="large"
                className="w-full bg-green-600 hover:bg-green-700 border-green-600 h-16 text-lg font-semibold"
                icon={<SearchOutlined />}
                onClick={() => setBookingMode("specialty")}
              >
                Theo chuyên khoa
              </Button>
            </div>

            {/* Danh sách bác sĩ */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-4">Bác sĩ khám trong tuần</h2>
              <div className="space-y-4 mb-4">
                {doctors.map((doctor) => {
                  const specialty = specialties.find((s) => s.id === doctor.specialtyId);
                  return (
                    <div
                      key={doctor.id}
                      onClick={() => {
                        setSelectedDoctorFromList(doctor.id);
                        setSelectedSpecialtyId(doctor.specialtyId || null);
                        form.setFieldsValue({ specialtyId: doctor.specialtyId });
                        setBookingMode("specialty");
                        dispatch(fetchAvailableSlotsAction({
                          specialtyId: doctor.specialtyId!,
                          date: selectedDate,
                          doctorId: doctor.id,
                        }));
                      }}
                      className="bg-white p-4 rounded-lg border border-gray-200 cursor-pointer hover:border-green-400 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <UserOutlined className="text-2xl text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-lg mb-1">{doctor.fullName}</div>
                          {doctor.title && (
                            <div className="text-sm text-gray-600 mb-1">{doctor.title}</div>
                          )}
                          {specialty && (
                            <div className="text-green-600 font-semibold mb-2">
                              {specialty.name}
                            </div>
                          )}
                          {specialty?.symptoms && specialty.symptoms.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {specialty.symptoms.slice(0, 3).map((s, idx) => (
                                <span key={idx}>
                                  {s.toUpperCase()}
                                  {idx < Math.min(2, specialty.symptoms.length - 1) && ", "}
                                </span>
                              ))}
                              {specialty.symptoms.length > 3 && "..."}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {doctorPagination && doctorPagination.total > doctorPageSize && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    current={currentDoctorPage}
                    total={doctorPagination.total}
                    pageSize={doctorPageSize}
                    onChange={handleDoctorPageChange}
                    showSizeChanger={false}
                    showQuickJumper={false}
                    showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} bác sĩ`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-green-600 text-white py-4">
          <div className="container mx-auto px-4 flex items-center">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              className="text-white"
              onClick={() => {
                if (bookingMode === "specialty") {
                  setBookingMode("select");
                } else {
                  router.back();
                }
              }}
            />
            <h1 className="text-xl font-bold ml-4">Đặt lịch theo chuyên khoa</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <Card>
            <Form form={form} onFinish={onFinish} layout="vertical">
              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      selectedSpecialtyId ? "bg-green-600 text-white" : "bg-green-600 text-white"
                    }`}>
                      1
                    </div>
                    <div className="flex-1 h-1 bg-gray-300">
                      <div className={`h-full ${selectedSpecialtyId ? "bg-green-600" : ""}`} style={{ width: selectedSpecialtyId ? "100%" : "0%" }}></div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      selectedDate ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
                    }`}>
                      2
                    </div>
                    <div className="flex-1 h-1 bg-gray-300">
                      <div className={`h-full ${selectedTimeSlot ? "bg-green-600" : ""}`} style={{ width: selectedTimeSlot ? "100%" : "0%" }}></div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      selectedTimeSlot ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
                    }`}>
                      3
                    </div>
                    <div className="flex-1 h-1 bg-gray-300"></div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-300 text-gray-600">
                      4
                    </div>
                  </div>
                  <div className="ml-4 text-blue-600 font-bold text-lg">
                    {!selectedSpecialtyId ? "BƯỚC 1" : !selectedDate ? "BƯỚC 2" : !selectedTimeSlot ? "BƯỚC 3" : "BƯỚC 4"}
                  </div>
                </div>
              </div>

              {/* Chọn người đăng ký */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <UserOutlined className="text-green-600" />
                  <label className="text-sm font-semibold text-gray-700">
                    CHỌN NGƯỜI ĐĂNG KÝ
                  </label>
                </div>
                <Select
                  size="large"
                  value={selectedPatientId}
                  onChange={(value) => setSelectedPatientId(value)}
                  className="w-full"
                  placeholder="Chọn người đăng ký"
                >
                  <Select.Option value={null}>
                    Tôi - {currentUser?.fullName}
                  </Select.Option>
                  {familyMembers.map((member) => (
                    <Select.Option key={member.id} value={member.id}>
                      {member.fullName} {member.relationship && `(${member.relationship})`}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* Chọn chuyên khoa */}
              {!selectedSpecialtyId && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-4 ">Chọn theo chuyên khoa</h2>
                  <Form.Item
                    name="specialtyId"
                    rules={[{ required: true, message: "Vui lòng chọn chuyên khoa" }]}
                  >
                    <div>
                      <Input
                        size="large"
                        placeholder="Tìm kiếm chuyên khoa..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchKeyword}
                        onChange={(e) => {
                          setSearchKeyword(e.target.value);
                          setCurrentPage(1);
                          dispatch(fetchSpecialtiesAction({ search: e.target.value || undefined, page: 1, pageSize }));
                        }}
                        className="mb-4"
                      />
                      <div className="space-y-3 mb-4">
                        {specialties.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            Không tìm thấy chuyên khoa nào
                          </div>
                        ) : (
                          specialties.map((specialty) => (
                            <div
                              key={specialty.id}
                              onClick={() => handleSpecialtySelect(specialty.id)}
                              className="bg-green-600 text-white p-4 rounded-lg cursor-pointer transition-all hover:bg-green-700"
                            >
                              <div className="font-semibold text-lg mb-2 text-white">
                                {specialty.name}
                              </div>
                              {specialty.symptoms && specialty.symptoms.length > 0 && (
                                <div className="text-sm text-white/90">
                                  {specialty.symptoms.map((symptom, idx) => (
                                    <span key={idx}>
                                      {symptom.toUpperCase()}
                                      {idx < specialty.symptoms.length - 1 && ", "}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {specialty.description && (
                                <div className="text-sm text-white/90 mt-1">
                                  {specialty.description}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      {specialtyPagination && specialtyPagination.total > pageSize && (
                        <div className="flex justify-center mt-4">
                          <Pagination
                            current={currentPage}
                            total={specialtyPagination.total}
                            pageSize={pageSize}
                            onChange={handleSpecialtyPageChange}
                            showSizeChanger={false}
                            showQuickJumper={false}
                            showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} chuyên khoa`}
                          />
                        </div>
                      )}
                    </div>
                  </Form.Item>
                </div>
              )}

              {/* Hiển thị chuyên khoa đã chọn */}
              {selectedSpecialtyId && (
                <div className="mb-6">
                  <div className="p-4 border-2 border-green-500 rounded-lg bg-green-50">
                    <div className="font-semibold text-lg text-gray-800 mb-2">
                      {specialties.find((s) => s.id === selectedSpecialtyId)?.name}
                    </div>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setSelectedSpecialtyId(null);
                        form.setFieldsValue({ specialtyId: undefined });
                        setSearchKeyword("");
                        setSelectedDate(dayjs().format("YYYY-MM-DD"));
                        setSelectedTimeSlot("");
                      }}
                      className="p-0"
                    >
                      Chọn lại
                    </Button>
                  </div>
                </div>
              )}

              {selectedSpecialtyId && (
                <>
                  {/* Chọn ngày khám */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Chọn ngày khám
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {dates.map((d) => (
                        <button
                          key={d.date}
                          type="button"
                          onClick={() => handleDateSelect(d.date)}
                          className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all ${
                            selectedDate === d.date
                              ? "bg-green-500 text-white border-green-500"
                              : "bg-white border-gray-300 hover:border-green-400"
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-semibold">{d.display}</div>
                            <div className="text-xs">{d.dayName}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedDate && availableSlots.length > 0 && (
                    <div className="mb-6">
                      {groupedSlots.map((group, groupIndex) => (
                        <div key={groupIndex} className="mb-4">
                          <div className="bg-green-600 text-white p-3 rounded-t-lg font-semibold">
                            {group.specialty || "Chưa phân loại"}
                            {group.building && group.building !== "N/A" && ` (${group.building})`}
                          </div>
                          <div className="bg-green-50 p-4 border border-t-0 rounded-b-lg">
                            <div className="font-medium mb-3">
                              PK {group.room && group.room !== "N/A" ? group.room : "N/A"}
                              {group.building && group.building !== "N/A" && ` - ${group.building}`}
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              {group.slots.map((slot, slotIndex) => (
                                <button
                                  key={slotIndex}
                                  type="button"
                                  onClick={() =>
                                    handleTimeSlotSelect(slot.timeSlot, slot.doctorId, slot.appointmentId)
                                  }
                                  disabled={slot.availableCount === 0}
                                  className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                                    selectedTimeSlot === slot.timeSlot &&
                                    selectedDoctorId === slot.doctorId
                                      ? "bg-green-500 text-white border-green-500"
                                      : slot.availableCount === 0
                                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                      : "bg-white border-gray-300 hover:border-green-400 hover:bg-green-50"
                                  }`}
                                >
                                  {slot.timeSlot}
                                </button>
                              ))}
                            </div>
                            {group.slots.length > 0 && (
                              <div className="mt-2 text-xs text-gray-600">
                                Bác sĩ: {group.slots[0].doctorName}
                                {group.slots[0].doctorTitle && ` - ${group.slots[0].doctorTitle}`}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-center mt-6">
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  disabled={!selectedTimeSlot}
                  loading={isPending}
                  className="bg-green-600 hover:bg-green-700 border-green-600"
                  style={{ minWidth: "200px" }}
                >
                  Tiếp tục
                </Button>
              </div>

            </Form>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}
