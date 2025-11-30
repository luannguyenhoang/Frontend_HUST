"use client";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logoutAction } from "@/redux/modules/auth";
import { Button, Dropdown, Space } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { REFRESH_TOKEN } from "@/utils/server";

export default function HeaderMain() {
  const { currentUser } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    const refreshToken = Cookies.get(REFRESH_TOKEN);
    if (refreshToken) {
      dispatch(logoutAction({ refreshToken }));
    } else {
      router.push("/login");
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      label: <Link href="/profile">Thông tin cá nhân</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "bookings",
      label: <Link href="/bookings">Lịch hẹn của tôi</Link>,
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/home" className="text-2xl font-bold text-primary">
            Bệnh viện Bạch Mai
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/home" className="hover:text-primary">
              Trang chủ
            </Link>
            <Link href="/booking" className="hover:text-primary">
              Đặt lịch khám
            </Link>

            {currentUser ? (
              <Space>
                {currentUser.role === "admin" && (
                  <Link href="/admin">
                    <Button type="default">Admin</Button>
                  </Link>
                )}
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                  <Button type="text" icon={<UserOutlined />}>
                    {currentUser.fullName || currentUser.phone}
                  </Button>
                </Dropdown>
              </Space>
            ) : (
              <Space>
                <Link href="/login">
                  <Button>Đăng nhập</Button>
                </Link>
                <Link href="/register">
                  <Button type="primary">Đăng ký</Button>
                </Link>
              </Space>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

