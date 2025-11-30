"use client";

import { useEffect } from "react";
import AdminLayout from "@/components/templates/AdminLayout";
import { Card, Row, Col, Statistic } from "antd";
import {
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchSpecialtiesAction } from "@/redux/modules";
import { fetchDoctorsAction } from "@/redux/modules";
import { fetchBookingsAction } from "@/redux/modules/booking";

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  const { specialties } = useAppSelector((state) => state.specialty);
  const { doctors } = useAppSelector((state) => state.doctor);
  const { bookings } = useAppSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchSpecialtiesAction({}));
    dispatch(fetchDoctorsAction({}));
    dispatch(fetchBookingsAction());
  }, [dispatch]);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng chuyên khoa"
                value={specialties.length}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng bác sĩ"
                value={doctors.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng đặt lịch"
                value={bookings.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đặt lịch hôm nay"
                value={bookings.filter(
                  (b) => new Date(b.examinationDate).toDateString() === new Date().toDateString()
                ).length}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Thống kê nhanh" className="h-full">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Đặt lịch đã xác nhận:</span>
                  <strong>
                    {bookings.filter((b) => b.status === "confirmed").length}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Đặt lịch đã hủy:</span>
                  <strong>
                    {bookings.filter((b) => b.status === "cancelled").length}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Đặt lịch đã hoàn thành:</span>
                  <strong>
                    {bookings.filter((b) => b.status === "completed").length}
                  </strong>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Hoạt động gần đây" className="h-full">
              <div className="text-gray-500 text-center py-8">
                Tính năng đang phát triển...
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}

