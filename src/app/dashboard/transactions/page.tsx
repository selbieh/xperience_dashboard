"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import isAuth from "../../../../components/isAuth";
import {
  Button,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Image,
  Select,
  Table,
  TableColumnsType,
  Upload,
  UploadFile,
  message,
  Tooltip,
} from "antd";
import { isMobile } from "react-device-detect";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DeleteReq, GetReq, PatchReq, PostReq } from "@/app/api/api";
import { StatusSuccessCodes } from "@/app/api/successStatus";
import TextArea from "antd/es/input/TextArea";
import { MdDeleteForever } from "react-icons/md";
import { BiUpload } from "react-icons/bi";
import { CgSandClock } from "react-icons/cg";
import { IoCheckmarkDone } from "react-icons/io5";

function TransactionsPage() {
  const columns: TableColumnsType<any> = [
    {
      title: "User Name",
      dataIndex: ["user", "name"],
      key: "name",
    },
    {
      title: "Mobile",
      dataIndex: ["user", "mobile"],
      key: "mobile",
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },

    {
      title: "Transaction Reference",
      dataIndex: "tran_ref",
      key: "tran_ref",
    },
    {
      title: "Status",
      key: "status",
      render: (record: any) =>
        record?.pending ? (
          <div>
            <CgSandClock />
            Pending
          </div>
        ) : record?.success ? (
          <div>
            <IoCheckmarkDone color="" />
            Success
          </div>
        ) : (
          <>--</>
        ),
    },
    {
      title: "Refunded",
      //   dataIndex: "tran_ref",
      key: "Refunded",
      render: (record: any) =>
        record?.refunded ? <div>Yes</div> : <div>No</div>,
    },
  ];

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const { replace } = useRouter();
  const pathname = usePathname();
  const [searchForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [transactionsCount, setTransactionsCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useState<any>(false);

  const [usersDropDown, setUsersDropDown] = useState<any>([]);

  useEffect(() => {
    getTransactionsList();
    usersSearch();
  }, []);
  const [loadTransactionsList, setLoadTransactionsList] = useState<any>(false);

  function getTransactionsList(page: number = 1, pageSize: number = 10) {
    setCurrentPage(page);
    let url = `transaction/?limit=${pageSize}&offset=${(page - 1) * pageSize}`;
    params.forEach((value: any, key: any) => (url += `&${key}=${value}`));
    setLoadTransactionsList(true);
    GetReq(url).then((res) => {
      setLoadTransactionsList(false);
      if (StatusSuccessCodes.includes(res.status)) {
        setTransactionsList(res.data.results);
        setTransactionsCount(res.data.count);
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

  function applySearch(values: any) {
    if (values.search) {
      params.set("search", values.search);
    } else {
      params.delete("search");
    }

    if (values.user) {
      params.set("user", values.user);
    } else {
      params.delete("user");
    }

    if (values.refunded) {
      params.set("refunded", values.refunded);
    } else {
      params.delete("refunded");
    }

    if (values.status === "pending") {
      params.set("pending", "true");
    } else if (values.status === "success") {
      params.set("success", "true");
    } else {
      params.delete("status");
    }

    replace(`${pathname}?${params.toString()}`);
    getTransactionsList();
  }

  const onSearchReset = () => {
    searchForm.resetFields();
    params.has("search") && params.delete("search");
    replace(`${pathname}`);
    getTransactionsList();
  };

  function onUserSearch(value: any) {
    usersSearch(value);
  }

  return (
    <Fragment>
      {contextHolder}
      <div className="w-full h-fit bg-[#363B5E] py-8 px-5 flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row justify-between items-center content-center">
        <div className="flex flex-row flex-wrap gap-5 w-fit ">
          <h2 className="text-xl text-[white] font-semibold">Transactions</h2>
        </div>
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
              <Form.Item name="user">
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
              <Form.Item name="status">
                <Select placeholder="Select Transaction Status">
                  <Select.Option key="pending" value="pending">
                    Pending
                  </Select.Option>
                  <Select.Option key="success" value="success">
                    success
                  </Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="refunded">
                <Select placeholder="Refund Status">
                  <Select.Option key="yes" value="true">
                    Yes
                  </Select.Option>
                  <Select.Option key="no" value="false">
                    No
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
            </Form>
          </div>
        </div>
      </div>
      <div id="content" className="w-full bg-white">
        <div className="w-full px-5 overflow-auto h-[63vh]" id="InfiniteScroll">
          <Table
            dataSource={transactionsList}
            columns={columns}
            rowKey={"id"}
            scroll={{ x: 0 }}
            loading={loadTransactionsList}
            pagination={{
              current: currentPage,
              total: transactionsCount,
              pageSize: 10,
              showTotal(total, range) {
                return `${range[0]}-${range[1]} of ${total} items`;
              },
              onChange: (page, pageSize) => {
                getTransactionsList(page, pageSize);
              },
            }}
          />
        </div>
      </div>
    </Fragment>
  );
}

export default isAuth(TransactionsPage);
