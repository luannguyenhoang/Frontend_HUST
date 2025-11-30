"use client";

import DefaultLayout from "@/components/templates/DefaultLayout";
import { Card, Row, Col, Button } from "antd";
import { CalendarOutlined, UserOutlined, FileTextOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function HomePage() {
  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Bệnh viện Bạch Mai</h1>
          <p className="text-xl text-gray-600">
            Đặt lịch khám chữa bệnh trực tuyến nhanh chóng và tiện lợi
          </p>
        </div>

        <Row gutter={[24, 24]} className="mb-12">
          <Col xs={24} sm={12} md={8}>
            <Card
              hoverable
              className="text-center h-full"
              cover={
                <div className="p-8 bg-blue-50">
                  <CalendarOutlined className="text-6xl text-blue-500" />
                </div>
              }
            >
              <Card.Meta
                title="Đặt lịch khám"
                description="Đặt lịch khám với bác sĩ theo chuyên khoa"
              />
              <Link href="/booking">
                <Button type="primary" className="mt-4" block>
                  Đặt lịch ngay
                </Button>
              </Link>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              hoverable
              className="text-center h-full"
              cover={
                <div className="p-8 bg-green-50">
                  <FileTextOutlined className="text-6xl text-green-500" />
                </div>
              }
            >
              <Card.Meta
                title="Lịch hẹn của tôi"
                description="Xem và quản lý các lịch hẹn đã đặt"
              />
              <Link href="/bookings">
                <Button type="primary" className="mt-4" block>
                  Xem lịch hẹn
                </Button>
              </Link>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              hoverable
              className="text-center h-full"
              cover={
                <div className="p-8 bg-purple-50">
                  <UserOutlined className="text-6xl text-purple-500" />
                </div>
              }
            >
              <Card.Meta
                title="Thành viên gia đình"
                description="Quản lý thông tin thành viên trong gia đình"
              />
              <Link href="/family-members">
                <Button type="primary" className="mt-4" block>
                  Quản lý thành viên
                </Button>
              </Link>
            </Card>
          </Col>
        </Row>
      </div>
    </DefaultLayout>
  );
}

