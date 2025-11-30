"use client";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Bệnh viện Bạch Mai</h3>
            <p className="text-gray-300">
              Hệ thống đặt lịch khám chữa bệnh trực tuyến
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <p className="text-gray-300">Hotline: 1900 1234</p>
            <p className="text-gray-300">Email: support@bachmai.vn</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Giờ làm việc</h4>
            <p className="text-gray-300">Thứ 2 - Chủ nhật: 7:00 - 17:00</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2025 Bệnh viện Bạch Mai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

