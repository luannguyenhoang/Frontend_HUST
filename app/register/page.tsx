"use client";

import { Form, Input, Button, Card, DatePicker, Select } from "antd";
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { useAppDispatch } from "@/redux/hooks";
import { registerAction } from "@/redux/modules/auth";
import Link from "next/link";
import dayjs from "dayjs";

export default function RegisterPage() {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();

  const onFinish = (values: any) => {
    const formattedValues = {
      ...values,
      dateOfBirth: values.dateOfBirth
        ? dayjs(values.dateOfBirth).format("YYYY-MM-DD")
        : undefined,
    };
    dispatch(registerAction({ values: formattedValues, clearForm: () => form.resetFields() }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Đăng ký tài khoản</h1>
          <p className="text-gray-600">Tạo tài khoản để đặt lịch khám</p>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: "email", message: "Email không hợp lệ" }]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email (tùy chọn)" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="dateOfBirth" label="Ngày sinh">
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item name="gender" label="Giới tính">
              <Select placeholder="Chọn giới tính">
                <Select.Option value="male">Nam</Select.Option>
                <Select.Option value="female">Nữ</Select.Option>
                <Select.Option value="other">Khác</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={2} placeholder="Địa chỉ" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <span className="text-gray-600">Đã có tài khoản? </span>
          <Link href="/login" className="text-primary font-semibold">
            Đăng nhập ngay
          </Link>
        </div>
      </Card>
    </div>
  );
}

