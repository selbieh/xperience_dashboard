"use client";
import { DeleteReq, GetReq, PatchReq, PostReq } from "@/app/api/api";
import { StatusSuccessCodes } from "@/app/api/successStatus";
import {
  Badge,
  Button,
  Form,
  FormInstance,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Table,
  TableColumnsType,
  Upload,
  UploadFile,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { BiUpload } from "react-icons/bi";
import { MdDeleteForever } from "react-icons/md";

import isAuth from "../../../../components/isAuth";

function ServiceOptionsPage() {
  const columns: TableColumnsType<any> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Service Type",
      dataIndex: "service_type",
      key: "type",
    },
    {
      title: "type",
      dataIndex: "type",
      key: "type",
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
    // {
    //   title: "Points",
    //   dataIndex: "points",
    //   key: "points",
    // },
    {
      title: "Points Price",
      dataIndex: "points_price",
      key: "points_price",
    },
    {
      title: "Max Free",
      dataIndex: "max_free",
      key: "max_free",
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "images",
      render: (record: any) =>
        record ? (
          <Badge status="success" text="Active" />
        ) : (
          <Badge status="error" text="InActive" />
        ),
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
          title="Delete Service Option"
          description="Are You Sure You Want To Delete This Service Option?"
          onConfirm={() => {
            deleteServiceOption(record);
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

  function deleteServiceOption(record: any) {
    DeleteReq(`service-options/${record.id}/`).then((res) => {
      if (StatusSuccessCodes.includes(res.status)) {
        messageApi.success("Service Option Deleted Successfully");
        getServiceOptionsList();
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

  const [serviceOptions, setServiceOptionsList] = useState<any[]>([]);
  const [serviceOptionsCount, setServiceOptionsCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [AddEditServiceOptionsForm] = Form.useForm();
  const [postEditRequestLoading, setPostEditRequestLoading] =
    useState<any>(false);
  const [addEditModalOpen, setAddEditModalOpen] = useState<any>(false);
  const [isEdit, setIsEdit] = useState<any>(false);
  const [recordId, setRecordId] = useState<number | undefined>(undefined);

  useEffect(() => {
    getServiceOptionsList();
  }, []);
  const [loadServiceOptionsList, setLoadServiceOptionsList] =
    useState<any>(false);

  function getServiceOptionsList(page: number = 1, pageSize: number = 10) {
    setCurrentPage(page);
    let url = `service-options/?limit=${pageSize}&offset=${
      (page - 1) * pageSize
    }`;
    params.forEach((value: any, key: any) => (url += `&${key}=${value}`));
    setLoadServiceOptionsList(true);
    GetReq(url).then((res) => {
      setLoadServiceOptionsList(false);
      if (StatusSuccessCodes.includes(res.status)) {
        setServiceOptionsList(res.data.results);
        setServiceOptionsCount(res.data.count);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
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

    if (values.service_type) {
      params.set("service_type", values.service_type);
    } else {
      params.delete("service_type");
    }

    replace(`${pathname}?${params.toString()}`);
    getServiceOptionsList();
  }

  const onSearchReset = () => {
    searchForm.resetFields();
    params.has("search") && params.delete("search");
    params.has("service_type") && params.delete("service_type");
    params.has("type") && params.delete("type");
    replace(`${pathname}`);
    getServiceOptionsList();
  };

  function openAddEditModel(record?: any) {
    setAddEditModalOpen(true);
    record.id ? setIsEdit(true) : setIsEdit(false);
    setRecordId(record?.id);
    record.id ? AddEditServiceOptionsForm.setFieldsValue(record) : null;
  }

  function handleCancel() {
    setAddEditModalOpen(false);
    AddEditServiceOptionsForm.resetFields();
  }

  function addEditServiceOption(values: any) {
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
      ? PatchReq(`service-options/${recordId}/`, data).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Service Option Updated Successfully");
            handleCancel();
            getServiceOptionsList();
          } else {
            res?.errors.forEach((err: any) => {
              messageApi.error(
                `${err.attr ? err.attr + ":" + err.detail : err.detail} `
              );
            });
          }
        })
      : PostReq(`service-options/`, data).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Service Option Added Successfully");
            handleCancel();
            getServiceOptionsList();
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
          <h2 className="text-xl text-[white] font-semibold">
            Service Options
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
          title={isEdit ? "Edit Service Option" : "Add New Service Option"}
          onCancel={handleCancel}
          width={700}
          maskClosable={false}
          okButtonProps={{ style: { display: "none" } }}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <Form
            form={AddEditServiceOptionsForm}
            layout="vertical"
            onFinish={addEditServiceOption}
          >
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row gap-2 justify-between">
              <Form.Item
                label="Service Type"
                name="service_type"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Select placeholder="Service Type">
                  <Select.Option key="CAR" value={"Car"}>
                    Car
                  </Select.Option>
                  <Select.Option key="Hotel" value={"HOTEL"}>
                    Hotel
                  </Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Select placeholder="Type">
                  <Select.Option key="Extras" value={"Extras"}>
                    Extras
                  </Select.Option>
                  <Select.Option key="Scent Service" value={"Scent Service"}>
                    Scent Service
                  </Select.Option>
                  <Select.Option key="Beverages" value={"Beverages"}>
                    Beverages
                  </Select.Option>
                  <Select.Option key="Snacks" value={"Snacks"}>
                    Snacks
                  </Select.Option>
                </Select>
              </Form.Item>
            </div>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true }]}
              className="w-full"
            >
              <Input className="w-full" placeholder="Name" />
            </Form.Item>
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row gap-2 justify-between">
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
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row gap-2 justify-between">
              <Form.Item
                label="Max Free"
                name="max_free"
                rules={[{ required: true }]}
                className="w-full"
              >
                <InputNumber
                  min={0}
                  className="w-full"
                  placeholder="Enter Max Free"
                />
              </Form.Item>
              <Form.Item
                label="Status"
                name="active"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Select placeholder="Active?">
                  <Select.Option key="active" value={true}>
                    Active
                  </Select.Option>
                  <Select.Option key="inActive" value={false}>
                    InActive
                  </Select.Option>
                </Select>
              </Form.Item>
            </div>
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row  gap-2 justify-between">
              {/* <Form.Item
                label="Points"
                name="points"
                rules={[{ required: true }]}
                className="w-full"
              >
                <InputNumber min={0} className="w-full" placeholder="Points" />
              </Form.Item> */}
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
              form={AddEditServiceOptionsForm}
              loading={postEditRequestLoading}
            />
          </Form>
        </Modal>
      </div>
      <div className="w-full bg-white py-15">
        <div className="w-full h-full flex flex-col gap-5 p-5">
          <div id="filterSearch" className="w-full h-fit flex flex-row gap-2">
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
                <Form.Item name="service_type">
                  <Select placeholder="Service Type">
                    <Select.Option key="CAR" value={"Car"}>
                      Car
                    </Select.Option>
                    <Select.Option key="Hotel" value={"HOTEL"}>
                      Hotel
                    </Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="type">
                  <Select placeholder="Type" className="min-w-[120px]">
                    <Select.Option key="Extras" value={"Extras"}>
                      Extras
                    </Select.Option>
                    <Select.Option key="Scent Service" value={"Scent Service"}>
                      Scent Service
                    </Select.Option>
                    <Select.Option key="Beverages" value={"Beverages"}>
                      Beverages
                    </Select.Option>
                    <Select.Option key="Snacks" value={"Snacks"}>
                      Snacks
                    </Select.Option>
                  </Select>
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
              </div>
            </Form>
          </div>
        </div>
      </div>
      <div id="content" className="w-full bg-white">
        <div className="w-full px-5 overflow-auto h-[63vh]" id="InfiniteScroll">
          <Table
            dataSource={serviceOptions}
            columns={columns}
            rowKey={"id"}
            scroll={{ x: 0 }}
            loading={loadServiceOptionsList}
            pagination={{
              current: currentPage,
              total: serviceOptionsCount,
              pageSize: 10,
              showTotal(total, range) {
                return `${range[0]}-${range[1]} of ${total} items`;
              },
              onChange: (page, pageSize) => {
                getServiceOptionsList(page, pageSize);
              },
            }}
          />
        </div>
      </div>
    </Fragment>
  );
}

export default isAuth(ServiceOptionsPage);

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
