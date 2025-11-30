"use client";

import { useEffect, useState, useMemo } from "react";
import AdminLayout from "@/components/templates/AdminLayout";
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  message,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import {
  fetchAppointmentsAction,
  createAppointmentAction,
  updateAppointmentAction,
  deleteAppointmentAction,
} from "@/redux/modules";
import { fetchDoctorsAction, fetchSpecialtiesAction } from "@/redux/modules";
import dayjs from "dayjs";

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 7; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

import { GroupedAppointment } from "@/utils/api/appointment";

export default function AdminAppointmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDateGroup, setSelectedDateGroup] =
    useState<GroupedAppointment | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>(undefined);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [addTimeSlotForm] = Form.useForm();
  const [editingSlot, setEditingSlot] = useState<any>(null);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null); // Lưu ID riêng để đảm bảo không bị thay đổi
  const dispatch = useAppDispatch();
  const { appointments, page, isPending } = useAppSelector(
    (state) => state.appointment
  );
  const { doctors } = useAppSelector((state) => state.doctor);
  const { specialties } = useAppSelector((state) => state.specialty);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchAppointmentsAction({ 
      doctorId: selectedDoctorId,
      page: currentPage,
      size: pageSize
    }));
    dispatch(fetchDoctorsAction({}));
    dispatch(fetchSpecialtiesAction({}));
  }, [dispatch, selectedDoctorId, currentPage, pageSize]);

  // Backend đã group rồi, chỉ cần lấy từ page.content
  const groupedAppointments = useMemo(() => {
    return page?.content || [];
  }, [page]);

  useEffect(() => {
    if (selectedDateGroup && groupedAppointments.length > 0) {
      // Format date để so sánh đúng - normalize cả 2 bên
      const normalizeDate = (date: any): string => {
        if (!date) return '';
        if (typeof date === 'string') {
          // Xử lý cả YYYY-MM-DD và ISO string
          return date.split('T')[0].split(' ')[0];
        }
        if (date instanceof Date) {
          return dayjs(date).format("YYYY-MM-DD");
        }
        return dayjs(date).format("YYYY-MM-DD");
      };
      
      const selectedDate = normalizeDate(selectedDateGroup.date);
      
      const updatedGroup = groupedAppointments.find(
        (g) => {
          const groupDate = normalizeDate(g.date);
          const matches = groupDate === selectedDate && g.doctorId === selectedDateGroup.doctorId;
          return matches;
        }
      );
      
      if (updatedGroup) {
        // Sort appointments theo timeSlot
        const sortedAppointments = [...updatedGroup.appointments].sort((a, b) => 
          a.timeSlot.localeCompare(b.timeSlot)
        );
        const newGroup = {
          ...updatedGroup,
          appointments: sortedAppointments
        };
        setSelectedDateGroup(newGroup);
        
        // KHÔNG tự động cập nhật editingSlot sau khi refetch
        // Vì có thể đang edit appointment khác, và việc tự động cập nhật sẽ làm mất appointment đang edit
        // Chỉ reset nếu appointment không còn tồn tại
        if (editingSlot && selectedDateGroup) {
          const normalizeDate = (date: any): string => {
            if (!date) return '';
            if (typeof date === 'string') return date.split('T')[0].split(' ')[0];
            if (date instanceof Date) return dayjs(date).format("YYYY-MM-DD");
            return dayjs(date).format("YYYY-MM-DD");
          };
          
          const editingDate = normalizeDate(editingSlot.date);
          const groupDate = normalizeDate(selectedDateGroup.date);
          
          // Chỉ kiểm tra nếu đang edit appointment trong group hiện tại
          if (editingDate === groupDate && editingSlot.doctorId === selectedDateGroup.doctorId) {
            const updatedAppointment = sortedAppointments.find(apt => apt.id === editingSlot.id);
            if (!updatedAppointment) {
            // Nếu appointment không còn tồn tại, reset editingSlot
            console.log('Appointment', editingSlot.id, 'not found after refetch, resetting editingSlot');
            setEditingSlot(null);
            setEditingSlotId(null);
            editForm.resetFields();
            } else {
              // Giữ nguyên editingSlot, không cập nhật tự động
              console.log('Keeping editingSlot as is:', editingSlot.id);
            }
          }
        }
      } else {
        // Nếu không tìm thấy group trong page hiện tại, có thể nó ở page khác
        // Giữ nguyên selectedDateGroup để không mất data
        console.log('Group not found in current page, keeping selectedDateGroup');
      }
    }
  }, [groupedAppointments]);

  const handleAdd = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleViewDetail = (group: GroupedAppointment) => {
    console.log('=== VIEW DETAIL ===');
    console.log('Group Date:', group.date);
    console.log('Doctor ID:', group.doctorId);
    console.log('Doctor Name:', group.doctorName);
    console.log('Total Appointments:', group.appointments.length);
    console.log('Appointment IDs:', group.appointments.map(apt => apt.id));
    console.log('Appointments:', group.appointments.map(apt => ({ id: apt.id, timeSlot: apt.timeSlot, date: apt.date })));
    console.log('==================');
    // Reset editingSlot khi mở modal mới
    setEditingSlot(null);
    setEditingSlotId(null);
    editForm.resetFields();
    setSelectedDateGroup(group);
    setIsDetailModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const appointmentData = {
        doctorId: values.doctorId,
        specialtyId: values.specialtyId,
        date: dayjs(values.date).format("YYYY-MM-DD"),
        timeSlot: values.timeSlot,
        maxPatients: values.maxPatients || 20,
      };

      dispatch(createAppointmentAction({ data: appointmentData }));
      setIsModalOpen(false);
      form.resetFields();
      setTimeout(() => {
        dispatch(fetchAppointmentsAction({ 
          doctorId: selectedDoctorId,
          page: page?.number || 0,
          size: page?.size || 10
        } as any));
      }, 500);
    } catch (error: any) {
      message.error("Tạo lịch khám thất bại");
    }
  };

  const handleAddTimeSlot = async (values: any) => {
    if (!selectedDateGroup) {
      message.error("Không tìm thấy thông tin lịch khám");
      return;
    }

    if (!values.timeSlot) {
      message.error("Vui lòng chọn giờ khám");
      return;
    }

    try {
      // Format date giống như handleSubmit - dùng dayjs để đảm bảo nhất quán
      const dateStr = dayjs(selectedDateGroup.date).format("YYYY-MM-DD");
      
      const appointmentData = {
        doctorId: selectedDateGroup.doctorId,
        specialtyId: selectedDateGroup.specialtyId,
        date: dateStr,
        timeSlot: values.timeSlot.trim(), // Trim để đảm bảo không có khoảng trắng
        maxPatients: values.maxPatients || 20,
      };

      console.log('=== ADD TIME SLOT ===');
      console.log('Original date:', selectedDateGroup.date);
      console.log('Formatted date (using dayjs):', dateStr);
      console.log('Appointment Data:', appointmentData);
      console.log('Selected Date Group:', {
        date: selectedDateGroup.date,
        doctorId: selectedDateGroup.doctorId,
        specialtyId: selectedDateGroup.specialtyId
      });
      console.log('Available Time Slots:', availableTimeSlots);
      console.log('Time slot to add:', values.timeSlot);
      console.log('====================');

      dispatch(createAppointmentAction({ data: appointmentData }));
      addTimeSlotForm.resetFields();
      
      // Cập nhật local state ngay lập tức để UI responsive
      if (selectedDateGroup) {
        const newAppointment: any = {
          id: Date.now(), // Temporary ID
          doctorId: selectedDateGroup.doctorId,
          specialtyId: selectedDateGroup.specialtyId,
          date: dateStr,
          timeSlot: values.timeSlot,
          maxPatients: values.maxPatients || 20,
          currentPatients: 0,
          doctorName: selectedDateGroup.doctorName,
          doctorTitle: selectedDateGroup.doctorTitle,
          room: selectedDateGroup.room,
          building: selectedDateGroup.building,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const updatedGroup = {
          ...selectedDateGroup,
          appointments: [...selectedDateGroup.appointments, newAppointment],
          totalSlots: selectedDateGroup.totalSlots + 1,
          totalMaxPatients: selectedDateGroup.totalMaxPatients + (values.maxPatients || 20),
        };
        setSelectedDateGroup(updatedGroup);
      }
      
      // Refetch để sync với server - đảm bảo refetch đúng page chứa group này
      setTimeout(() => {
        dispatch(fetchAppointmentsAction({ 
          doctorId: selectedDoctorId,
          page: currentPage,
          size: pageSize
        } as any));
      }, 1000);
    } catch (error: any) {
      message.error("Thêm khung giờ thất bại");
    }
  };

  const handleEditSlot = (apt: any) => {
    console.log('=== EDIT SLOT ===');
    console.log('Appointment ID:', apt.id);
    console.log('Date:', apt.date);
    console.log('Time:', apt.timeSlot);
    console.log('MaxPatients:', apt.maxPatients);
    console.log('================');
    // Lưu ID vào state riêng ngay lập tức
    setEditingSlotId(apt.id);
    setEditingSlot(apt);
    editForm.setFieldsValue({ maxPatients: apt.maxPatients });
  };

  const handleUpdateSlot = async (values: any) => {
    // Dùng editingSlotId từ state, không phụ thuộc vào editingSlot object
    if (!editingSlotId) {
      console.error('No editingSlotId!');
      message.error("Lỗi: Không tìm thấy ID appointment để cập nhật!");
      return;
    }

    try {
      const maxPatients = Number(values.maxPatients);
      if (isNaN(maxPatients) || maxPatients < 1 || maxPatients > 50) {
        message.error("Số bệnh nhân phải từ 1 đến 50");
        return;
      }

      // Dùng editingSlotId từ state - đảm bảo không bị thay đổi
      const appointmentIdToUpdate = editingSlotId;
      
      console.log('=== UPDATE APPOINTMENT ===');
      console.log('EditingSlotId from state:', editingSlotId);
      console.log('EditingSlot object:', editingSlot ? JSON.stringify(editingSlot, null, 2) : 'null');
      console.log('Appointment ID to update:', appointmentIdToUpdate);
      console.log('MaxPatients:', maxPatients);
      console.log('SelectedDateGroup appointments:', selectedDateGroup?.appointments.map(apt => ({ id: apt.id, timeSlot: apt.timeSlot })));
      console.log('========================');
      
      // Kiểm tra xem appointment ID có tồn tại trong selectedDateGroup không
      if (selectedDateGroup) {
        const appointmentExists = selectedDateGroup.appointments.some(apt => apt.id === appointmentIdToUpdate);
        if (!appointmentExists) {
          console.error('ERROR: Appointment ID', appointmentIdToUpdate, 'not found in selectedDateGroup!');
          console.error('Available IDs:', selectedDateGroup.appointments.map(apt => apt.id));
          message.error(`Lỗi: Không tìm thấy appointment ID ${appointmentIdToUpdate} trong group này!`);
          return;
        }
      }

      dispatch(
        updateAppointmentAction({
          id: appointmentIdToUpdate,
          data: { maxPatients },
        })
      );
      
      // Cập nhật local state ngay lập tức
      if (selectedDateGroup) {
        const updatedAppointments = selectedDateGroup.appointments.map(apt =>
          apt.id === appointmentIdToUpdate
            ? { ...apt, maxPatients }
            : apt
        );
        const updatedGroup = {
          ...selectedDateGroup,
          appointments: updatedAppointments,
          totalMaxPatients: selectedDateGroup.totalMaxPatients - editingSlot.maxPatients + maxPatients,
        };
        setSelectedDateGroup(updatedGroup);
      }
      
      setEditingSlot(null);
      editForm.resetFields();
      
      setTimeout(() => {
        dispatch(fetchAppointmentsAction({ 
          doctorId: selectedDoctorId,
          page: currentPage,
          size: pageSize
        } as any));
      }, 500);
    } catch (error: any) {
      message.error("Cập nhật thất bại");
    }
  };

  const handleDeleteSlot = (id: number) => {
    // Cập nhật local state ngay lập tức để UI responsive
    if (selectedDateGroup) {
      const updatedGroup = {
        ...selectedDateGroup,
        appointments: selectedDateGroup.appointments.filter(
          (a) => a.id !== id
        ),
        totalSlots: selectedDateGroup.totalSlots - 1,
        totalMaxPatients: selectedDateGroup.totalMaxPatients - (selectedDateGroup.appointments.find(a => a.id === id)?.maxPatients || 0),
        totalPatients: selectedDateGroup.totalPatients - (selectedDateGroup.appointments.find(a => a.id === id)?.currentPatients || 0),
      };
      setSelectedDateGroup(updatedGroup);
    }
    // Dispatch action để xóa (chạy song song, không block)
    dispatch(deleteAppointmentAction({ id }));
    // Fetch lại data từ server sau một chút để đảm bảo sync
    setTimeout(() => {
      dispatch(fetchAppointmentsAction({ 
        doctorId: selectedDoctorId,
        page: page?.number || 0,
        size: page?.size || 20
      }));
    }, 500);
  };

  const columns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a: GroupedAppointment, b: GroupedAppointment) =>
        dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Bác sĩ",
      key: "doctor",
      render: (_: any, record: GroupedAppointment) => (
        <div>
          <div className="font-semibold">{record.doctorName}</div>
          {record.doctorTitle && (
            <div className="text-xs text-gray-500">{record.doctorTitle}</div>
          )}
        </div>
      ),
    },
    {
      title: "Phòng",
      key: "room",
      render: (_: any, record: GroupedAppointment) => (
        <div>
          <div>{record.room || "N/A"}</div>
          {record.building && (
            <div className="text-xs text-gray-500">{record.building}</div>
          )}
        </div>
      ),
    },
    {
      title: "Số khung giờ",
      dataIndex: "totalSlots",
      key: "totalSlots",
    },
    {
      title: "Tổng bệnh nhân",
      key: "patients",
      render: (_: any, record: GroupedAppointment) => (
        <span>
          {record.totalPatients}/{record.totalMaxPatients}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_: any, record: GroupedAppointment) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const availableTimeSlots = useMemo(() => {
    if (!selectedDateGroup) return timeSlots;
    const usedSlots = selectedDateGroup.appointments.map((a) => a.timeSlot);
    return timeSlots.filter((slot) => !usedSlots.includes(slot));
  }, [selectedDateGroup]);

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quản lý Lịch khám</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Tạo lịch khám
          </Button>
        </div>

        <div className="mb-4">
          <Select
            placeholder="Lọc theo bác sĩ"
            allowClear
            showSearch
            style={{ width: 300 }}
            value={selectedDoctorId}
            onChange={(value) => setSelectedDoctorId(value)}
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={doctors.map((d) => ({
              label: `${d.fullName}${d.title ? ` - ${d.title}` : ""}`,
              value: d.id,
            }))}
          />
        </div>

        <Table
          columns={columns}
          dataSource={groupedAppointments}
          rowKey={(record) => `${record.date}_${record.doctorId}`}
          loading={isPending}
          pagination={{
            current: (page?.number || 0) + 1,
            pageSize: page?.size || 10,
            total: page?.totalElements || 0,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhóm lịch khám`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (pageNum, sizeNum) => {
              setCurrentPage(pageNum - 1);
              setPageSize(sizeNum);
            },
          }}
          locale={{ emptyText: "Chưa có lịch khám nào" }}
        />

        <Modal
          title="Tạo lịch khám mới"
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
              name="specialtyId"
              label="Chuyên khoa"
              rules={[{ required: true, message: "Vui lòng chọn chuyên khoa" }]}
            >
              <Select
                placeholder="Chọn chuyên khoa"
                onChange={() => {
                  form.setFieldsValue({ doctorId: undefined });
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
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.specialtyId !== currentValues.specialtyId
              }
            >
              {({ getFieldValue }) => {
                const specialtyId = getFieldValue("specialtyId");
                const filteredDoctors = doctors.filter(
                  (d) => !specialtyId || d.specialtyId === specialtyId
                );

                return (
                  <Form.Item
                    name="doctorId"
                    label="Bác sĩ"
                    rules={[{ required: true, message: "Vui lòng chọn bác sĩ" }]}
                  >
                    <Select
                      placeholder="Chọn bác sĩ"
                      disabled={!specialtyId}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) => {
                        const children = option?.children;
                        const text = Array.isArray(children) ? children.join('') : String(children || '');
                        return text.toLowerCase().includes(input.toLowerCase());
                      }}
                    >
                      {filteredDoctors.map((d) => (
                        <Select.Option key={d.id} value={d.id}>
                          {d.fullName} - {d.title}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }}
            </Form.Item>

            <Form.Item
              name="date"
              label="Ngày khám"
              rules={[{ required: true, message: "Vui lòng chọn ngày khám" }]}
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>

            <Form.Item
              name="timeSlot"
              label="Giờ khám"
              rules={[{ required: true, message: "Vui lòng chọn giờ khám" }]}
            >
              <Select placeholder="Chọn giờ khám">
                {timeSlots.map((slot) => (
                  <Select.Option key={slot} value={slot}>
                    {slot}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="maxPatients"
              label="Số bệnh nhân tối đa"
              initialValue={20}
            >
              <Input type="number" min={1} max={50} />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={`Chi tiết lịch khám - ${selectedDateGroup ? dayjs(selectedDateGroup.date).format("DD/MM/YYYY") : ""}`}
          open={isDetailModalOpen}
          onCancel={() => {
            setIsDetailModalOpen(false);
            setSelectedDateGroup(null);
            setEditingSlot(null);
            setEditingSlotId(null);
            editForm.resetFields();
          }}
          footer={null}
          width={900}
        >
          {selectedDateGroup && (
            <div>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <Row gutter={16}>
                  <Col span={8}>
                    <div className="text-sm text-gray-500">Bác sĩ</div>
                    <div className="font-semibold">
                      {selectedDateGroup.doctorName}
                      {selectedDateGroup.doctorTitle &&
                        ` - ${selectedDateGroup.doctorTitle}`}
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="text-sm text-gray-500">Phòng</div>
                    <div className="font-semibold">
                      {selectedDateGroup.room || "N/A"}
                      {selectedDateGroup.building &&
                        ` - ${selectedDateGroup.building}`}
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="text-sm text-gray-500">Tổng bệnh nhân</div>
                    <div className="font-semibold">
                      {selectedDateGroup.totalPatients}/
                      {selectedDateGroup.totalMaxPatients}
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-3">Danh sách khung giờ</h3>
                <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                  {[...selectedDateGroup.appointments]
                    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                    .map((apt) => (
                      <Card
                        key={apt.id}
                        size="small"
                        className={`${
                          apt.currentPatients >= apt.maxPatients
                            ? "border-red-300 bg-red-50"
                            : "border-green-300 bg-green-50"
                        }`}
                        actions={[
                          <EditOutlined
                            key="edit"
                            onClick={() => {
                              console.log('Click edit on appointment:', apt.id, 'Date:', apt.date, 'Time:', apt.timeSlot);
                              handleEditSlot(apt);
                            }}
                            className="text-blue-500"
                          />,
                          <Popconfirm
                            key="delete"
                            title="Xóa khung giờ này?"
                            onConfirm={() => handleDeleteSlot(apt.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            disabled={apt.currentPatients > 0}
                          >
                            <DeleteOutlined
                              className={
                                apt.currentPatients > 0
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-red-500"
                              }
                            />
                          </Popconfirm>,
                        ]}
                      >
                        <div className="text-center">
                          <div className="font-semibold text-lg mb-1">
                            {apt.timeSlot}
                          </div>
                          <div className="text-xs text-gray-600">
                            {apt.currentPatients}/{apt.maxPatients} bệnh nhân
                          </div>
                          <Tag
                            color={
                              apt.currentPatients >= apt.maxPatients
                                ? "red"
                                : "green"
                            }
                            className="mt-1"
                          >
                            {apt.currentPatients >= apt.maxPatients
                              ? "Đầy"
                              : "Còn chỗ"}
                          </Tag>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>

              {editingSlot && (
                <Card title={`Sửa khung giờ - ID: ${editingSlot.id}`} className="mb-4">
                  <Form
                    form={editForm}
                    layout="inline"
                    onFinish={handleUpdateSlot}
                    className="flex items-end gap-2"
                  >
                    <Form.Item label="Giờ khám">
                      <Input value={editingSlot.timeSlot} disabled />
                    </Form.Item>
                    <Form.Item label="ID">
                      <Input value={editingSlot.id} disabled />
                    </Form.Item>
                    <Form.Item
                      name="maxPatients"
                      label="Số bệnh nhân tối đa"
                      rules={[
                        { required: true, message: "Vui lòng nhập số bệnh nhân" },
                        {
                          validator: (_, value) => {
                            const num = Number(value);
                            if (!value || isNaN(num)) {
                              return Promise.reject("Vui lòng nhập số hợp lệ");
                            }
                            if (num < 1 || num > 50) {
                              return Promise.reject("Số bệnh nhân phải từ 1 đến 50");
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                      getValueFromEvent={(e) => {
                        const value = e.target.value;
                        return value ? Number(value) : undefined;
                      }}
                    >
                      <Input type="number" min={1} max={50} />
                    </Form.Item>
                    <Form.Item>
                      <Space>
                        <Button type="primary" htmlType="submit">
                          Lưu
                        </Button>
                        <Button onClick={() => {
                          setEditingSlot(null);
                          setEditingSlotId(null);
                          editForm.resetFields();
                        }}>
                          Hủy
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Card>
              )}

              <Card title="Thêm khung giờ mới" className="mt-4">
                <Form
                  form={addTimeSlotForm}
                  layout="inline"
                  onFinish={(values) => {
                    handleAddTimeSlot(values);
                    addTimeSlotForm.resetFields();
                  }}
                  className="flex items-end gap-2"
                >
                  <Form.Item
                    name="timeSlot"
                    label="Giờ khám"
                    rules={[
                      { required: true, message: "Vui lòng chọn giờ khám" },
                    ]}
                    className="flex-1"
                  >
                    <Select
                      placeholder="Chọn giờ khám"
                      className="w-full"
                      showSearch
                    >
                      {availableTimeSlots.map((slot) => (
                        <Select.Option key={slot} value={slot}>
                          {slot}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="maxPatients"
                    label="Số bệnh nhân tối đa"
                    initialValue={20}
                    className="flex-1"
                  >
                    <Input type="number" min={1} max={50} />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Thêm
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
