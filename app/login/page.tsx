"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginAction } from "@/redux/modules/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isPending, currentUser } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (currentUser) {
      router.push("/home");
    }
  }, [currentUser, router]);

  const onFinish = (values: { phoneOrEmail: string; password: string }) => {
    dispatch(loginAction({ values }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Đăng nhập</h1>
          <p className="text-gray-600">Đăng nhập để tiếp tục</p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="phoneOrEmail"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại hoặc email" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Số điện thoại hoặc Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <span className="text-gray-600">Chưa có tài khoản? </span>
          <Link href="/register" className="text-primary font-semibold">
            Đăng ký ngay
          </Link>
        </div>
      </Card>
    </div>
  );
}

