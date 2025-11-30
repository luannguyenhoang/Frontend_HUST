"use client";

import { useEffect } from "react";
import AdminLayout from "@/components/templates/AdminLayout";
import { Table, Tag } from "antd";
import dayjs from "dayjs";

export default function AdminUsersPage() {
  // TODO: Fetch users from API
  const users: any[] = [];

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
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "admin" ? "red" : "blue"}>{role}</Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Quản lý Người dùng</h1>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>
    </AdminLayout>
  );
}

