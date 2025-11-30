"use client";

import { useEffect } from "react";
import AdminLayout from "@/components/templates/AdminLayout";
import { Table, Tag, Space } from "antd";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchBookingsAdminAction } from "@/redux/modules/booking";
import dayjs from "dayjs";

export default function AdminBookingsPage() {
  const dispatch = useAppDispatch();
  const { bookings } = useAppSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchBookingsAdminAction());
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "green";
      case "cancelled":
        return "red";
      case "completed":
        return "blue";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận";
      case "cancelled":
        return "Đã hủy";
      case "completed":
        return "Đã hoàn thành";
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "Mã đặt lịch",
      dataIndex: "bookingCode",
      key: "bookingCode",
    },
    {
      title: "Bệnh nhân",
      dataIndex: "patientName",
      key: "patientName",
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
    },
    {
      title: "Ngày khám",
      dataIndex: "examinationDate",
      key: "examinationDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Giờ khám",
      dataIndex: "examinationTime",
      key: "examinationTime",
    },
    {
      title: "Phòng",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Số thứ tự",
      dataIndex: "queueNumber",
      key: "queueNumber",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Quản lý Đặt lịch</h1>
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>
    </AdminLayout>
  );
}

