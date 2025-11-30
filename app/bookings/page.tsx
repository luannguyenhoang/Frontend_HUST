"use client";

import { useEffect, useState } from "react";
import DefaultLayout from "@/components/templates/DefaultLayout";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchBookingsAction, cancelBookingAction } from "@/redux/modules/booking";
import { Card, Table, Tag, Button, Modal, message, Space, Popconfirm } from "antd";
import { CalendarOutlined, UserOutlined, FileTextOutlined, CloseCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

export default function BookingsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { bookings, isPending } = useAppSelector((state) => state.booking);
  const { currentUser } = useAppSelector((state) => state.auth);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      message.warning("Vui lòng đăng nhập để xem lịch hẹn");
      router.push("/login");
      return;
    }
    dispatch(fetchBookingsAction());
  }, [dispatch, currentUser, router]);

  const handleCancel = async (id: number) => {
    try {
      dispatch(cancelBookingAction({ id }));
      message.success("Hủy đặt lịch thành công");
      dispatch(fetchBookingsAction());
    } catch (error: any) {
      message.error(error?.message || "Hủy đặt lịch thất bại");
    }
  };

  const handleViewDetail = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

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
      render: (code: string) => <span className="font-mono font-semibold">{code}</span>,
    },
    {
      title: "Bác sĩ",
      key: "doctor",
      render: (_: any, record: any) => (
        <div>
          <div className="font-semibold">{record.doctorName || "N/A"}</div>
          {record.doctorTitle && (
            <div className="text-xs text-gray-500">{record.doctorTitle}</div>
          )}
        </div>
      ),
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
      key: "room",
      render: (_: any, record: any) => (
        <div>
          <div>{record.room || "N/A"}</div>
          {record.building && (
            <div className="text-xs text-gray-500">{record.building}</div>
          )}
        </div>
      ),
    },
    {
      title: "Số thứ tự",
      dataIndex: "queueNumber",
      key: "queueNumber",
      render: (num: string) => <span className="font-semibold text-blue-600">{num || "N/A"}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          {record.status === "confirmed" && (
            <Popconfirm
              title="Bạn có chắc chắn muốn hủy đặt lịch này?"
              onConfirm={() => handleCancel(record.id)}
              okText="Hủy"
              cancelText="Không"
            >
              <Button type="link" danger size="small" icon={<CloseCircleOutlined />}>
                Hủy
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Lịch hẹn của tôi</h1>
          <Button type="primary" onClick={() => router.push("/booking")}>
            Đặt lịch mới
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={bookings}
            rowKey="id"
            loading={isPending}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: "Chưa có lịch hẹn nào" }}
          />
        </Card>

        <Modal
          title="Chi tiết đặt lịch"
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={600}
        >
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Mã đặt lịch</div>
                  <div className="font-semibold font-mono">{selectedBooking.bookingCode}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Số thứ tự</div>
                  <div className="font-semibold text-blue-600">{selectedBooking.queueNumber || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Bác sĩ</div>
                  <div className="font-semibold">
                    {selectedBooking.doctorName || "N/A"}
                    {selectedBooking.doctorTitle && ` - ${selectedBooking.doctorTitle}`}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Chuyên khoa</div>
                  <div className="font-semibold">{selectedBooking.specialtyName || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Ngày khám</div>
                  <div className="font-semibold">
                    {dayjs(selectedBooking.examinationDate).format("DD/MM/YYYY")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Giờ khám</div>
                  <div className="font-semibold">{selectedBooking.examinationTime}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phòng</div>
                  <div className="font-semibold">
                    {selectedBooking.room || "N/A"}
                    {selectedBooking.building && ` - ${selectedBooking.building}`}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phí khám</div>
                  <div className="font-semibold">
                    {selectedBooking.fee?.toLocaleString("vi-VN")} VNĐ
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Trạng thái</div>
                  <Tag color={getStatusColor(selectedBooking.status)}>
                    {getStatusText(selectedBooking.status)}
                  </Tag>
                </div>
              </div>
              {selectedBooking.symptoms && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Triệu chứng</div>
                  <div className="p-3 bg-gray-50 rounded">{selectedBooking.symptoms}</div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DefaultLayout>
  );
}

