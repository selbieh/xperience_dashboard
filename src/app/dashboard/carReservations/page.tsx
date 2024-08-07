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
  message,
} from "antd";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";
import { FiMinusCircle } from "react-icons/fi";
import { GetReq, PatchReq, PostReq } from "@/app/api/api";
import { StatusSuccessCodes } from "@/app/api/successStatus";
import { RangePickerProps } from "antd/es/date-picker";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isMobile } from "react-device-detect";

function CarReservations() {
  const columns: TableColumnsType<any> = [
    {
      title: "Client's Name",
      dataIndex: ["user", "name"],
      key: "ClientName",
    },
    {
      title: "Mobile",
      dataIndex: ["user", "mobile"],
      key: "mobile",
    },
    {
      title: "Car Service",
      //   dataIndex: ["car_reservations", "car_service"],
      key: "createdBy",
      render: (record: any) => record?.car_reservations[0]?.car_service?.model,
    },
    {
      title: "Pickup Address",
      //   dataIndex: ["car_reservations", "car_service"],
      key: "createdBy",
      render: (record: any) => record?.car_reservations[0]?.pickup_address,
    },
    {
      title: "Pick-up Time",
      //   dataIndex: ["car_reservations", "car_service"],
      key: "createdBy",
      render: (record: any) =>
        new Date(record?.car_reservations[0]?.pickup_time).toLocaleString(
          "CA",
          {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
    },
    {
      title: "Drop-Off Address",
      //   dataIndex: ["car_reservations", "car_service"],
      key: "createdBy",
      render: (record: any) => record?.car_reservations[0]?.dropoff_address,
    },
    {
      title: "Promo Code",
      dataIndex: "promocode",
      key: "promocode",
      render: (record: any) => (record?.promocode ? record?.promocode : "--"),
    },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      key: "payment_method",
    },
    {
      title: "Price",
      //   dataIndex: ["car_reservations", "car_service"],
      key: "price",
      render: (record: any) => record?.car_reservations[0]?.final_price,
    },
    {
      title: "Created By",
      dataIndex: ["created_by", "name"],
      key: "created_by",
    },
    {
      title: "Status",
      // dataIndex: "status",
      key: "status",
      render: (record: any) => (
        <>
          <Select
            className="w-full"
            value={record?.status}
            onChange={(value) => editReservationStatus(value, record)}
            disabled={
              record.status === "CANCELLED" ||
              record.status === "REFUNDED" ||
              record.status === "COMPLETED"
            }
          >
            <Select.Option
              key="WAITING_FOR_PAYMENT"
              value={"WAITING_FOR_PAYMENT"}
            >
              Waiting For Payment
            </Select.Option>
            <Select.Option
              key="WAITING_FOR_CONFIRMATION"
              value={"WAITING_FOR_CONFIRMATION"}
            >
              Waiting For Confirmation
            </Select.Option>
            <Select.Option key="CONFIRMED" value={"CONFIRMED"}>
              Confirmed
            </Select.Option>
            <Select.Option key="PAID" value={"PAID"}>
              Paid
            </Select.Option>
            <Select.Option key="COMPLETED" value={"COMPLETED"}>
              Completed
            </Select.Option>
            <Select.Option key="CANCELLED" value={"CANCELLED"}>
              Cancelled
            </Select.Option>
            <Select.Option key="REFUNDED" value={"REFUNDED"}>
              Cancel and Refund
            </Select.Option>
          </Select>
        </>
      ),
    },

    // {
    //   title: "Edit",
    //   key: "edit",
    //   render: (record: any) => (
    //     <Button
    //       style={{
    //         backgroundColor: "#363B5E",
    //         borderColor: "#F1DF78",
    //       }}
    //       className=" text-white"
    //       id={record.id}
    //       onClick={() => openAddEditModel(record)}
    //     >
    //       Edit
    //     </Button>
    //   ),
    // },
  ];
  const expandColumns: TableColumnsType<any> = [
    {
      title: "pickup_lat",
      dataIndex: "pickup_lat",
      key: "pickup_lat",
      render: (record) => (record === null ? "--" : record),
    },
    {
      title: "pickup_long",
      dataIndex: "pickup_long",
      key: "pickup_long",
      render: (record) => (record === null ? "--" : record),
    },
    {
      title: "pickup_url",
      dataIndex: "pickup_url",
      key: "pickup_url",
      render: (record) => (record === null ? "--" : record),
    },
    {
      title: "dropoff_lat",
      dataIndex: "dropoff_lat",
      key: "dropoff_lat",
      render: (record) => (record === null ? "--" : record),
    },
    {
      title: "dropoff_long",
      dataIndex: "dropoff_long",
      key: "dropoff_long",
      render: (record) => (record === null ? "--" : record),
    },
    {
      title: "dropoff_url",
      dataIndex: "dropoff_url",
      key: "dropoff_url",
      render: (record) => (record === null ? "--" : record),
    },
    {
      title: "terminal",
      dataIndex: "terminal",
      key: "terminal",
      render: (record) => (record === null ? "--" : record),
    },
    {
      title: "flight_number",
      dataIndex: "flight_number",
      key: "flight_number",
      render: (record) => (record === null ? "--" : record),
    },
    {
      title: "extras",
      dataIndex: "extras",
      key: "extras",
      render: (record) => (record === "" ? "--" : record),
    },
    // {
    //   title: "options",
    //   dataIndex: "options",
    //   key: "options",
    // },
  ];
  const [isWalletCreditRefundModalOpen, setIsWalletCreditRefundModalOpen] =
    useState<any>(false);
  function editReservationStatus(value: any, record: any) {
    setRecordId(record.id);
    setPostEditRequestLoading(true);
    if (value === "REFUNDED") {
      if (record?.payment_method === "POINTS") {
        PostReq("/payment/refund", {
          reservation_Id: record.id,
          refund_method: "POINTS",
        }).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Refunded Successfully");
            PatchReq(`reservations/${record?.id}/`, { status: value }).then(
              (res) => {
                setPostEditRequestLoading(false);
                if (StatusSuccessCodes.includes(res.status)) {
                  messageApi.success("Reservation Updated Successfully");
                  closeAddCarReservation();
                  getReservationsList();
                } else {
                  getReservationsList();
                  res?.errors.forEach((err: any) => {
                    messageApi.error(
                      `${err.attr ? err.attr + ":" + err.detail : err.detail} `
                    );
                  });
                }
              }
            );
          } else {
            getReservationsList();
            res?.errors.forEach((err: any) => {
              messageApi.error(
                `${err.attr ? err.attr + ":" + err.detail : err.detail} `
              );
            });
          }
        });
      } else {
        setPostEditRequestLoading(false);
        setIsWalletCreditRefundModalOpen(true);
      }
    } else {
      PatchReq(`reservations/${record?.id}/`, { status: value }).then((res) => {
        setPostEditRequestLoading(false);
        if (StatusSuccessCodes.includes(res.status)) {
          messageApi.success("Reservation Updated Successfully");
          closeAddCarReservation();
          getReservationsList();
        } else {
          getReservationsList();
          res?.errors.forEach((err: any) => {
            messageApi.error(
              `${err.attr ? err.attr + ":" + err.detail : err.detail} `
            );
          });
        }
      });
    }
  }
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const { replace } = useRouter();
  const pathname = usePathname();
  const [messageApi, contextHolder] = message.useMessage();
  const [addCarReservationModalOpen, setAddCarReservationModalOpen] =
    useState<any>(false);
  const [isEdit, setIsEdit] = useState<any>(false);
  const [reservationsList, setReservationsList] = useState<any[]>([]);
  const [reservationsCount, setReservationsCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [recordId, setRecordId] = useState<number | undefined>(undefined);
  const [addCarReservationForm] = Form.useForm();
  const [carServicesDropDown, setCarServicesDropDown] = useState<any>([]);
  const [subOptDropDown, setSubOptDropDown] = useState<any>([]);
  const [usersDropDown, setUsersDropDown] = useState<any>([]);
  const [postEditRequestLoading, setPostEditRequestLoading] =
    useState<any>(false);
  const [carSubOptionType, setCarSubOptionType] = useState<any>(undefined);
  const [carServiceOptionsDropDown, setCarServiceOptionsDropDown] =
    useState<any>([]);
  const [loadReservationsList, setLoadReservationsList] = useState<any>(false);
  const [searchForm] = Form.useForm();

  useEffect(() => {
    carServicesSearch();
    usersSearch();
    getCarServiceOptions();
    getReservationsList();
    subOptServicesSearch();
  }, []);

  function getReservationsList(page: number = 1, pageSize: number = 10) {
    setCurrentPage(page);
    let url = `reservations/?limit=${pageSize}&offset=${
      (page - 1) * pageSize
    }&has_car_reservations=true`;
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

  function openAddEditModel(record?: any) {
    setAddCarReservationModalOpen(true);
    // record.id ? setIsEdit(true) : setIsEdit(false);
    // setRecordId(record?.id);
    // record.id
    //   ? addCarReservationForm.setFieldsValue({
    //       user: record?.user,
    //       car_service_id: record?.car_reservations[0]?.car_service?.id,
    //       status: record.status,
    //       subscription_option: record?.car_reservations[0]?.subscription_option,
    //       pickup_time: dayjs(record?.car_reservations[0]?.pickup_time),
    //       pickup_address: record?.car_reservations[0]?.pickup_address,
    //       pickup_lat: record?.car_reservations[0]?.pickup_lat,
    //       pickup_long: record?.car_reservations[0]?.pickup_long,
    //       pickup_url: record?.car_reservations[0]?.pickup_url,
    //       dropoff_address: record?.car_reservations[0]?.dropoff_address,
    //       dropoff_lat: record?.car_reservations[0]?.dropoff_lat,
    //       dropoff_long: record?.car_reservations[0]?.dropoff_long,
    //       dropoff_url: record?.car_reservations[0]?.dropoff_url,
    //       terminal: record?.car_reservations[0]?.terminal,
    //       flight_number: record?.car_reservations[0]?.flight_number,
    //       extras: record?.car_reservations[0]?.extras,
    //       final_price: record?.car_reservations[0]?.final_price,
    //       options: record?.car_reservations[0]?.options,
    //     })
    //   : null;
  }

  function closeAddCarReservation() {
    setAddCarReservationModalOpen(false);
    setIsWalletCreditRefundModalOpen(false);
    addCarReservationForm.resetFields();
  }

  function carServicesSearch(search?: any) {
    let url = `car-services/?limit=${9999}`;
    search ? (url += `&search=${search}`) : null;
    GetReq(url).then((res) => {
      if (StatusSuccessCodes.includes(res.status)) {
        let list: any = [];
        res.data.results.map((rec: any) => {
          list.push({
            label: rec.model_name,
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

  function subOptServicesSearch(search?: any) {
    let url = `subscription-options/?limit=${9999}`;
    search ? (url += `&car_service=${search}`) : null;
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
  function onUserSearch(value: any) {
    usersSearch(value);
  }

  function onCarServiceSearch(value: any) {
    carServicesSearch(value);
  }

  function onSubOptServiceSearch(value: any) {
    subOptServicesSearch(value);
  }

  function addEditCarReservations(values: any) {
    calculateFinalPrice();
    delete values.additional_fees;
    values.subscription_option = values.subscription_option.value;
    values.pickup_time = values.pickup_time.format(
      "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
    );
    values.options = values?.options?.map((rec: any) => {
      return {
        service_option: rec?.service_option?.value,
        quantity: rec?.quantity,
      };
    });

    let data: any = {
      user: values.user,
      status: values.status,
      payment_method: values.payment_method,
      promocode: values.promocode,
    };
    delete values.user;
    delete values.status;
    data.car_reservations = [values];

    isEdit
      ? PatchReq(`reservations/${recordId}/`, data).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Reservation Updated Successfully");
            closeAddCarReservation();
            getReservationsList();
          } else {
            res?.errors.forEach((err: any) => {
              messageApi.error(
                `${err.attr ? err.attr + ":" + err.detail : err.detail} `
              );
            });
          }
        })
      : PostReq(`reservations/`, data).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Reservation Added Successfully");
            closeAddCarReservation();
            getReservationsList();
          } else {
            res?.errors.forEach((err: any) => {
              messageApi.error(
                `${err.attr ? err.attr + ":" + err.detail : err.detail} `
              );
            });
          }
        });
  }

  const disabledDate: RangePickerProps["disabledDate"] = (current) => {
    return current < dayjs().startOf("day");
  };

  function calculateFinalPrice() {
    let serviceOptionsPrice = addCarReservationForm
      ?.getFieldValue("options")
      ?.map((rec: any) => {
        return [rec?.service_option?.title * rec?.quantity];
      })
      ?.reduce((a: any, b: any) => +a + +b);
    let subOptPrice = +addCarReservationForm.getFieldValue(
      "subscription_option"
    )?.title;
    let AdditionalFees =
      +addCarReservationForm.getFieldValue("additional_fees");
    let finalPrice = 0;
    serviceOptionsPrice !== undefined && !isNaN(serviceOptionsPrice)
      ? (finalPrice += +serviceOptionsPrice)
      : null;
    subOptPrice ? (finalPrice += +subOptPrice) : null;
    AdditionalFees ? (finalPrice += +AdditionalFees) : null;
    addCarReservationForm.setFieldValue("final_price", finalPrice);
    addCarReservationForm.validateFields();
  }

  const onSearchReset = () => {
    searchForm.resetFields();
    params.has("search") && params.delete("search");
    replace(`${pathname}`);
    getReservationsList();
  };

  function applySearch(values: any) {
    if (values.search) {
      params.set("search", values.search);
    } else {
      params.delete("search");
    }

    replace(`${pathname}?${params.toString()}`);
    getReservationsList();
  }

  function refundWalletCredit(values: any) {
    setPostEditRequestLoading(true);

    values.reservation_id = recordId;

    PostReq("payment/refund/", values).then((res) => {
      setPostEditRequestLoading(false);
      if (StatusSuccessCodes.includes(res.status)) {
        messageApi.success("Refunded Successfully");
        setIsWalletCreditRefundModalOpen(false);
        PatchReq(`reservations/${recordId}/`, { status: "REFUNDED" }).then(
          (res) => {
            setPostEditRequestLoading(false);
            if (StatusSuccessCodes.includes(res.status)) {
              messageApi.success("Reservation Updated Successfully");
              getReservationsList();
            } else {
              getReservationsList();
              res?.errors.forEach((err: any) => {
                messageApi.error(
                  `${err.attr ? err.attr + ":" + err.detail : err.detail} `
                );
              });
            }
          }
        );
      } else {
        getReservationsList();
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }
  const [refundMethodForm] = Form.useForm();

  return (
    <Fragment>
      <Modal
        open={isWalletCreditRefundModalOpen}
        title={"Choose Refund Method"}
        onCancel={closeAddCarReservation}
        width={700}
        maskClosable={false}
        okButtonProps={{ style: { display: "none" } }}
        cancelButtonProps={{ style: { display: "none" } }}
        afterClose={() => refundMethodForm.resetFields()}
      >
        <Form
          form={refundMethodForm}
          layout="vertical"
          name="refundMethodForm"
          onFinish={refundWalletCredit}
          initialValues={{ options: [{}] }}
        >
          <Form.Item
            name="refund_method"
            label="Refund Method"
            rules={[{ required: true }]}
            className="w-full"
          >
            <Select className="w-full">
              <Select.Option key="CREDIT_CARD" value={"CREDIT_CARD"}>
                Credit Card
              </Select.Option>

              <Select.Option key="WALLET" value={"WALLET"}>
                Wallet
              </Select.Option>
            </Select>
          </Form.Item>
          <SubmitButton
            form={refundMethodForm}
            loading={postEditRequestLoading}
          />
        </Form>
      </Modal>
      {contextHolder}
      <div className="w-full h-fit bg-[#363B5E] py-8 px-5 flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row justify-between items-center content-center">
        <div className="flex flex-row flex-wrap gap-5 w-fit ">
          <h2 className="text-xl text-[white] font-semibold">
            Car Reservations
          </h2>
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
      </div>
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
          onFinish={addEditCarReservations}
          initialValues={{ options: [{}] }}
        >
          <Form.Item name="user" label="Client" rules={[{ required: true }]}>
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
          <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row gap-2">
            <Form.Item
              label="Car Service"
              name="car_service_id"
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
                  addCarReservationForm.setFieldValue("final_price", null);
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
                        name={[name, "service_option"]}
                        key={Math.random()}
                        rules={[{ required: true }]}
                      >
                        <Select
                          labelInValue
                          options={carServiceOptionsDropDown}
                          onChange={(e) => {
                            addCarReservationForm.setFieldValue(
                              "final_price",
                              null
                            );
                          }}
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
                          onChange={(e) => {
                            addCarReservationForm.setFieldValue(
                              "final_price",
                              null
                            );
                          }}
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
          <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row gap-2">
            <Form.Item
              name="payment_method"
              label="Payment Method"
              rules={[{ required: true }]}
              className="w-full"
            >
              <Select className="w-full">
                <Select.Option key="CREDIT_CARD" value={"CREDIT_CARD"}>
                  Credit Card
                </Select.Option>

                <Select.Option key="WALLET" value={"WALLET"}>
                  Wallet
                </Select.Option>

                <Select.Option
                  key="CASH_ON_DELIVERY"
                  value={"CASH_ON_DELIVERY"}
                >
                  Cash On Delivery
                </Select.Option>

                <Select.Option key="CAR_POS" value={"CAR_POS"}>
                  Car Point of Sale
                </Select.Option>

                <Select.Option key="POINTS" value={"POINTS"}>
                  Points
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="promocode"
              label="Promo Code"
              // rules={[{ required: true }]}
              className="w-full"
            >
              <Input allowClear placeholder="Promo Code . . ." />
            </Form.Item>
          </div>
          {/* <Form.Item
            className="w-full"
            name="additional_fees"
            label="Additional Fees"
            >
            <InputNumber
            className="w-full"
            onChange={(e) => {
              addCarReservationForm.setFieldValue("final_price", null);
              }}
            />
          </Form.Item> */}
          <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row gap-2 items-center">
            {/* <Form.Item label="  ">
              <Button onClick={calculateFinalPrice}>
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
            </Form.Item> */}
          </div>
          {/* <Form.Item
            className="w-full"
            name="status"
            label="Status:"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option
                key="waitingForPayment"
                value="WAITING_FOR_PAYMENT"
              >
                WAITING FOR PAYMENT
              </Select.Option>
            </Select>
          </Form.Item> */}
          <SubmitButton
            form={addCarReservationForm}
            loading={postEditRequestLoading}
          />
        </Form>
      </Modal>
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
            loading={loadReservationsList || postEditRequestLoading}
            rowClassName={(record: any, index: any) => {
              return record.status === "CANCELLED" ||
                record.status === "REFUNDED"
                ? "bg-red-100 red-bg hover:bg-red-200"
                : "hover:bg-gray-100";
            }}
            expandable={{
              expandedRowRender: (record) => (
                <div className="p-1">
                  <Table
                    dataSource={record.car_reservations}
                    columns={expandColumns}
                    pagination={false}
                  />
                </div>
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
export default isAuth(CarReservations);

const SubmitButton = ({
  form,
  loading,
}: {
  form: FormInstance;
  loading: boolean;
}) => {
  const [submittable, setSubmittable] = useState(false);

  const values = Form.useWatch([], form);

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
