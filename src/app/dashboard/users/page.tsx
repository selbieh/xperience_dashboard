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

function UsersPage() {
  const columns: TableColumnsType<any> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Wallet",
      dataIndex: "wallet",
      key: "wallet",
    },
    {
      title: "Points",
      dataIndex: "points",
      key: "points",
    },
    {
      title: "Rule",
      dataIndex: "is_staff",
      key: "rule",
      render: (is_staff: boolean) => (is_staff ? "Admin" : "User"),
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
    // {
    //   title: "Delete",
    //   key: "delete",
    //   render: (record: any) => (
    //     <Popconfirm
    //       title="Delete User"
    //       description="Are You Sure You Want To Delete This User?"
    //       onConfirm={() => {
    //         deleteUser(record);
    //       }}
    //       okText="Delete"
    //       cancelText="Cancel"
    //       okButtonProps={{
    //         style: {
    //           backgroundColor: "rgba(9, 16, 29, 1)",
    //           color: "#ffffffd4",
    //         },
    //       }}
    //     >
    //       <MdDeleteForever
    //         size={20}
    //         color={"#DB4437"}
    //         className="cursor-pointer"
    //       />
    //     </Popconfirm>
    //   ),
    // },
  ];

  //   function deleteUser(record: any) {
  //     DeleteReq(`user/profile/${record.id}/`).then((res) => {
  //       if (StatusSuccessCodes.includes(res.status)) {
  //         messageApi.success("User Deleted Successfully");
  //         getUsersList();
  //       } else {
  //         res?.errors.forEach((err: any) => {
  //           messageApi.error(
  //             `${err.attr ? err.attr + ":" + err.detail : err.detail} `
  //           );
  //         });
  //       }
  //     });
  //   }

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

  const [AddEditUserForm] = Form.useForm();
  const [postEditRequestLoading, setPostEditRequestLoading] =
    useState<any>(false);
  const [addEditModalOpen, setAddEditModalOpen] = useState<any>(false);
  const [isEdit, setIsEdit] = useState<any>(false);
  const [recordId, setRecordId] = useState<number | undefined>(undefined);

  useEffect(() => {
    getUsersList();
  }, []);
  const [loadUsersList, setLoadUsersList] = useState<any>(false);

  function getUsersList(page: number = 1, pageSize: number = 10) {
    setCurrentPage(page);
    let url = `user/profile/?limit=${pageSize}&offset=${(page - 1) * pageSize}`;
    params.forEach((value: any, key: any) => (url += `&${key}=${value}`));
    setLoadUsersList(true);
    GetReq(url).then((res) => {
      setLoadUsersList(false);
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

  function applySearch(values: any) {
    if (values.search) {
      params.set("search", values.search);
    } else {
      params.delete("search");
    }

    if (values.is_staff !== undefined) {
      params.set("is_staff", values.is_staff);
    } else {
      params.delete("is_staff");
    }

    replace(`${pathname}?${params.toString()}`);
    getUsersList();
  }

  const onSearchReset = () => {
    searchForm.resetFields();
    params.has("search") && params.delete("search");
    params.has("is_staff") && params.delete("is_staff");
    replace(`${pathname}`);
    getUsersList();
  };

  function openAddEditModel(record?: any) {
    setAddEditModalOpen(true);
    record.id ? setIsEdit(true) : setIsEdit(false);
    setRecordId(record?.id);
    record.id ? AddEditUserForm.setFieldsValue(record) : null;
  }

  function handleCancel() {
    setAddEditModalOpen(false);
    AddEditUserForm.resetFields();
  }

  function addEditUser(values: any) {
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
      ? PatchReq(`user/profile/${recordId}/`, data).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("User Updated Successfully");
            handleCancel();
            getUsersList();
          } else {
            res?.errors.forEach((err: any) => {
              messageApi.error(
                `${err.attr ? err.attr + ":" + err.detail : err.detail} `
              );
            });
          }
        })
      : PostReq(`user/profile/`, data).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("User Added Successfully");
            handleCancel();
            getUsersList();
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
          <h2 className="text-xl text-[white] font-semibold">Users</h2>
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
          <Form form={AddEditUserForm} layout="vertical" onFinish={addEditUser}>
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row  gap-2 ">
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Input placeholder="Enter User Name" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true }, { type: "email" }]}
                className="w-full"
              >
                <Input placeholder="Enter User Email" type="email" />
              </Form.Item>
            </div>
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row  gap-2 justify-between">
              <Form.Item
                name="mobile"
                label="Mobile"
                rules={[
                  { required: true, message: "Please input User's mobile!" },
                  {
                    validator(_, value) {
                      let PhoneRegex = /^\+201\d{9}$/;

                      const startWith = value?.startsWith("+20");
                      if (!startWith) {
                        return Promise.reject("Must Start with +201");
                      } else if (!PhoneRegex.test(value)) {
                        return Promise.reject("Must be like +201000000000");
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
                className="w-full"
              >
                <Input placeholder="Enter User's Mobile" className="w-full" />
              </Form.Item>
              <Form.Item
                initialValue={0}
                label="wallet"
                name="wallet"
                className="w-full"
              >
                <InputNumber min={0} className="w-full" placeholder="Price" />
              </Form.Item>
            </div>
            <Form.Item
              name="is_staff"
              label="Rule"
              rules={[{ required: true }]}
            >
              <Select placeholder="rule" className="min-w-[120px]">
                <Select.Option key="admin" value={true}>
                  Admin
                </Select.Option>
                <Select.Option key="user" value={false}>
                  User
                </Select.Option>
              </Select>
            </Form.Item>
            <SubmitButton
              form={AddEditUserForm}
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

                <Form.Item name="is_staff">
                  <Select placeholder="rule" className="min-w-[120px]">
                    <Select.Option key="admin" value={true}>
                      Admin
                    </Select.Option>
                    <Select.Option key="user" value={false}>
                      User
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
            loading={loadUsersList}
            pagination={{
              current: currentPage,
              total: SubscriptionOptionsCount,
              pageSize: 10,
              showTotal(total, range) {
                return `${range[0]}-${range[1]} of ${total} items`;
              },
              onChange: (page, pageSize) => {
                getUsersList(page, pageSize);
              },
            }}
          />
        </div>
      </div>
    </Fragment>
  );
}

export default isAuth(UsersPage);

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
