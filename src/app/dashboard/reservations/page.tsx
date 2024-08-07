"use client";
import { Fragment, useEffect, useState } from "react";
import isAuth from "../../../../components/isAuth";
import {
  Button,
  DatePicker,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  TableColumnsType,
  Tabs,
  TabsProps,
  message,
} from "antd";
import { isMobile } from "react-device-detect";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GetReq, PatchReq, PostReq } from "@/app/api/api";
import { StatusSuccessCodes } from "@/app/api/successStatus";
import { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";
import { FiMinusCircle } from "react-icons/fi";

function ReservationsPage() {
  const columns: TableColumnsType<any> = [
    {
      title: "Client's Name",
      dataIndex: ["user", "name"],
      key: "ClientName",
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
    },
    {
      title: "Mobile",
      dataIndex: ["user", "mobile"],
      key: "mobile",
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "createdBy",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];
  const carResColumns: TableColumnsType<any> = [
    {
      title: "Client's Name",
      dataIndex: ["user", "name"],
      key: "ClientName",
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
    },
    {
      title: "Mobile",
      dataIndex: ["user", "mobile"],
      key: "mobile",
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "createdBy",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];
  const hotelResColumns: TableColumnsType<any> = [
    {
      title: "Client's Name",
      dataIndex: ["user", "name"],
      key: "ClientName",
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
    },
    {
      title: "Mobile",
      dataIndex: ["user", "mobile"],
      key: "mobile",
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "createdBy",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const { replace } = useRouter();
  const pathname = usePathname();
  const [searchForm] = Form.useForm();
  const [AddEditReservationForm] = Form.useForm();
  const [addHotelReservationForm] = Form.useForm();
  const [addCarReservationForm] = Form.useForm();

  const [messageApi, contextHolder] = message.useMessage();

  const [reservationsList, setReservationsList] = useState<any[]>([]);
  const [reservationsCount, setReservationsCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [addEditImagesOpen, setAddEditImagesOpen] = useState<any>(false);
  const [carSubOptionType, setCarSubOptionType] = useState<any>(undefined);

  const [postEditRequestLoading, setPostEditRequestLoading] =
    useState<any>(false);
  const [addEditModalOpen, setAddEditModalOpen] = useState<any>(false);
  const [addCarReservationModalOpen, setAddCarReservationModalOpen] =
    useState<any>(false);
  const [addHotelReservationModalOpen, setAddHotelReservationModalOpen] =
    useState<any>(false);
  const [isEdit, setIsEdit] = useState<any>(false);
  const [recordId, setRecordId] = useState<number | undefined>(undefined);
  const [carServicesDropDown, setCarServicesDropDown] = useState<any>([]);
  const [usersDropDown, setUsersDropDown] = useState<any>([]);
  const [subOptDropDown, setSubOptDropDown] = useState<any>([]);
  const [carServiceOptionsDropDown, setCarServiceOptionsDropDown] =
    useState<any>([]);
  const [hotelServicesDropDown, setHotelServicesDropDown] = useState<any>([]);
  useEffect(() => {
    getReservationsList();
    hotelServicesSearch();
    carServicesSearch();
    getCarServiceOptions();
    usersSearch();
  }, []);
  const [loadReservationsList, setLoadReservationsList] = useState<any>(false);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Cars Reservations",
      children: <Table columns={carResColumns} />,
    },
    {
      key: "2",
      label: "Hotels Reservations",
      children: <Table columns={hotelResColumns} />,
    },
  ];
  function getReservationsList(page: number = 1, pageSize: number = 10) {
    setCurrentPage(page);
    let url = `reservations/?limit=${pageSize}&offset=${(page - 1) * pageSize}`;
    params.forEach((value: any, key: any) => (url += `&${key}=${value}`));
    setLoadReservationsList(true);
    GetReq(url).then((res) => {
      setLoadReservationsList(false);
      if (StatusSuccessCodes.includes(res.status)) {
        setReservationsList(res.data.results);
        setReservationsCount(res.data.count);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }
  function closeAddCarReservation() {
    setAddCarReservationModalOpen(false);
  }

  function closeAddHotelReservation() {
    setAddHotelReservationModalOpen(false);
  }

  function applySearch(values: any) {
    if (values.search) {
      params.set("search", values.search);
    } else {
      params.delete("search");
    }

    replace(`${pathname}?${params.toString()}`);
    getReservationsList();
  }

  const onSearchReset = () => {
    searchForm.resetFields();
    params.has("search") && params.delete("search");
    replace(`${pathname}`);
    getReservationsList();
  };

  function openAddEditModel(record?: any) {
    setAddEditModalOpen(true);
    record.id ? setIsEdit(true) : setIsEdit(false);
    setRecordId(record?.id);
    record.id ? AddEditReservationForm.setFieldsValue(record) : null;
  }

  function handleCancel() {
    setAddEditModalOpen(false);
    AddEditReservationForm.resetFields();
    setAddEditImagesOpen(false);
    setAddCarReservationModalOpen(false);
    setAddHotelReservationModalOpen(false);
  }

  function addEditReservation(values: any) {
    // const data = new FormData();
    // for (const key in values) {
    //   if (key === "image" && typeof values[key] === "string") {
    //     continue;
    //   } else {
    //     data.append(`${key}`, values[key]);
    //   }
    // }
    // setPostEditRequestLoading(true);
    // isEdit
    //   ? PatchReq(`reservations/${recordId}/`, data).then((res) => {
    //       setPostEditRequestLoading(false);
    //       if (StatusSuccessCodes.includes(res.status)) {
    //         messageApi.success("Reservation Updated Successfully");
    //         handleCancel();
    //         getReservationsList();
    //       } else {
    //         res?.errors.forEach((err: any) => {
    //           messageApi.error(
    //             `${err.attr ? err.attr + ":" + err.detail : err.detail} `
    //           );
    //         });
    //       }
    //     })
    //   : PostReq(`reservations/`, data).then((res) => {
    //       setPostEditRequestLoading(false);
    //       if (StatusSuccessCodes.includes(res.status)) {
    //         messageApi.success("Reservation Added Successfully");
    //         handleCancel();
    //         getReservationsList();
    //       } else {
    //         res?.errors.forEach((err: any) => {
    //           messageApi.error(
    //             `${err.attr ? err.attr + ":" + err.detail : err.detail} `
    //           );
    //         });
    //       }
    //     });
  }

  const disabledDate: RangePickerProps["disabledDate"] = (current) => {
    return current < dayjs().startOf("day");
  };
  function addCarReservation() {
    setAddCarReservationModalOpen(true);
  }
  function addHotelReservation() {
    setAddHotelReservationModalOpen(true);
  }
  function hotelServicesSearch(search?: any) {
    let url = `hotel-services/?limit=${9999}`;
    search ? (url += `&search=${search}`) : null;
    GetReq(url).then((res) => {
      if (StatusSuccessCodes.includes(res.status)) {
        let list: any = [];
        res.data.results.map((rec: any) => {
          list.push({
            label: rec.name,
            value: rec.id,
            key: rec.id,
            title: +rec.day_price,
          });
        });
        setHotelServicesDropDown(list);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }
  function onHotelServiceSearch(value: any) {
    hotelServicesSearch(value);
  }

  function carServicesSearch(search?: any) {
    let url = `car-services/?limit=${9999}`;
    search ? (url += `&search=${search}`) : null;
    GetReq(url).then((res) => {
      if (StatusSuccessCodes.includes(res.status)) {
        let list: any = [];
        res.data.results.map((rec: any) => {
          list.push({
            label: rec.model,
            value: rec.id,
            key: rec.id,
          });
        });
        setCarServicesDropDown(list);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }
  function usersSearch(search?: any) {
    let url = `user/profile/?limit=${9999}`;
    search ? (url += `&search=${search}`) : null;
    GetReq(url).then((res) => {
      if (StatusSuccessCodes.includes(res.status)) {
        let list: any = [];
        res.data.results.map((rec: any) => {
          list.push({
            label: rec.name,
            value: rec.id,
            key: rec.id,
          });
        });
        setUsersDropDown(list);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }
  function subOptServicesSearch(search?: any) {
    let url = `subscription-options/?limit=${9999}&car_service=${search}`;
    GetReq(url).then((res) => {
      if (StatusSuccessCodes.includes(res.status)) {
        let list: any = [];
        res.data.results.map((rec: any) => {
          list.push({
            label: rec.type + " " + rec.duration_hours + " Hr",
            value: rec.id,
            key: rec.id,
            title: rec.price,
            x: rec.price,
          });
        });
        setSubOptDropDown(list);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }

  function onCarServiceSearch(value: any) {
    carServicesSearch(value);
  }
  function onUserSearch(value: any) {
    carServicesSearch(value);
  }
  function onSubOptServiceSearch(value: any) {
    subOptServicesSearch(value);
  }

  function getCarServiceOptions() {
    let url = `service-options/?limit=99999&service_type=Car`;
    GetReq(url).then((res: any) => {
      if (StatusSuccessCodes.includes(res.status)) {
        let list: any = [];
        res.data.results.map((rec: any) => {
          list.push({
            label: rec.type + " " + rec.name,
            value: rec.id,
            key: rec.id,
            title: +rec.price,
          });
        });
        setCarServiceOptionsDropDown(list);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }

  return (
    <Fragment>
      {contextHolder}
      <div className="w-full h-fit bg-[#363B5E] py-8 px-5 flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row justify-between items-center content-center">
        <div className="flex flex-row flex-wrap gap-5 w-fit ">
          <h2 className="text-xl text-[white] font-semibold">Reservations</h2>
        </div>
        <Button
          style={{
            backgroundColor: "#363B5E",
            borderColor: "#F1DF78",
          }}
          className=" text-white"
          onClick={openAddEditModel}
        >
          Add New
        </Button>

        <Modal
          open={addEditModalOpen}
          title={isEdit ? "Edit Reservation" : "Add New Reservation"}
          onCancel={handleCancel}
          width={700}
          maskClosable={false}
          okButtonProps={{ style: { display: "none" } }}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <Form.Provider
            onFormFinish={(name, { values, forms }) => {
              if (name === "carReservationForm") {
                const { basicForm } = forms;
                const car_reservations =
                  basicForm.getFieldValue("car_reservations") || [];
                basicForm.setFieldsValue({
                  car_reservations: [...car_reservations, values],
                });
                setAddCarReservationModalOpen(false);
              }
              if (name === "hotelReservationForm") {
                const { basicForm } = forms;
                const hotel_reservations =
                  basicForm.getFieldValue("hotel_reservations") || [];
                basicForm.setFieldsValue({
                  hotel_reservations: [...hotel_reservations, values],
                });
                setAddCarReservationModalOpen(false);
              }
            }}
          >
            <Modal
              open={addCarReservationModalOpen}
              title={"Add New Car Reservation"}
              onCancel={closeAddCarReservation}
              width={700}
              maskClosable={false}
              okButtonProps={{ style: { display: "none" } }}
              cancelButtonProps={{ style: { display: "none" } }}
              afterClose={() => addCarReservationForm.resetFields()}
            >
              <Form
                form={addCarReservationForm}
                layout="vertical"
                name="carReservationForm"
              >
                <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row gap-2">
                  <Form.Item
                    label="Car Service"
                    name="car_service"
                    rules={[{ required: true }]}
                    className="w-full"
                  >
                    <Select
                      showSearch
                      placeholder="Select Car Service"
                      onSearch={onCarServiceSearch}
                      filterOption={false}
                      optionFilterProp="children"
                      options={carServicesDropDown}
                      allowClear={true}
                      onClear={() => carServicesSearch()}
                      onChange={(e) => {
                        onSubOptServiceSearch(e);
                        addCarReservationForm.setFieldValue(
                          "subscription_option",
                          null
                        );
                        setCarSubOptionType(undefined);
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Plan"
                    name="subscription_option"
                    rules={[{ required: true }]}
                    className="w-full"
                  >
                    <Select
                      labelInValue
                      showSearch
                      placeholder="Choose Plan"
                      options={subOptDropDown}
                      onChange={(e) => {
                        setCarSubOptionType(e.label);
                      }}
                    />
                  </Form.Item>
                </div>
                <Form.Item
                  name="pickup_time"
                  label="Pick-Up Time"
                  rules={[{ required: true }]}
                  className="w-full"
                >
                  <DatePicker
                    disabledDate={disabledDate}
                    showTime={{
                      hideDisabledOptions: true,
                    }}
                    format="YYYY-MM-DD HH:mm"
                    className="w-full"
                  />
                </Form.Item>
                <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row gap-2">
                  <Form.Item
                    name="pickup_address"
                    label="Pick-Up Address"
                    rules={[{ required: true }]}
                    className="w-full"
                  >
                    <TextArea className="w-full" />
                  </Form.Item>
                  <Form.Item
                    name="pickup_url"
                    label="Pick-Up URL"
                    // rules={[{ required: true }]}
                    className="w-full"
                  >
                    <TextArea className="w-full" />
                  </Form.Item>
                </div>
                <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row gap-2">
                  <Form.Item
                    name="pickup_lat"
                    label="Pick-Up Lat"
                    // rules={[{ required: true }]}
                    className="w-full"
                  >
                    <InputNumber className="w-full" />
                  </Form.Item>
                  <Form.Item
                    className="w-full"
                    name="pickup_long"
                    label="Pick-Up Long"
                    // rules={[{ required: true }]}
                  >
                    <InputNumber className="w-full" />
                  </Form.Item>
                </div>
                {(carSubOptionType?.includes("TRAVEL") ||
                  carSubOptionType?.includes("RIDE")) && (
                  <>
                    <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row gap-2">
                      <Form.Item
                        name="dropoff_address"
                        label="Drop-Off Address"
                        rules={[{ required: true }]}
                        className="w-full"
                      >
                        <TextArea className="w-full" />
                      </Form.Item>
                      <Form.Item
                        name="dropoff_url"
                        label="Drop-Off URL"
                        // rules={[{ required: true }]}
                        className="w-full"
                      >
                        <TextArea className="w-full" />
                      </Form.Item>
                    </div>
                    <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row gap-2">
                      <Form.Item
                        name="dropoff_lat"
                        label="Drop-Off Lat"
                        // rules={[{ required: true }]}
                        className="w-full"
                      >
                        <InputNumber className="w-full" />
                      </Form.Item>
                      <Form.Item
                        name="dropoff_long"
                        label="Drop-Off Long"
                        // rules={[{ required: true }]}
                        className="w-full"
                      >
                        <InputNumber className="w-full" />
                      </Form.Item>
                    </div>
                  </>
                )}
                {carSubOptionType?.includes("AIRPORT") && (
                  <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row gap-2">
                    <Form.Item
                      className="w-full"
                      name="terminal"
                      label="Terminal"
                      rules={[{ required: true }]}
                    >
                      <Input className="w-full" />
                    </Form.Item>
                    <Form.Item
                      className="w-full"
                      name="flight_number"
                      label="Flight Number"
                      rules={[{ required: true }]}
                    >
                      <Input className="w-full" />
                    </Form.Item>
                  </div>
                )}

                <Form.List name="options">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((key, name, ...restField) => (
                        <Form.Item key={Math.random()}>
                          <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row gap-2 items-center">
                            <Form.Item
                              label="service Option"
                              {...restField}
                              className="w-full"
                              name={[name, "option"]}
                              key={Math.random()}
                              rules={[{ required: true }]}
                            >
                              <Select
                                labelInValue
                                options={carServiceOptionsDropDown}
                                onChange={(e) => {}}
                                placeholder={"Select Option"}
                                className="w-full"
                              />
                            </Form.Item>
                            <Form.Item
                              className="w-full"
                              label="Quantity"
                              {...restField}
                              rules={[{ required: true }]}
                              name={[name, "quantity"]}
                              key={Math.random()}
                            >
                              <InputNumber
                                placeholder={"enter Quantity"}
                                className="w-full"
                              />
                            </Form.Item>
                            <FiMinusCircle
                              size={30}
                              className="dynamic-delete-button cursor-pointer"
                              onClick={() => remove(name)}
                            />
                          </div>
                        </Form.Item>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block>
                          Add Option
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
                <Form.Item
                  name="extras"
                  label="Extras"
                  // rules={[{ required: true }]}
                  className="w-full"
                >
                  <TextArea className="w-full" />
                </Form.Item>
                <Form.Item
                  className="w-full"
                  name="additional_fees"
                  label="Additional Fees"
                >
                  <InputNumber className="w-full" />
                </Form.Item>
                <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row gap-2 items-center">
                  <Form.Item label="  ">
                    <Button
                      onClick={() => {
                        addCarReservationForm.setFieldValue("final_price", 5);
                        addCarReservationForm.validateFields();
                      }}
                    >
                      Calculate Final Price
                    </Button>
                  </Form.Item>
                  <Form.Item
                    className="w-full"
                    name="final_price"
                    label="Final Price"
                    rules={[{ required: true }]}
                  >
                    <InputNumber className="w-full" />
                  </Form.Item>
                </div>
                <SubmitButton
                  form={addCarReservationForm}
                  loading={postEditRequestLoading}
                />
              </Form>
            </Modal>
            <Modal
              open={addHotelReservationModalOpen}
              title={"Add New Hotel Reservation"}
              onCancel={closeAddHotelReservation}
              width={700}
              maskClosable={false}
              okButtonProps={{ style: { display: "none" } }}
              cancelButtonProps={{ style: { display: "none" } }}
              afterClose={() => addHotelReservationForm.resetFields()}
            >
              <Form
                form={addHotelReservationForm}
                layout="vertical"
                name="hotelReservationForm"
              >
                <Form.Item
                  name="hotel_service"
                  label="Hotel Service"
                  rules={[{ required: true }]}
                >
                  <Select
                    labelInValue
                    showSearch
                    placeholder="Select Car Service"
                    onSearch={onHotelServiceSearch}
                    filterOption={false}
                    optionFilterProp="children"
                    options={hotelServicesDropDown}
                    allowClear={true}
                    onClear={() => hotelServicesSearch()}
                    onChange={(e) => null}
                  />
                </Form.Item>
                <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row gap-2 ">
                  <Form.Item
                    name="check_in_date"
                    label="Check-In Date"
                    rules={[{ required: true }]}
                    className="w-full"
                  >
                    <DatePicker
                      className="w-full"
                      disabledDate={disabledDate}
                    />
                  </Form.Item>
                  <Form.Item
                    name="check_out_date"
                    label="Check-Out Date"
                    rules={[{ required: true }]}
                    className="w-full"
                  >
                    <DatePicker
                      className="w-full"
                      disabledDate={disabledDate}
                    />
                  </Form.Item>
                </div>

                <Form.List name="options">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((key, name, ...restField) => (
                        <Form.Item key={Math.random()}>
                          <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row gap-2 items-center">
                            <Form.Item
                              rules={[{ required: true }]}
                              label="service Option"
                              {...restField}
                              className="w-full"
                              name={[name, "option"]}
                            >
                              <Select
                                placeholder={"Select Option"}
                                className="w-full"
                              />
                            </Form.Item>
                            <Form.Item
                              rules={[{ required: true }]}
                              className="w-full"
                              label="Quantity"
                              {...restField}
                              name={[name, "quantity"]}
                            >
                              <InputNumber
                                placeholder={"enter Quantity"}
                                className="w-full"
                              />
                            </Form.Item>
                            <FiMinusCircle
                              size={30}
                              className="dynamic-delete-button cursor-pointer"
                              onClick={() => remove(name)}
                            />
                          </div>
                        </Form.Item>
                      ))}
                      <Form.Item>
                        <Button type="dashed" onClick={() => add()} block>
                          Add Option
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
                <Form.Item
                  name="extras"
                  label="Extras"
                  // rules={[{ required: true }]}
                  className="w-full"
                >
                  <TextArea className="w-full" />
                </Form.Item>
                <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row gap-2 items-center">
                  <Form.Item label="  ">
                    <Button
                      onClick={() => {
                        addHotelReservationForm.setFieldValue("final_price", 5);
                        addHotelReservationForm.validateFields();
                      }}
                    >
                      Calculate Final Price
                    </Button>
                  </Form.Item>
                  <Form.Item
                    className="w-full"
                    name="final_price"
                    label="Final Price"
                    rules={[{ required: true }]}
                  >
                    <InputNumber className="w-full" />
                  </Form.Item>
                </div>

                <SubmitButton
                  form={addHotelReservationForm}
                  loading={postEditRequestLoading}
                />
              </Form>
            </Modal>

            <Form
              form={AddEditReservationForm}
              layout="vertical"
              onFinish={addEditReservation}
              name="basicForm"
            >
              <Form.Item
                name="user"
                label="Client"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  placeholder="Select User"
                  onSearch={onUserSearch}
                  filterOption={false}
                  optionFilterProp="children"
                  options={usersDropDown}
                  allowClear={true}
                  onClear={() => usersSearch()}
                />
              </Form.Item>
              <Form.Item name="car_reservations" noStyle />
              <Form.Item name="hotel_reservations" noStyle />

              <div className=" flex  flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row g-2  ">
                <Button
                  htmlType="button"
                  style={{
                    backgroundColor: "#363B5E",
                    borderColor: "#F1DF78",
                  }}
                  className="m-2 w-[100%] h-[45px] font-semibold text-white"
                  onClick={addCarReservation}
                >
                  Add Car Reservation
                </Button>
                <Button
                  htmlType="button"
                  style={{
                    backgroundColor: "#363B5E",
                    borderColor: "#F1DF78",
                  }}
                  className="m-2 w-[100%] h-[45px] font-semibold text-white"
                  onClick={addHotelReservation}
                >
                  Add Hotel Reservation
                </Button>
              </div>
              <SubmitButton
                form={AddEditReservationForm}
                loading={postEditRequestLoading}
              />
            </Form>
          </Form.Provider>
        </Modal>
      </div>
      <div className="w-full bg-white py-15">
        <div className="w-full h-full flex flex-col gap-5 p-5">
          <div
            id="filterSearch"
            className="w-full h-fit flex flex-row flex-wrap gap-2"
          >
            <Form
              form={searchForm}
              onFinish={applySearch}
              layout="inline"
              className={
                "gap-3 mb-5 items-baseline flex " +
                (isMobile ? " flex-col" : "flex-row")
              }
            >
              <Form.Item name="search">
                <Input
                  allowClear
                  placeholder="Search . . ."
                  onChange={(e: any) => {
                    e.target.value === "" ? onSearchReset() : null;
                  }}
                />
              </Form.Item>
              <Button
                htmlType="submit"
                style={{
                  backgroundColor: "#363B5E",
                  borderColor: "#F1DF78",
                }}
                className=" text-white"
              >
                Apply
              </Button>
              <Button onClick={onSearchReset}>Reset</Button>
            </Form>
          </div>
        </div>
      </div>
      <div id="content" className="w-full bg-white">
        <div className="w-full px-5 overflow-auto h-[63vh]" id="InfiniteScroll">
          <Table
            dataSource={reservationsList}
            columns={columns}
            rowKey={"id"}
            scroll={{ x: 0 }}
            loading={loadReservationsList}
            expandable={{
              expandedRowRender: (record) => (
                <Tabs defaultActiveKey="1" items={items} />
              ),
            }}
            pagination={{
              current: currentPage,
              total: reservationsCount,
              pageSize: 10,
              showTotal(total, range) {
                return `${range[0]}-${range[1]} of ${total} items`;
              },
              onChange: (page, pageSize) => {
                getReservationsList(page, pageSize);
              },
            }}
          />
        </div>
      </div>
    </Fragment>
  );
}

// export default isAuth(ReservationsPage);
export default ReservationsPage;

const SubmitButton = ({
  form,
  loading,
}: {
  form: FormInstance;
  loading: boolean;
}) => {
  const [submittable, setSubmittable] = useState(false);

  const values = Form.useWatch([], form);
  const router = useRouter();

  useEffect(() => {
    form.validateFields({ validateOnly: true }).then(
      () => {
        setSubmittable(true);
      },
      () => {
        setSubmittable(false);
      }
    );
  }, [values]);

  return (
    <Button
      htmlType="submit"
      disabled={!submittable}
      style={{
        backgroundColor: "#363B5E",
        borderColor: "#F1DF78",
      }}
      className="m-2 w-[100%] h-[45px] font-semibold text-white"
      loading={loading}
    >
      Confirm
    </Button>
  );
};
