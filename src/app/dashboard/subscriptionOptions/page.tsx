"use client";
import { DeleteReq, GetReq, PatchReq, PostReq } from "@/app/api/api";
import { StatusSuccessCodes } from "@/app/api/successStatus";
import {
  Button,
  Form,
  FormInstance,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Table,
  TableColumnsType,
} from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { MdDeleteForever } from "react-icons/md";

import isAuth from "../../../../components/isAuth";

function SubscriptionOptionsPage() {
  const columns: TableColumnsType<any> = [
    {
      title: "Car Service",
      dataIndex: ["car_service", "model"],
      key: "car_service",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Duration (Hr)",
      dataIndex: "duration_hours",
      key: "duration_hours",
    },
    {
      title: "Price",
      // dataIndex: "day_price",
      key: "day_price",
      render: (record: any) => (
        <div>
          {record?.price} EGP/ {record?.dollar_price} USD
        </div>
      ),
    },
    {
      title: "Points",
      dataIndex: "points",
      key: "points",
    },
    {
      title: "Points Price",
      dataIndex: "points_price",
      key: "points_price",
    },
    {
      title: "Edit",
      key: "edit",
      render: (record: any) => (
        <Button
          style={{
            backgroundColor: "#363B5E",
            borderColor: "#F1DF78",
          }}
          className=" text-white"
          id={record.id}
          onClick={() => openAddEditModel(record)}
        >
          Edit
        </Button>
      ),
    },
    {
      title: "Delete",
      key: "delete",
      render: (record: any) => (
        <Popconfirm
          title="Delete Subscription Option"
          description="Are You Sure You Want To Delete This Subscription Option?"
          onConfirm={() => {
            deleteSubscriptionOption(record);
          }}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{
            style: {
              backgroundColor: "rgba(9, 16, 29, 1)",
              color: "#ffffffd4",
            },
          }}
        >
          <MdDeleteForever
            size={20}
            color={"#DB4437"}
            className="cursor-pointer"
          />
        </Popconfirm>
      ),
    },
  ];

  function deleteSubscriptionOption(record: any) {
    DeleteReq(`subscription-options/${record.id}/`).then((res) => {
      if (StatusSuccessCodes.includes(res.status)) {
        messageApi.success("Subscription Option Deleted Successfully");
        getSubscriptionOptionsList();
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const { replace } = useRouter();
  const pathname = usePathname();
  const [searchForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [SubscriptionOptions, setSubscriptionOptionsList] = useState<any[]>([]);
  const [SubscriptionOptionsCount, setSubscriptionOptionsCount] =
    useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [AddEditSubscriptionOptionForm] = Form.useForm();
  const [postEditRequestLoading, setPostEditRequestLoading] =
    useState<any>(false);
  const [addEditModalOpen, setAddEditModalOpen] = useState<any>(false);
  const [isEdit, setIsEdit] = useState<any>(false);
  const [recordId, setRecordId] = useState<number | undefined>(undefined);
  const [carServicesDropDown, setCarServicesDropDown] = useState<any>([]);

  useEffect(() => {
    getSubscriptionOptionsList();
    carServicesSearch();
  }, []);
  const [loadSubscriptionOptionsList, setLoadSubscriptionOptionsList] =
    useState<any>(false);

  function getSubscriptionOptionsList(page: number = 1, pageSize: number = 10) {
    setCurrentPage(page);
    let url = `subscription-options/?limit=${pageSize}&offset=${
      (page - 1) * pageSize
    }`;
    params.forEach((value: any, key: any) => (url += `&${key}=${value}`));
    setLoadSubscriptionOptionsList(true);
    GetReq(url).then((res) => {
      setLoadSubscriptionOptionsList(false);
      if (StatusSuccessCodes.includes(res.status)) {
        setSubscriptionOptionsList(res.data.results);
        setSubscriptionOptionsCount(res.data.count);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
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

  function onCarServiceSearch(value: any) {
    carServicesSearch(value);
  }

  function applySearch(values: any) {
    if (values.search) {
      params.set("search", values.search);
    } else {
      params.delete("search");
    }

    if (values.type) {
      params.set("type", values.type);
    } else {
      params.delete("type");
    }

    if (values.car_service) {
      params.set("car_service", values.car_service);
    } else {
      params.delete("car_service");
    }

    replace(`${pathname}?${params.toString()}`);
    getSubscriptionOptionsList();
  }

  const onSearchReset = () => {
    searchForm.resetFields();
    params.has("search") && params.delete("search");
    params.has("car_service") && params.delete("car_service");
    params.has("type") && params.delete("type");
    replace(`${pathname}`);
    getSubscriptionOptionsList();
  };

  function openAddEditModel(record?: any) {
    setAddEditModalOpen(true);
    record.id ? setIsEdit(true) : setIsEdit(false);
    setRecordId(record?.id);
    console.log(record?.car_service?.id);
    record.id
      ? AddEditSubscriptionOptionForm.setFieldsValue({
          car_service: record?.car_service?.id,
          type: record?.type,
          duration_hours: record?.duration_hours,
          price: record?.price,
          dollar_price: record?.dollar_price,
          points: record?.points,
          points_price: record?.points_price,
        })
      : null;
  }

  function handleCancel() {
    setAddEditModalOpen(false);
    AddEditSubscriptionOptionForm.resetFields();
  }

  function addEditSubscriptionOption(values: any) {
    const data = new FormData();
    for (const key in values) {
      if (key === "image" && typeof values[key] === "string") {
        continue;
      } else {
        data.append(`${key}`, values[key]);
      }
    }
    setPostEditRequestLoading(true);
    isEdit
      ? PatchReq(`subscription-options/${recordId}/`, data).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Subscription Option Updated Successfully");
            handleCancel();
            getSubscriptionOptionsList();
          } else {
            res?.errors.forEach((err: any) => {
              messageApi.error(
                `${err.attr ? err.attr + ":" + err.detail : err.detail} `
              );
            });
          }
        })
      : PostReq(`subscription-options/`, data).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Subscription Option Added Successfully");
            handleCancel();
            getSubscriptionOptionsList();
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
        <div className="flex flex-row gap-5 w-fit ">
          <h2 className="text-xl text-[white] font-semibold">
            Subscription Options
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
        <Modal
          open={addEditModalOpen}
          title={
            isEdit ? "Edit Subscription Option" : "Add New Subscription Option"
          }
          onCancel={handleCancel}
          width={700}
          maskClosable={false}
          okButtonProps={{ style: { display: "none" } }}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <Form
            form={AddEditSubscriptionOptionForm}
            layout="vertical"
            onFinish={addEditSubscriptionOption}
          >
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row  gap-2 ">
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
                />
              </Form.Item>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Select placeholder="Type">
                  <Select.Option key="RIDE" value={"RIDE"}>
                    Ride
                  </Select.Option>
                  <Select.Option key="TRAVEL" value={"TRAVEL"}>
                    Travel
                  </Select.Option>
                  <Select.Option key="AIRPORT" value={"AIRPORT"}>
                    Airport
                  </Select.Option>
                </Select>
              </Form.Item>
            </div>
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row  gap-2 justify-between">
              <Form.Item
                label="Duration"
                name="duration_hours"
                rules={[{ required: true }]}
                className="w-full"
              >
                <InputNumber
                  min={1}
                  className="w-full"
                  placeholder="Duration"
                />
              </Form.Item>
              <Form.Item
                label="Price EGP"
                name="price"
                rules={[{ required: true }]}
                className="w-full"
              >
                <InputNumber min={1} className="w-full" placeholder="Price" />
              </Form.Item>
              <Form.Item
                label="Price USD"
                name="dollar_price"
                rules={[{ required: true }]}
                className="w-full"
              >
                <InputNumber min={1} className="w-full" placeholder="Price" />
              </Form.Item>
            </div>
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row  gap-2 justify-between">
              <Form.Item
                label="Points"
                name="points"
                rules={[{ required: true }]}
                className="w-full"
              >
                <InputNumber min={0} className="w-full" placeholder="Points" />
              </Form.Item>
              <Form.Item
                label="Points Price"
                name="points_price"
                rules={[{ required: true }]}
                className="w-full"
              >
                <InputNumber
                  min={0}
                  className="w-full"
                  placeholder="Points Price"
                />
              </Form.Item>
            </div>
            <SubmitButton
              form={AddEditSubscriptionOptionForm}
              loading={postEditRequestLoading}
            />
          </Form>
        </Modal>
      </div>
      <div className="w-full bg-white py-15">
        <div className="w-full h-full flex flex-col gap-5 p-5">
          <div
            id="filterSearch"
            className="w-full h-fit flex-row flex-wrap gap-2"
          >
            <Form
              form={searchForm}
              onFinish={applySearch}
              layout="inline"
              className={"gap-3 mb-5 flex flex-row w-full "}
            >
              <div className="flex flex-row flex-wrap gap-2  w-full">
                <Form.Item name="search">
                  <Input
                    allowClear
                    placeholder="Search . . ."
                    onChange={(e: any) => {
                      e.target.value === "" ? onSearchReset() : null;
                    }}
                  />
                </Form.Item>
                <Form.Item name="car_service">
                  <Select
                    showSearch
                    placeholder="Select Car Service"
                    onSearch={onCarServiceSearch}
                    filterOption={false}
                    optionFilterProp="children"
                    options={carServicesDropDown}
                    allowClear={true}
                    onClear={() => carServicesSearch()}
                  />
                </Form.Item>
                <Form.Item name="type">
                  <Select placeholder="Type" className="min-w-[120px]">
                    <Select.Option key="RIDE" value={"RIDE"}>
                      Ride
                    </Select.Option>
                    <Select.Option key="TRAVEL" value={"TRAVEL"}>
                      Travel
                    </Select.Option>
                    <Select.Option key="AIRPORT" value={"AIRPORT"}>
                      Airport
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Button
                  htmlType="submit"
                  style={{
                    backgroundColor: "#363B5E",
                    borderColor: "#F1DF78",
                  }}
                  className=" text-white "
                >
                  Apply
                </Button>
                <Button onClick={onSearchReset}>Reset</Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
      <div id="content" className="w-full bg-white">
        <div className="w-full px-5 overflow-auto h-[63vh]" id="InfiniteScroll">
          <Table
            dataSource={SubscriptionOptions}
            columns={columns}
            rowKey={"id"}
            scroll={{ x: 0 }}
            loading={loadSubscriptionOptionsList}
            pagination={{
              current: currentPage,
              total: SubscriptionOptionsCount,
              pageSize: 10,
              showTotal(total, range) {
                return `${range[0]}-${range[1]} of ${total} items`;
              },
              onChange: (page, pageSize) => {
                getSubscriptionOptionsList(page, pageSize);
              },
            }}
          />
        </div>
      </div>
    </Fragment>
  );
}

export default isAuth(SubscriptionOptionsPage);

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
      Apply
    </Button>
  );
};
