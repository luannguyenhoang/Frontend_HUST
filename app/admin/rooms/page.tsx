"use client";

import { useEffect, useState, useMemo } from "react";
import AdminLayout from "@/components/templates/AdminLayout";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Space,
  Popconfirm,
  Select,
  Tag,
  Tabs,
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
  fetchRoomsAction,
  createRoomAction,
  updateRoomAction,
  deleteRoomAction,
} from "@/redux/modules/room";
import {
  fetchBuildingsAction,
  createBuildingAction,
  updateBuildingAction,
  deleteBuildingAction,
} from "@/redux/modules/building";
import { fetchSpecialtiesAction } from "@/redux/modules/specialty";
import { Room } from "@/utils/api/room";
import { Building } from "@/utils/api/building";

const { TextArea } = Input;

interface GroupedRoom {
  buildingId: number;
  buildingName: string;
  building?: Building;
  rooms: Room[];
  totalRooms: number;
}

export default function AdminRoomsPage() {
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBuildingGroup, setSelectedBuildingGroup] =
    useState<GroupedRoom | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editingBuildingId, setEditingBuildingId] = useState<number | null>(null);
  const [roomForm] = Form.useForm();
  const [buildingForm] = Form.useForm();
  const [addRoomForm] = Form.useForm();
  const dispatch = useAppDispatch();
  const { rooms, isPending: roomsPending } = useAppSelector((state) => state.room);
  const { buildings, isPending: buildingsPending } = useAppSelector((state) => state.building);
  const { specialties } = useAppSelector((state) => state.specialty);

  useEffect(() => {
    dispatch(fetchRoomsAction({}));
    dispatch(fetchBuildingsAction());
    dispatch(fetchSpecialtiesAction({}));
  }, [dispatch]);

  const groupedRooms = useMemo(() => {
    const groups: { [key: number]: GroupedRoom } = {};

    rooms.forEach((room) => {
      const buildingId = room.buildingId || 0;
      if (!groups[buildingId]) {
        const building = buildings.find((b) => b.id === buildingId);
        groups[buildingId] = {
          buildingId,
          buildingName: room.building || building?.name || "Chưa có tòa nhà",
          building,
          rooms: [],
          totalRooms: 0,
        };
      }
      groups[buildingId].rooms.push(room);
      groups[buildingId].totalRooms += 1;
    });

    return Object.values(groups).sort((a, b) =>
      a.buildingName.localeCompare(b.buildingName)
    );
  }, [rooms, buildings]);

  useEffect(() => {
    if (selectedBuildingGroup && rooms.length > 0) {
      const updatedGroup = groupedRooms.find(
        (g) => g.buildingId === selectedBuildingGroup.buildingId
      );
      if (updatedGroup) {
        setSelectedBuildingGroup(updatedGroup);
      }
    }
  }, [rooms, groupedRooms, selectedBuildingGroup]);

  // Room handlers
  const handleAddRoom = () => {
    setEditingRoomId(null);
    roomForm.resetFields();
    setIsRoomModalOpen(true);
  };

  const handleViewDetail = (group: GroupedRoom) => {
    setSelectedBuildingGroup(group);
    setIsDetailModalOpen(true);
  };

  const handleEditRoom = (record: Room) => {
    setEditingRoomId(record.id);
    roomForm.setFieldsValue({
      roomNumber: record.roomNumber,
      buildingId: record.buildingId,
      specialtyId: record.specialtyId,
      floor: record.floor,
      capacity: record.capacity,
      description: record.description,
    });
    setIsRoomModalOpen(true);
  };

  const handleEditRoomInDetail = (record: Room) => {
    setEditingRoomId(record.id);
    roomForm.setFieldsValue({
      roomNumber: record.roomNumber,
      buildingId: record.buildingId,
      specialtyId: record.specialtyId,
      floor: record.floor,
      capacity: record.capacity,
      description: record.description,
    });
  };

  const handleDeleteRoom = async (id: number) => {
    try {
      dispatch(deleteRoomAction({ id }));
      setTimeout(() => {
        dispatch(fetchRoomsAction({}));
      }, 500);
    } catch (error: any) {
      message.error("Xóa phòng thất bại");
    }
  };

  const handleSubmitRoom = async (values: any) => {
    try {
      if (editingRoomId) {
        dispatch(
          updateRoomAction({
            id: editingRoomId,
            data: values,
          })
        );
      } else {
        dispatch(createRoomAction({ data: values }));
      }
      setIsRoomModalOpen(false);
      roomForm.resetFields();
      setEditingRoomId(null);
      setTimeout(() => {
        dispatch(fetchRoomsAction({}));
      }, 500);
    } catch (error: any) {
      message.error("Thao tác thất bại");
    }
  };

  const handleAddRoomInDetail = async (values: any) => {
    if (!selectedBuildingGroup) return;

    try {
      dispatch(
        createRoomAction({
          data: {
            ...values,
            buildingId: selectedBuildingGroup.buildingId,
          },
        })
      );
      addRoomForm.resetFields();
      setTimeout(() => {
        dispatch(fetchRoomsAction({}));
      }, 500);
    } catch (error: any) {
      message.error("Thêm phòng thất bại");
    }
  };

  // Building handlers
  const handleAddBuilding = () => {
    setEditingBuildingId(null);
    buildingForm.resetFields();
    setIsBuildingModalOpen(true);
  };

  const handleEditBuilding = (record: Building) => {
    setEditingBuildingId(record.id);
    buildingForm.setFieldsValue({
      name: record.name,
      address: record.address,
      description: record.description,
      floors: record.floors,
    });
    setIsBuildingModalOpen(true);
  };

  const handleDeleteBuilding = async (id: number) => {
    try {
      dispatch(deleteBuildingAction({ id }));
      setTimeout(() => {
        dispatch(fetchBuildingsAction());
        dispatch(fetchRoomsAction({}));
      }, 500);
    } catch (error: any) {
      message.error("Xóa tòa nhà thất bại");
    }
  };

  const handleSubmitBuilding = async (values: any) => {
    try {
      if (editingBuildingId) {
        dispatch(
          updateBuildingAction({
            id: editingBuildingId,
            data: values,
          })
        );
      } else {
        dispatch(createBuildingAction({ data: values }));
      }
      setIsBuildingModalOpen(false);
      buildingForm.resetFields();
      setTimeout(() => {
        dispatch(fetchBuildingsAction());
        dispatch(fetchRoomsAction({}));
      }, 500);
    } catch (error: any) {
      message.error("Thao tác thất bại");
    }
  };

  const roomColumns = [
    {
      title: "Tòa nhà",
      key: "building",
      render: (_: any, record: GroupedRoom) => (
        <div>
          <div className="font-semibold">{record.buildingName}</div>
          {record.building?.address && (
            <div className="text-xs text-gray-500">{record.building.address}</div>
          )}
        </div>
      ),
    },
    {
      title: "Số phòng",
      dataIndex: "totalRooms",
      key: "totalRooms",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_: any, record: GroupedRoom) => (
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

  const buildingColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Tên tòa nhà",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
    },
    {
      title: "Số tầng",
      dataIndex: "floors",
      key: "floors",
      render: (floors: number) => floors || "-",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_: any, record: Building) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditBuilding(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa tòa nhà này?"
            onConfirm={() => handleDeleteBuilding(record.id)}
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
          <h1 className="text-3xl font-bold">Quản lý Phòng & Tòa nhà</h1>
          <Space>
            <Button type="default" icon={<PlusOutlined />} onClick={handleAddBuilding}>
              Thêm tòa nhà
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRoom}>
              Thêm phòng
            </Button>
          </Space>
        </div>

        <Table
          columns={roomColumns}
          dataSource={groupedRooms}
          rowKey="buildingId"
          loading={roomsPending}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "Chưa có phòng nào" }}
        />

        <Modal
          title={editingRoomId ? "Sửa phòng" : "Thêm phòng"}
          open={isRoomModalOpen}
          onCancel={() => {
            setIsRoomModalOpen(false);
            roomForm.resetFields();
          }}
          onOk={() => roomForm.submit()}
          width={600}
        >
          <Form form={roomForm} layout="vertical" onFinish={handleSubmitRoom}>
            <Form.Item
              name="roomNumber"
              label="Số phòng"
              rules={[{ required: true, message: "Vui lòng nhập số phòng" }]}
            >
              <Input placeholder="Ví dụ: P.428" />
            </Form.Item>

            <Form.Item
              name="buildingId"
              label="Tòa nhà"
              rules={[{ required: true, message: "Vui lòng chọn tòa nhà" }]}
            >
              <Select
                placeholder="Chọn tòa nhà"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={buildings.map((b) => ({ label: b.name, value: b.id }))}
              />
            </Form.Item>

            <Form.Item name="floor" label="Tầng">
              <InputNumber
                min={0}
                max={50}
                placeholder="Ví dụ: 4"
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              name="capacity"
              label="Sức chứa"
              initialValue={1}
            >
              <InputNumber
                min={1}
                max={100}
                placeholder="Số người tối đa"
                className="w-full"
              />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
              <TextArea rows={3} placeholder="Mô tả về phòng..." />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={editingBuildingId ? "Sửa tòa nhà" : "Thêm tòa nhà"}
          open={isBuildingModalOpen}
          onCancel={() => {
            setIsBuildingModalOpen(false);
            buildingForm.resetFields();
          }}
          onOk={() => buildingForm.submit()}
          width={600}
        >
          <Form form={buildingForm} layout="vertical" onFinish={handleSubmitBuilding}>
            <Form.Item
              name="name"
              label="Tên tòa nhà"
              rules={[{ required: true, message: "Vui lòng nhập tên tòa nhà" }]}
            >
              <Input placeholder="Ví dụ: Nhà K1" />
            </Form.Item>

            <Form.Item name="address" label="Địa chỉ">
              <Input placeholder="Nhập địa chỉ tòa nhà" />
            </Form.Item>

            <Form.Item name="floors" label="Số tầng">
              <InputNumber
                min={1}
                max={50}
                placeholder="Ví dụ: 10"
                className="w-full"
              />
            </Form.Item>

            <Form.Item name="description" label="Mô tả">
              <TextArea rows={3} placeholder="Mô tả về tòa nhà..." />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={`Chi tiết phòng - ${selectedBuildingGroup?.buildingName || ""}`}
          open={isDetailModalOpen}
          onCancel={() => {
            setIsDetailModalOpen(false);
            setSelectedBuildingGroup(null);
            setEditingRoomId(null);
            roomForm.resetFields();
            addRoomForm.resetFields();
          }}
          footer={null}
          width={900}
        >
          {selectedBuildingGroup && (
            <div>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <Row gutter={16}>
                  <Col span={8}>
                    <div className="text-sm text-gray-500">Tòa nhà</div>
                    <div className="font-semibold">
                      {selectedBuildingGroup.buildingName}
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="text-sm text-gray-500">Địa chỉ</div>
                    <div className="font-semibold">
                      {selectedBuildingGroup.building?.address || "N/A"}
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="text-sm text-gray-500">Tổng số phòng</div>
                    <div className="font-semibold">
                      {selectedBuildingGroup.totalRooms}
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-3">Danh sách phòng</h3>
                <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                  {selectedBuildingGroup.rooms
                    .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
                    .map((room) => (
                      <Card
                        key={room.id}
                        size="small"
                        className="border-blue-300 bg-blue-50"
                        actions={[
                          <EditOutlined
                            key="edit"
                            onClick={() => handleEditRoomInDetail(room)}
                            className="text-blue-500"
                          />,
                          <Popconfirm
                            key="delete"
                            title="Xóa phòng này?"
                            onConfirm={() => {
                              handleDeleteRoom(room.id);
                              setTimeout(() => {
                                dispatch(fetchRoomsAction({}));
                              }, 500);
                            }}
                            okText="Xóa"
                            cancelText="Hủy"
                          >
                            <DeleteOutlined className="text-red-500" />
                          </Popconfirm>,
                        ]}
                      >
                        <div className="text-center">
                          <div className="font-semibold text-lg mb-1">
                            {room.roomNumber}
                          </div>
                          {room.floor && (
                            <div className="text-xs text-gray-600 mb-1">
                              Tầng {room.floor}
                            </div>
                          )}
                          {room.capacity && (
                            <div className="text-xs text-gray-600 mb-1">
                              Sức chứa: {room.capacity}
                            </div>
                          )}
                          {room.description && (
                            <div className="text-xs text-gray-500 mt-1 truncate">
                              {room.description}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                </div>
              </div>

              {editingRoomId && (
                <Card title="Sửa phòng" className="mb-4">
                  <Form
                    form={roomForm}
                    layout="vertical"
                    onFinish={(values) => {
                      handleSubmitRoom(values);
                      setEditingRoomId(null);
                    }}
                  >
                    <Form.Item
                      name="roomNumber"
                      label="Số phòng"
                      rules={[
                        { required: true, message: "Vui lòng nhập số phòng" },
                      ]}
                    >
                      <Input placeholder="Ví dụ: P.428" />
                    </Form.Item>

                    <Form.Item name="specialtyId" label="Chuyên khoa">
                      <Select
                        placeholder="Chọn chuyên khoa"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                        options={specialties.map((s) => ({ label: s.name, value: s.id }))}
                      />
                    </Form.Item>

                    <Form.Item name="floor" label="Tầng">
                      <InputNumber
                        min={0}
                        max={50}
                        placeholder="Ví dụ: 4"
                        className="w-full"
                      />
                    </Form.Item>

                    <Form.Item
                      name="capacity"
                      label="Sức chứa"
                      initialValue={1}
                    >
                      <InputNumber
                        min={1}
                        max={100}
                        placeholder="Số người tối đa"
                        className="w-full"
                      />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                      <TextArea rows={3} placeholder="Mô tả về phòng..." />
                    </Form.Item>

                    <Form.Item>
                      <Space>
                        <Button type="primary" htmlType="submit">
                          Lưu
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingRoomId(null);
                            roomForm.resetFields();
                          }}
                        >
                          Hủy
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Card>
              )}

              <Card title="Thêm phòng mới" className="mt-4">
                <Form
                  form={addRoomForm}
                  layout="vertical"
                  onFinish={handleAddRoomInDetail}
                >
                  <Form.Item
                    name="roomNumber"
                    label="Số phòng"
                    rules={[
                      { required: true, message: "Vui lòng nhập số phòng" },
                    ]}
                  >
                    <Input placeholder="Ví dụ: P.428" />
                  </Form.Item>

                  <Form.Item name="specialtyId" label="Chuyên khoa">
                    <Select
                      placeholder="Chọn chuyên khoa"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                      }
                      options={specialties.map((s) => ({ label: s.name, value: s.id }))}
                    />
                  </Form.Item>

                  <Form.Item name="floor" label="Tầng">
                    <InputNumber
                      min={0}
                      max={50}
                      placeholder="Ví dụ: 4"
                      className="w-full"
                    />
                  </Form.Item>

                  <Form.Item
                    name="capacity"
                    label="Sức chứa"
                    initialValue={1}
                  >
                    <InputNumber
                      min={1}
                      max={100}
                      placeholder="Số người tối đa"
                      className="w-full"
                    />
                  </Form.Item>

                  <Form.Item name="description" label="Mô tả">
                    <TextArea rows={3} placeholder="Mô tả về phòng..." />
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

