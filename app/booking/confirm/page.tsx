"use client";

import { useState, useEffect } from "react";
import DefaultLayout from "@/components/templates/DefaultLayout";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { createBookingAction } from "@/redux/modules/booking";
import { fetchSpecialtiesAction, fetchDoctorsAction } from "@/redux/modules";
import { Card, Form, Button, Input, message, Collapse } from "antd";
import { UserOutlined, CalendarOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import "dayjs/locale/vi";

dayjs.locale("vi");

const { TextArea } = Input;

export default function BookingConfirmPage() {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { currentUser } = useAppSelector((state) => state.auth);
  const { familyMembers } = useAppSelector((state) => state.familyMember);
  const { specialties } = useAppSelector((state) => state.specialty);
  const { doctors } = useAppSelector((state) => state.doctor);
  const { isPending } = useAppSelector((state) => state.booking);

  const [bookingInfo, setBookingInfo] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("bookingInfo");
    if (!stored) {
      message.error("Không tìm thấy thông tin đặt lịch");
      router.push("/booking");
      return;
    }

    const info = JSON.parse(stored);
    setBookingInfo(info);

    // Lấy thông tin patient
    if (info.patientId === null) {
      setSelectedPatient(currentUser);
    } else {
      const member = familyMembers.find((m) => m.id === info.patientId);
      setSelectedPatient(member);
    }

    dispatch(fetchSpecialtiesAction({}));
    dispatch(fetchDoctorsAction({ specialtyId: info.specialtyId }));
  }, [dispatch, router, currentUser, familyMembers]);

  const handleConfirm = async (values: any) => {
    if (!bookingInfo) return;

    try {
      const bookingData = {
        appointmentId: bookingInfo.appointmentId || undefined,
        specialtyId: bookingInfo.specialtyId,
        date: bookingInfo.date,
        timeSlot: bookingInfo.timeSlot,
        doctorId: bookingInfo.doctorId,
        patientId: bookingInfo.patientId,
        symptoms: values.symptoms,
      };

      dispatch(createBookingAction({ data: bookingData }));

      setTimeout(() => {
        message.success("Đặt lịch thành công!");
        sessionStorage.removeItem("bookingInfo");
        router.push("/bookings");
      }, 500);
    } catch (error: any) {
      message.error(error?.message || "Đặt lịch thất bại. Vui lòng thử lại.");
    }
  };

  if (!bookingInfo) {
    return null;
  }

  const selectedSpecialty = specialties.find((s) => s.id === bookingInfo.specialtyId);
  const selectedDoctor = doctors.find((d) => d.id === bookingInfo.doctorId);
  const selectedDate = dayjs(bookingInfo.date);

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
            <h1 className="text-xl font-bold ml-4">Xác nhận đặt lịch khám</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="mb-4 text-gray-600">
            Vui lòng kiểm tra lại thông tin trước khi xác nhận đặt lịch khám.
          </div>

          <Form form={form} onFinish={handleConfirm} layout="vertical">
            {/* Thông tin khách hàng */}
            <Card className="mb-4">
              <Collapse
                ghost
                defaultActiveKey={["1"]}
                items={[
                  {
                    key: "1",
                    label: (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <UserOutlined />
                        <span>THÔNG TIN KHÁCH HÀNG</span>
                      </div>
                    ),
                    children: (
                      <div className="space-y-3 mt-4">
                        <div>
                          <div className="text-sm text-gray-500">Họ và tên</div>
                          <div className="text-lg font-semibold">
                            {selectedPatient?.fullName || "N/A"}
                          </div>
                        </div>
                        {selectedPatient?.email && (
                          <div>
                            <div className="text-sm text-gray-500">Email</div>
                            <div className="text-lg font-semibold">{selectedPatient.email}</div>
                          </div>
                        )}
                        {selectedPatient?.phone && (
                          <div>
                            <div className="text-sm text-gray-500">Số điện thoại</div>
                            <div className="text-lg font-semibold">{selectedPatient.phone}</div>
                          </div>
                        )}
                        {selectedPatient?.dateOfBirth && (
                          <div>
                            <div className="text-sm text-gray-500">Ngày sinh</div>
                            <div className="text-lg font-semibold">
                              {dayjs(selectedPatient.dateOfBirth).format("DD/MM/YYYY")}
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </Card>

            {/* Thông tin đặt lịch */}
            <Card className="mb-4">
              <Collapse
                ghost
                defaultActiveKey={["1"]}
                items={[
                  {
                    key: "1",
                    label: (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <CalendarOutlined />
                        <span>ĐẶT LỊCH</span>
                      </div>
                    ),
                    children: (
                      <div className="space-y-3 mt-4">
                        <div>
                          <div className="text-sm text-gray-500">Thời gian khám</div>
                          <div className="text-lg font-semibold">
                            {bookingInfo.timeSlot} {selectedDate.format("DD-MM-YYYY")}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Chuyên khoa</div>
                          <div className="text-lg font-semibold">
                            {selectedSpecialty?.name || "N/A"}
                            {selectedDoctor?.title && ` [${selectedDoctor.title}]`}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Phòng khám</div>
                          <div className="text-lg font-semibold">
                            {selectedDoctor?.room || "N/A"}
                            {selectedDoctor?.building && ` - ${selectedDoctor.building}`}
                          </div>
                        </div>
                        {selectedDoctor && (
                          <div>
                            <div className="text-sm text-gray-500">Bác sĩ</div>
                            <div className="text-lg font-semibold">
                              {selectedDoctor.fullName}
                              {selectedDoctor.title && ` - ${selectedDoctor.title}`}
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </Card>

            {/* Lý do khám */}
            <Card className="mb-6">
              <div className="flex items-center gap-2 text-green-600 font-semibold mb-4">
                <span>LÝ DO KHÁM *</span>
              </div>
              <Form.Item
                name="symptoms"
                rules={[{ required: true, message: "Vui lòng mô tả triệu chứng" }]}
                initialValue={bookingInfo.symptoms}
              >
                <TextArea
                  rows={6}
                  placeholder="Mô tả triệu chứng của bạn..."
                  className="text-base"
                />
              </Form.Item>
            </Card>

            <div className="flex justify-between">
              <Button
                type="link"
                danger
                size="large"
                onClick={() => router.back()}
                className="px-0"
              >
                &lt; Thay đổi lịch
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={isPending}
                className="bg-green-600 hover:bg-green-700 border-green-600"
                style={{ minWidth: "200px" }}
              >
                Xác nhận đăng ký
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </DefaultLayout>
  );
}

