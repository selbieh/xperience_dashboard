"use client";
import { DeleteReq, GetReq, PatchReq, PostReq } from "@/app/api/api";
import { StatusSuccessCodes } from "@/app/api/successStatus";
import {
  Badge,
  Button,
  DatePicker,
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
import { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { MdDeleteForever } from "react-icons/md";

import isAuth from "../../../../components/isAuth";

function HotelServicesPage() {
  const columns: TableColumnsType<any> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Discount Type",
      dataIndex: "discount_type",
      key: "discount_type",
    },
    {
      title: "Discount Value",
      dataIndex: "discount_value",
      key: "discount_value",
    },
    {
      title: "Status",
      key: "is_active",
      render: (record: any) =>
        record.is_active ? (
          <Badge status="success" text="Active" />
        ) : (
          <Badge status="error" text="InActive" />
        ),
    },
    {
      title: "Expiration Date",
      dataIndex: "expiration_date",
      key: "expiration_date",
      render: (expiration_date: any) =>
        new Date(expiration_date).toLocaleDateString("CA", {
          hour12: true,
        }),
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
          title="Delete Promo Code"
          description="Are You Sure You Want To Delete This Promo Code?"
          onConfirm={() => {
            deletePromoCode(record);
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

  function deletePromoCode(record: any) {
    DeleteReq(`promocodes/${record.id}/`).then((res) => {
      if (StatusSuccessCodes.includes(res.status)) {
        messageApi.success("Promo Code Deleted Successfully");
        getPromoCodesList();
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }

  const [maxLimit, setMaxLimit] = useState<any>();

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const { replace } = useRouter();
  const pathname = usePathname();
  const [searchForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [hotelFeaturesDropDown, setHotelFeaturesDropDown] = useState<any>([]);

  const [hotelServicesList, setHotelServicesList] = useState<any[]>([]);
  const [hotelServicesCount, setHotelServicesCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [AddEditPromoCodeForm] = Form.useForm();
  const [postEditRequestLoading, setPostEditRequestLoading] =
    useState<any>(false);
  const [addEditModalOpen, setAddEditModalOpen] = useState<any>(false);
  const [isEdit, setIsEdit] = useState<any>(false);
  const [recordId, setRecordId] = useState<number | undefined>(undefined);

  useEffect(() => {
    getPromoCodesList();
  }, []);
  const [loadPromoCodesList, setLoadPromoCodesList] = useState<any>(false);

  function getPromoCodesList(page: number = 1, pageSize: number = 10) {
    setCurrentPage(page);
    let url = `promocodes/?limit=${pageSize}&offset=${(page - 1) * pageSize}`;
    params.forEach((value: any, key: any) => (url += `&${key}=${value}`));
    setLoadPromoCodesList(true);
    GetReq(url).then((res) => {
      setLoadPromoCodesList(false);
      if (StatusSuccessCodes.includes(res.status)) {
        setHotelServicesList(res.data.results);
        setHotelServicesCount(res.data.count);
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

    replace(`${pathname}?${params.toString()}`);
    getPromoCodesList();
  }

  const onSearchReset = () => {
    searchForm.resetFields();
    params.has("search") && params.delete("search");
    replace(`${pathname}`);
    getPromoCodesList();
  };

  function openAddEditModel(record?: any) {
    setAddEditModalOpen(true);
    record.id ? setIsEdit(true) : setIsEdit(false);
    setRecordId(record?.id);
    record.id
      ? AddEditPromoCodeForm.setFieldsValue({
          ...record,
          expiration_date: dayjs(record?.expiration_date),
        })
      : null;
  }

  function handleCancel() {
    setAddEditModalOpen(false);
    AddEditPromoCodeForm.resetFields();
  }

  function addEditPromoCode(values: any) {
    values.expiration_date = values.expiration_date.format("YYYY-MM-DD");
    console.log(values);

    setPostEditRequestLoading(true);
    isEdit
      ? PatchReq(`promocodes/${recordId}/`, values).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Promo Code Updated Successfully");
            handleCancel();
            getPromoCodesList();
          } else {
            res?.errors.forEach((err: any) => {
              messageApi.error(
                `${err.attr ? err.attr + ":" + err.detail : err.detail} `
              );
            });
          }
        })
      : PostReq(`promocodes/`, values).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Promo Code Added Successfully");
            handleCancel();
            getPromoCodesList();
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

  return (
    <Fragment>
      {contextHolder}
      <div className="w-full h-fit bg-[#363B5E] py-8 px-5 flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row justify-between items-center content-center">
        <div className="flex flex-row flex-wrap gap-5 w-fit ">
          <h2 className="text-xl text-[white] font-semibold">Promo Codes</h2>
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
          title={isEdit ? "Edit Promo Code" : "Add New Promo Code"}
          onCancel={handleCancel}
          width={700}
          maskClosable={false}
          okButtonProps={{ style: { display: "none" } }}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <Form
            form={AddEditPromoCodeForm}
            layout="vertical"
            onFinish={addEditPromoCode}
          >
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row gap-2 justify-between">
              <Form.Item
                label="Name"
                name="code"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Input placeholder="Enter Promo Code Name" />
              </Form.Item>
            </div>
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row gap-2 justify-between">
              <Form.Item
                label="Discount Type"
                name="discount_type"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Select
                  placeholder="Discount Type"
                  className="w-full"
                  onChange={(e) => {
                    e === "PERCENTAGE"
                      ? setMaxLimit(100)
                      : setMaxLimit(undefined);
                  }}
                >
                  <Select.Option key="PERCENTAGE" value={"PERCENTAGE"}>
                    Percentage
                  </Select.Option>

                  <Select.Option key="Fixed" value={"FIXED"}>
                    Fixed
                  </Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Discount Value"
                name="discount_value"
                rules={[{ required: true }]}
                className="w-full"
              >
                <InputNumber
                  min={0}
                  max={maxLimit}
                  className="w-full"
                  placeholder="Discount Value"
                />
              </Form.Item>
            </div>
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row gap-2 justify-between">
              <Form.Item
                label="Status"
                name="is_active"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Select placeholder="Status" className="w-full">
                  <Select.Option key="active" value={true}>
                    Active
                  </Select.Option>

                  <Select.Option key="inactive" value={false}>
                    InActive
                  </Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="expiration_date"
                label="Expiration Date"
                rules={[{ required: true }]}
                className="w-full"
              >
                <DatePicker
                  className="w-full"
                  disabledDate={disabledDate}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </div>

            <SubmitButton
              form={AddEditPromoCodeForm}
              loading={postEditRequestLoading}
            />
          </Form>
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
            dataSource={hotelServicesList}
            columns={columns}
            rowKey={"id"}
            scroll={{ x: 0 }}
            loading={loadPromoCodesList}
            pagination={{
              current: currentPage,
              total: hotelServicesCount,
              pageSize: 10,
              showTotal(total, range) {
                return `${range[0]}-${range[1]} of ${total} items`;
              },
              onChange: (page, pageSize) => {
                getPromoCodesList(page, pageSize);
              },
            }}
          />
        </div>
      </div>
    </Fragment>
  );
}

export default isAuth(HotelServicesPage);

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
