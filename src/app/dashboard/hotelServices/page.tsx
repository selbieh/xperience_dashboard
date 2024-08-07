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

function HotelServicesPage() {
  const columns: TableColumnsType<any> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Name English",
      dataIndex: "name_en",
      key: "nameEn",
    },
    {
      title: "Name Arabic",
      dataIndex: "name_ar",
      key: "nameAr",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      // ellipsis: true,
      // width: "120px",
      // render: (description: any) => (
      //   <Tooltip placement="topLeft" title={description}>
      //     {description}
      //   </Tooltip>
      // ),
    },
    {
      title: "View",
      dataIndex: "view",
      key: "view",
    },
    {
      title: "Number Of Rooms",
      dataIndex: "number_of_rooms",
      key: "number_of_rooms",
    },
    {
      title: "Number Of Beds",
      dataIndex: "number_of_beds",
      key: "number_of_beds",
    },
    {
      title: "Day Price",
      // dataIndex: "day_price",
      key: "day_price",
      render: (record: any) => (
        <div>
          {record?.day_price} EGP/ {record?.dollar_day_price} USD
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
      title: "Images",
      width: "185px",
      key: "images",
      render: (record: any) => (
        <Button
          style={{
            backgroundColor: "#363B5E",
            borderColor: "#F1DF78",
          }}
          className=" text-white"
          id={record.id}
          onClick={() => openAddEditImages(record)}
        >
          Add/Edit Images
        </Button>
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
          title="Delete Hotel Service"
          description="Are You Sure You Want To Delete This Hotel Service?"
          onConfirm={() => {
            deleteHotelService(record);
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

  function deleteHotelService(record: any) {
    DeleteReq(`hotel-services/${record.id}/`).then((res) => {
      // setPostEidetRequestLoading(false);
      if (StatusSuccessCodes.includes(res.status)) {
        messageApi.success("Car Service Deleted Successfully");
        getHotelServicesList();
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }
  function openAddEditImages(record?: any) {
    setAddEditImagesOpen(true);
    getHotelImages(record.id);
    setRecordId(record?.id);
  }
  const [uploadingImage, setUploadingImage] = useState<any>(false);

  const [loadHotelServicesImages, setLoadHotelServicesImages] =
    useState<any>(false);
  const [hotelImagesList, setHotelImagesList] = useState<any[]>([]);

  function getHotelImages(id: number) {
    setLoadHotelServicesImages(true);
    let url = `hotel-images/?hotel_service=${id}`;
    GetReq(url).then((res) => {
      setLoadHotelServicesImages(false);
      if (StatusSuccessCodes.includes(res.status)) {
        setHotelImagesList(res.data.results);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }

  const imagesColumns: TableColumnsType<any> = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image: string) => (
        <Image
          src={image}
          alt="Hotel Image"
          height={60}
          width={60}
          fallback="/images/noPreview.jpeg"
        />
      ),
    },
    {
      title: "Edit",
      key: "edit",
      render: (record: any) => (
        <Upload
          maxCount={1}
          accept=".png, .jpeg"
          style={{ width: "100%" }}
          className="flex flex-col cursor-pointer avatar-uploader"
          fileList={hotelFileList}
          onChange={(e: any) => handleImagesChange(e, record)}
        >
          <Button
            style={{
              backgroundColor: "#363B5E",
              borderColor: "#F1DF78",
            }}
            className=" text-white"
            id={record.id}
            loading={uploadingImage}
          >
            Change
          </Button>
        </Upload>
      ),
    },
    {
      title: "Delete",
      key: "delete",
      render: (record: any) => (
        <Popconfirm
          title="Delete Hotel Image"
          description="Are You Sure You Want To Delete This Hotel Image?"
          onConfirm={() => {
            deleteHotelImage(record);
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

  function deleteHotelImage(record: any) {
    setLoadHotelServicesImages(true);
    DeleteReq(`hotel-images/${record.id}/`).then((res) => {
      setLoadHotelServicesImages(false);
      if (StatusSuccessCodes.includes(res.status)) {
        messageApi.success("Hotel Image Deleted Successfully");
        getHotelImages(record.hotel_service);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }

  const handleImagesChange = (e: any, record: any) => {
    let imageData = new FormData();
    imageData.append("image", e?.file?.originFileObj);
    imageData.append("hotel_service", JSON.stringify(recordId));
    setUploadingImage(true);
    PatchReq(`hotel-images/${record.id}/`, imageData).then((res) => {
      setUploadingImage(false);
      if (StatusSuccessCodes.includes(res.status)) {
        messageApi.success("Image Changed Successfully");
        getHotelImages(recordId ? recordId : 0);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  };

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
  const [addEditImagesOpen, setAddEditImagesOpen] = useState<any>(false);

  const [AddEditHotelServiceForm] = Form.useForm();
  const [postEditRequestLoading, setPostEditRequestLoading] =
    useState<any>(false);
  const [addEditModalOpen, setAddEditModalOpen] = useState<any>(false);
  const [isEdit, setIsEdit] = useState<any>(false);
  const [recordId, setRecordId] = useState<number | undefined>(undefined);
  const [hotelFileList, setHotelFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    getHotelServicesList();
    getHotelFeatures();
  }, []);
  const [loadHotelServicesList, setLoadHotelServicesList] =
    useState<any>(false);

  function getHotelServicesList(page: number = 1, pageSize: number = 10) {
    setCurrentPage(page);
    let url = `hotel-services/?limit=${pageSize}&offset=${
      (page - 1) * pageSize
    }`;
    params.forEach((value: any, key: any) => (url += `&${key}=${value}`));
    setLoadHotelServicesList(true);
    GetReq(url).then((res) => {
      setLoadHotelServicesList(false);
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
    getHotelServicesList();
  }

  const onSearchReset = () => {
    searchForm.resetFields();
    params.has("search") && params.delete("search");
    replace(`${pathname}`);
    getHotelServicesList();
  };

  function openAddEditModel(record?: any) {
    setAddEditModalOpen(true);
    record.id ? setIsEdit(true) : setIsEdit(false);
    setRecordId(record?.id);
    if (record.id) {
      AddEditHotelServiceForm.setFieldsValue(record);
    }
  }

  function handleCancel() {
    setAddEditModalOpen(false);
    AddEditHotelServiceForm.resetFields();
    setAddEditImagesOpen(false);
  }

  function addEditHotelService(values: any) {
    // values.features = [values.features];
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
      ? PatchReq(`hotel-services/${recordId}/`, values).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Hotel Service Updated Successfully");
            handleCancel();
            getHotelServicesList();
          } else {
            res?.errors.forEach((err: any) => {
              messageApi.error(
                `${err.attr ? err.attr + ":" + err.detail : err.detail} `
              );
            });
          }
        })
      : PostReq(`hotel-services/`, values).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Hotel Service Added Successfully");
            handleCancel();
            getHotelServicesList();
          } else {
            res?.errors.forEach((err: any) => {
              messageApi.error(
                `${err.attr ? err.attr + ":" + err.detail : err.detail} `
              );
            });
          }
        });
  }

  const handleImagesUpload = (e: any) => {
    let imageData = new FormData();
    imageData.append("image", e?.file?.originFileObj);
    imageData.append("hotel_service", JSON.stringify(recordId));
    setUploadingImage(true);
    PostReq(`hotel-images/`, imageData).then((res) => {
      setUploadingImage(false);
      if (StatusSuccessCodes.includes(res.status)) {
        messageApi.success("Image Added Successfully");
        getHotelImages(recordId ? recordId : 0);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  };

  function getHotelFeatures() {
    let url = `hotel-service-features/?limit=99999`;
    GetReq(url).then((res: any) => {
      if (StatusSuccessCodes.includes(res.status)) {
        let list: any = [];
        res.data.results.map((rec: any) => {
          list.push({
            label: rec.name,
            value: rec.id,
            key: rec.id,
          });
        });
        setHotelFeaturesDropDown(list);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }
  // const OPTIONS = ["Apples", "Nails", "Bananas", "Helicopters"];

  const filteredOptions = hotelFeaturesDropDown.filter(
    (o: any) => !selectedItems.includes(o)
  );

  return (
    <Fragment>
      {contextHolder}
      <div className="w-full h-fit bg-[#363B5E] py-8 px-5 flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row justify-between items-center content-center">
        <div className="flex flex-row flex-wrap gap-5 w-fit ">
          <h2 className="text-xl text-[white] font-semibold">Hotel Services</h2>
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
          open={addEditImagesOpen}
          title="Add / Edit Hotel Service Images"
          onCancel={handleCancel}
          width={700}
          maskClosable={false}
          okButtonProps={{ style: { display: "none" } }}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <div className="m-5 flex flex-auto items-center w-full">
            {hotelImagesList.length >= 10 ? null : (
              <Upload
                maxCount={1}
                accept=".png, .jpeg"
                style={{ width: "100%" }}
                className="flex flex-col cursor-pointer avatar-uploader"
                fileList={hotelFileList}
                onChange={handleImagesUpload}
              >
                <Button
                  className=" flex items-center justify-center text-white"
                  style={{
                    backgroundColor: "#363B5E",
                    borderColor: "#F1DF78",
                  }}
                  icon={<BiUpload size={20} />}
                  loading={uploadingImage}
                >
                  Click to Upload
                </Button>
              </Upload>
            )}
          </div>
          <Table
            dataSource={hotelImagesList}
            loading={loadHotelServicesImages}
            columns={imagesColumns}
            rowKey={"id"}
            scroll={{ x: 0 }}
            pagination={false}
            //   {
            //   current: currentPage,
            //   total: carServicesCount,
            //   pageSize: 10,
            //   showTotal(total, range) {
            //     return `${range[0]}-${range[1]} of ${total} items`;
            //   },
            //   onChange: (page, pageSize) => {
            //     getCarServicesList(page, pageSize);
            //   },
            // }}
          />
        </Modal>
        <Modal
          open={addEditModalOpen}
          title={isEdit ? "Edit Hotel Service" : "Add New Hotel Service"}
          onCancel={handleCancel}
          width={700}
          maskClosable={false}
          okButtonProps={{ style: { display: "none" } }}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <Form
            form={AddEditHotelServiceForm}
            layout="vertical"
            onFinish={addEditHotelService}
          >
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row gap-2 justify-between">
              <Form.Item
                label="Name In English"
                name="name_en"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Input placeholder="Enter Hotel Name In English" />
              </Form.Item>
              <Form.Item
                label="Name In Arabic"
                name="name_ar"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Input placeholder="Enter Hotel Name In Arabic" />
              </Form.Item>
            </div>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true }]}
              className="w-full"
            >
              <TextArea placeholder="Enter Description" />
            </Form.Item>
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row gap-2 justify-between">
              <Form.Item
                label="Number Of Rooms"
                name="number_of_rooms"
                rules={[{ required: true }]}
                className="w-full"
              >
                <InputNumber
                  min={1}
                  className="w-full"
                  placeholder="Number Of Rooms"
                />
              </Form.Item>

              <Form.Item
                label="Number Of Beds"
                name="number_of_beds"
                rules={[{ required: true }]}
                className="w-full"
              >
                <InputNumber
                  min={1}
                  className="w-full"
                  placeholder="Number Of Beds"
                />
              </Form.Item>
            </div>
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row gap-2 justify-between">
              <Form.Item
                label="View"
                name="view"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Input placeholder="Enter Room View" />
              </Form.Item>
              <Form.Item
                label="Features"
                name="features"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Select
                  mode="multiple"
                  placeholder="Select Features"
                  value={selectedItems}
                  onChange={setSelectedItems}
                  style={{ width: "100%" }}
                  options={filteredOptions.map((item: any) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                />
              </Form.Item>
            </div>
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row gap-2 justify-between">
              <Form.Item
                label="Day Price EGP"
                name="day_price"
                rules={[{ required: true }]}
                className="w-full"
              >
                <InputNumber
                  min={1}
                  className="w-full"
                  placeholder="Day Price"
                />
              </Form.Item>
              <Form.Item
                label="Day Price USD"
                name="dollar_day_price"
                rules={[{ required: true }]}
                className="w-full"
              >
                <InputNumber
                  min={1}
                  className="w-full"
                  placeholder="Day Price"
                />
              </Form.Item>
            </div>
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row gap-2 justify-between">
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
              form={AddEditHotelServiceForm}
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
            loading={loadHotelServicesList}
            pagination={{
              current: currentPage,
              total: hotelServicesCount,
              pageSize: 10,
              showTotal(total, range) {
                return `${range[0]}-${range[1]} of ${total} items`;
              },
              onChange: (page, pageSize) => {
                getHotelServicesList(page, pageSize);
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
