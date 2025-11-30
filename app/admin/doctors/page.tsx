"use client";

import { useEffect, useState, useMemo } from "react";
import AdminLayout from "@/components/templates/AdminLayout";
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchDoctorsAction, fetchSpecialtiesAction, fetchRoomsAction, createDoctorAction, updateDoctorAction, deleteDoctorAction } from "@/redux/modules";

export default function AdminDoctorsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { doctors } = useAppSelector((state) => state.doctor);
  const { specialties } = useAppSelector((state) => state.specialty);
  const { rooms } = useAppSelector((state) => state.room);
  
  // Watch specialtyId để filter rooms
  const selectedSpecialtyId = Form.useWatch('specialtyId', form);
  
  // Filter rooms theo building của specialty đã chọn
  const availableRooms = useMemo(() => {
    if (!selectedSpecialtyId) return [];
    
    const selectedSpecialty = specialties.find(s => s.id === selectedSpecialtyId);
    if (!selectedSpecialty || !selectedSpecialty.buildingId) {
      // Nếu specialty không có building, hiển thị tất cả phòng
      return rooms.map((r) => ({
        label: `${r.roomNumber} - ${r.building}`,
        value: r.id,
      }));
    }
    
    // Filter rooms theo buildingId của specialty
    return rooms
      .filter(r => r.buildingId === selectedSpecialty.buildingId)
      .map((r) => ({
        label: `${r.roomNumber} - ${r.building}`,
        value: r.id,
      }));
  }, [selectedSpecialtyId, specialties, rooms]);

  useEffect(() => {
    dispatch(fetchDoctorsAction({}));
    dispatch(fetchSpecialtiesAction({}));
    dispatch(fetchRoomsAction({}));
  }, [dispatch]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      roomId: record.roomId || rooms.find(r => r.roomNumber === record.room && r.building === record.building)?.id,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    dispatch(deleteDoctorAction({ id }));
    // Refetch sau khi xóa thành công
    setTimeout(() => {
      dispatch(fetchDoctorsAction({}));
    }, 500);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        dispatch(updateDoctorAction({ id: editingId, data: values }));
      } else {
        dispatch(createDoctorAction({ data: values }));
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
      setTimeout(() => {
        dispatch(fetchDoctorsAction({}));
      }, 500);
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Chức danh",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Chuyên khoa",
      dataIndex: "specialtyId",
      key: "specialtyId",
      render: (id: number) => {
        const specialty = specialties.find((s) => s.id === id);
        return specialty?.name || "-";
      },
    },
    {
      title: "Phòng",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa bác sĩ này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quản lý Bác sĩ</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm bác sĩ
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={doctors}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={editingId ? "Sửa bác sĩ" : "Thêm bác sĩ"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
            <Form.Item name="title" label="Chức danh">
              <Select placeholder="Chọn chức danh">
                <Select.Option value="TS. BS">TS. BS</Select.Option>
                <Select.Option value="Ths. BS">Ths. BS</Select.Option>
                <Select.Option value="BSCK II">BSCK II</Select.Option>
                <Select.Option value="BSNT">BSNT</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="specialtyId"
              label="Chuyên khoa"
              rules={[{ required: true, message: "Vui lòng chọn chuyên khoa" }]}
            >
              <Select 
                placeholder="Chọn chuyên khoa"
                onChange={(value) => {
                  // Reset roomId khi thay đổi specialty
                  form.setFieldsValue({ roomId: undefined });
                }}
              >
                {specialties.map((s) => (
                  <Select.Option key={s.id} value={s.id}>
                    {s.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item 
              name="roomId" 
              label="Phòng" 
              rules={[{ required: true, message: "Vui lòng chọn phòng" }]}
              dependencies={['specialtyId']}
            >
              <Select
                placeholder={selectedSpecialtyId ? "Chọn phòng" : "Vui lòng chọn chuyên khoa trước"}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                disabled={!selectedSpecialtyId}
                options={availableRooms}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
}

