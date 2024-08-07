"use client";
import { DeleteReq, GetReq, PatchReq, PostReq } from "@/app/api/api";
import { StatusSuccessCodes } from "@/app/api/successStatus";
import {
  Badge,
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

function CarModelsPage() {
  const columns: TableColumnsType<any> = [
    {
      title: "Model Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Maker Name",
      dataIndex: "make_name",
      key: "make",
    },
    // {
    //   title: "Status",
    //   dataIndex: "active",
    //   key: "active",
    //   render: (active: boolean) =>
    //     active ? (
    //       <Badge status="success" text="Active" />
    //     ) : (
    //       <Badge status="error" text="InActive" />
    //     ),
    // },

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
          title="Delete Car Model"
          description="Are You Sure You Want To Delete This Car Model?"
          onConfirm={() => {
            deleteCarModel(record);
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

  function deleteCarModel(record: any) {
    DeleteReq(`car-models/${record.id}/`).then((res) => {
      if (StatusSuccessCodes.includes(res.status)) {
        messageApi.success("Deleted Successfully");
        getCarModelsList();
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
  const [carMakersDropDown, setCarMakersDropDown] = useState<any>([]);

  const [carModelsList, setCarModelsList] = useState<any[]>([]);
  const [carModelsListCount, setCarModelsListCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [AddEditModelForm] = Form.useForm();
  const [postEditRequestLoading, setPostEditRequestLoading] =
    useState<any>(false);
  const [addEditModalOpen, setAddEditModalOpen] = useState<any>(false);
  const [isEdit, setIsEdit] = useState<any>(false);
  const [recordId, setRecordId] = useState<number | undefined>(undefined);

  useEffect(() => {
    getCarModelsList();
    carMakersSearch();
  }, []);
  const [loadCarModelsList, setLoadCarModelsList] = useState<any>(false);

  function getCarModelsList(page: number = 1, pageSize: number = 10) {
    setCurrentPage(page);
    let url = `car-models/?limit=${pageSize}&offset=${(page - 1) * pageSize}`;
    params.forEach((value: any, key: any) => (url += `&${key}=${value}`));
    setLoadCarModelsList(true);
    GetReq(url).then((res) => {
      setLoadCarModelsList(false);
      if (StatusSuccessCodes.includes(res.status)) {
        setCarModelsList(res.data.results);
        setCarModelsListCount(res.data.count);
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
    if (values.make) {
      params.set("make", values.make);
    } else {
      params.delete("make");
    }

    if (values.status !== undefined) {
      params.set("status", values.status);
    } else {
      params.delete("status");
    }

    replace(`${pathname}?${params.toString()}`);
    getCarModelsList();
  }

  const onSearchReset = () => {
    searchForm.resetFields();
    params.has("search") && params.delete("search");
    params.has("is_staff") && params.delete("is_staff");
    replace(`${pathname}`);
    getCarModelsList();
  };

  function openAddEditModel(record?: any) {
    setAddEditModalOpen(true);
    record.id ? setIsEdit(true) : setIsEdit(false);
    setRecordId(record?.id);
    record.id ? AddEditModelForm.setFieldsValue(record) : null;
  }

  function handleCancel() {
    setAddEditModalOpen(false);
    AddEditModelForm.resetFields();
  }

  function addEditCarModels(values: any) {
    setPostEditRequestLoading(true);
    isEdit
      ? PatchReq(`car-models/${recordId}/`, values).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Updated Successfully");
            handleCancel();
            getCarModelsList();
          } else {
            res?.errors.forEach((err: any) => {
              messageApi.error(
                `${err.attr ? err.attr + ":" + err.detail : err.detail} `
              );
            });
          }
        })
      : PostReq(`car-models/`, values).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Added Successfully");
            handleCancel();
            getCarModelsList();
          } else {
            res?.errors.forEach((err: any) => {
              messageApi.error(
                `${err.attr ? err.attr + ":" + err.detail : err.detail} `
              );
            });
          }
        });
  }

  function carMakersSearch(search?: any) {
    let url = `car-makes/?limit=${9999}`;
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
        setCarMakersDropDown(list);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }

  function onCarMakerSearch(value: any) {
    carMakersSearch(value);
  }

  return (
    <Fragment>
      {contextHolder}
      <div className="w-full h-fit bg-[#363B5E] py-8 px-5 flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row justify-between items-center content-center">
        <div className="flex flex-row gap-5 w-fit ">
          <h2 className="text-xl text-[white] font-semibold">Car Models</h2>
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
          title={isEdit ? "Edit Car Model" : "Add New Car Model"}
          onCancel={handleCancel}
          width={700}
          maskClosable={false}
          okButtonProps={{ style: { display: "none" } }}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <Form
            form={AddEditModelForm}
            layout="vertical"
            onFinish={addEditCarModels}
          >
            <Form.Item
              label="Car Maker"
              name="make"
              rules={[{ required: true }]}
              className="w-full"
            >
              <Select
                showSearch
                placeholder="Select Car Maker"
                onSearch={onCarMakerSearch}
                filterOption={false}
                optionFilterProp="children"
                options={carMakersDropDown}
                allowClear={true}
                onClear={() => carMakersSearch()}
              />
            </Form.Item>
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row  gap-2 ">
              <Form.Item
                label="Model Name"
                name="name"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Input placeholder="Enter Car Model Name" />
              </Form.Item>

              {/* <Form.Item
                name="active"
                label="Status"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Select
                  defaultValue={true}
                  placeholder="Status"
                  className="w-full"
                >
                  <Select.Option key="active" value={true}>
                    Active
                  </Select.Option>
                  <Select.Option key="inactive" value={false}>
                    InActive
                  </Select.Option>
                </Select>
              </Form.Item> */}
            </div>
            <SubmitButton
              form={AddEditModelForm}
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

                <Form.Item
                  // label="Car Maker"
                  name="make"
                  rules={[{ required: true }]}
                >
                  <Select
                    showSearch
                    placeholder="Select Car Maker"
                    onSearch={onCarMakerSearch}
                    filterOption={false}
                    optionFilterProp="children"
                    options={carMakersDropDown}
                    allowClear={true}
                    onClear={() => carMakersSearch()}
                  />
                </Form.Item>

                {/* <Form.Item name="status">
                  <Select placeholder="status" className="min-w-[120px]">
                    <Select.Option key="active" value={true}>
                      Active
                    </Select.Option>
                    <Select.Option key="inactive" value={false}>
                      InActive
                    </Select.Option>
                  </Select>
                </Form.Item> */}

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
            dataSource={carModelsList}
            columns={columns}
            rowKey={"id"}
            scroll={{ x: 0 }}
            loading={loadCarModelsList}
            pagination={{
              current: currentPage,
              total: carModelsListCount,
              pageSize: 10,
              showTotal(total, range) {
                return `${range[0]}-${range[1]} of ${total} items`;
              },
              onChange: (page, pageSize) => {
                getCarModelsList(page, pageSize);
              },
            }}
          />
        </div>
      </div>
    </Fragment>
  );
}

export default isAuth(CarModelsPage);

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
