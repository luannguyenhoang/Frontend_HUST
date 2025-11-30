"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/templates/AdminLayout";
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchSpecialtiesAction, fetchBuildingsAction, createSpecialtyAction, updateSpecialtyAction } from "@/redux/modules";

export default function AdminSpecialtiesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { specialties } = useAppSelector((state) => state.specialty);
  const { buildings } = useAppSelector((state) => state.building);

  useEffect(() => {
    dispatch(fetchSpecialtiesAction({}));
    dispatch(fetchBuildingsAction({}));
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
      symptoms: Array.isArray(record.symptoms) ? record.symptoms.join(", ") : record.symptoms,
      buildingId: record.buildingId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      // TODO: Implement delete API
      message.success("Xóa chuyên khoa thành công");
      dispatch(fetchSpecialtiesAction({}));
    } catch (error) {
      message.error("Xóa chuyên khoa thất bại");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        name: values.name,
        description: values.description,
        symptoms: values.symptoms,
        buildingId: values.buildingId,
      };

      if (editingId) {
        dispatch(updateSpecialtyAction({ id: editingId, data: submitData }));
      } else {
        dispatch(createSpecialtyAction({ data: submitData }));
      }
      setIsModalOpen(false);
      form.resetFields();
      setTimeout(() => {
        dispatch(fetchSpecialtiesAction({}));
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
      title: "Tên chuyên khoa",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Triệu chứng",
      dataIndex: "symptoms",
      key: "symptoms",
      render: (symptoms: string[]) => symptoms?.join(", ") || "-",
      ellipsis: true,
    },
    {
      title: "Tòa nhà",
      dataIndex: "building",
      key: "building",
      render: (building: string) => building || "-",
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
            title="Xóa chuyên khoa này?"
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
          <h1 className="text-3xl font-bold">Quản lý Chuyên khoa</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm chuyên khoa
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={specialties}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={editingId ? "Sửa chuyên khoa" : "Thêm chuyên khoa"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="Tên chuyên khoa"
              rules={[{ required: true, message: "Vui lòng nhập tên chuyên khoa" }]}
            >
              <Input placeholder="Nhập tên chuyên khoa" />
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={3} placeholder="Nhập mô tả" />
            </Form.Item>
            <Form.Item name="symptoms" label="Triệu chứng (cách nhau bởi dấu phẩy)">
              <Input.TextArea
                rows={3}
                placeholder="Ví dụ: Đau đầu, Sốt, Ho"
              />
            </Form.Item>
            <Form.Item name="buildingId" label="Tòa nhà">
              <Select placeholder="Chọn tòa nhà" allowClear>
                {buildings.map((building) => (
                  <Select.Option key={building.id} value={building.id}>
                    {building.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
}

