"use client";

import { ReactNode, useState } from "react";
import { Layout, Menu, Button, Dropdown, Avatar } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logoutAction } from "@/redux/modules/auth";
import Cookies from "js-cookie";
import { REFRESH_TOKEN } from "@/utils/server";
import Link from "next/link";

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    const refreshToken = Cookies.get(REFRESH_TOKEN);
    if (refreshToken) {
      dispatch(logoutAction({ refreshToken }));
    } else {
      router.push("/login");
    }
  };

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: <Link href="/admin">Dashboard</Link>,
    },
    {
      key: "/admin/specialties",
      icon: <MedicineBoxOutlined />,
      label: <Link href="/admin/specialties">Chuyên khoa</Link>,
    },
    {
      key: "/admin/doctors",
      icon: <UserOutlined />,
      label: <Link href="/admin/doctors">Bác sĩ</Link>,
    },
    {
      key: "/admin/appointments",
      icon: <CalendarOutlined />,
      label: <Link href="/admin/appointments">Lịch khám</Link>,
    },
    {
      key: "/admin/rooms",
      icon: <MedicineBoxOutlined />,
      label: <Link href="/admin/rooms">Phòng & Tòa nhà</Link>,
    },
    {
      key: "/admin/bookings",
      icon: <FileTextOutlined />,
      label: <Link href="/admin/bookings">Đặt lịch</Link>,
    },
    {
      key: "/admin/users",
      icon: <TeamOutlined />,
      label: <Link href="/admin/users">Người dùng</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      icon: <UserOutlined />,
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  if (currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không có quyền truy cập</h1>
          <p className="text-gray-600 mb-4">Bạn cần quyền admin để truy cập trang này</p>
          <Button type="primary" onClick={() => router.push("/home")}>
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Layout className="min-h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div className="h-16 flex items-center justify-center border-b">
          {!collapsed ? (
            <h1 className="text-xl font-bold text-green-600">Admin Panel</h1>
          ) : (
            <span className="text-green-600 font-bold">A</span>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="bg-white px-4 flex items-center justify-between shadow-sm">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {currentUser?.fullName || currentUser?.phone}
            </span>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar icon={<UserOutlined />} className="cursor-pointer" />
            </Dropdown>
          </div>
        </Header>
        <Content className="p-6 bg-gray-50 min-h-screen">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

