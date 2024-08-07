"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import isAuth from "../../../../components/isAuth";
import {
  Button,
  Form,
  GetProp,
  Input,
  Modal,
  Table,
  TableColumnsType,
  Upload,
  UploadFile,
  UploadProps,
  message,
  Image,
  Popconfirm,
  DatePicker,
  InputNumber,
  Select,
  FormInstance,
  Tooltip,
  Badge,
} from "antd";
import { isMobile } from "react-device-detect";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DeleteReq, GetReq, PatchReq, PostReq } from "@/app/api/api";
import { StatusSuccessCodes } from "@/app/api/successStatus";
import TextArea from "antd/es/input/TextArea";
import { BiPlus, BiUpload } from "react-icons/bi";
import { MdDeleteForever } from "react-icons/md";

function CarServicesPage() {
  const columns: TableColumnsType<any> = [
    {
      title: "Model",
      dataIndex: "model_name",
      key: "model",
    },
    {
      title: "Make",
      dataIndex: "make_name",
      key: "make",
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
      title: "Number Of Seats",
      dataIndex: "number_of_seats",
      key: "number_of_seats",
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Cool",
      dataIndex: "cool",
      key: "cool",
      render: (cool: boolean) =>
        cool ? (
          <Badge status="success" text="Active" />
        ) : (
          <Badge status="error" text="InActive" />
        ),
    },
    {
      title: "Main Image",
      dataIndex: "image",
      key: "image",
      render: (image: string) => (
        <Image
          src={image}
          alt="Car Image"
          height={30}
          width={30}
          fallback="/images/noPreview.jpeg"
        />
      ),
    },
    {
      title: "Other Images",
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
          Add / Edit Images
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
          onClick={() => openEditModel(record)}
        >
          Edit
        </Button>
      ),
    },
    {
      key: "delete",
      render: (record: { id: number }) => (
        <Popconfirm
          title="Delete Car Service"
          description="Are You Sure You Want To Delete This Car Service?"
          onConfirm={() => {
            deleteCarService(record.id);
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
  const imagesColumns: TableColumnsType<any> = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image: string) => (
        <Image
          src={image}
          alt="Car Image"
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
          fileList={carsFileList}
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
          title="Delete Car Service"
          description="Are You Sure You Want To Delete This Car Service?"
          onConfirm={() => {
            deleteCarImage(record);
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
  function deleteCarService(id: number) {
    DeleteReq(`car-services/${id}/`).then((res) => {
      // setPostEidetRequestLoading(false);
      if (StatusSuccessCodes.includes(res.status)) {
        messageApi.success("Car Service Deleted Successfully");
        getCarServicesList();
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }

  function deleteCarImage(record: any) {
    setLoadCarServicesImages(true);
    DeleteReq(`car-images/${record.id}/`).then((res) => {
      setLoadCarServicesImages(false);
      if (StatusSuccessCodes.includes(res.status)) {
        messageApi.success("Car Image Deleted Successfully");
        getCarImages(record.car_service);
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [make, setMake] = useState<number | undefined>(undefined);
  const [carMakersDropDown, setCarMakersDropDown] = useState<any>([]);
  const [carModelsDropDown, setCarModelsDropDown] = useState<any>([]);

  const [carServicesList, setCarServicesList] = useState<any[]>([]);
  const [carImagesList, setCarImagesList] = useState<any[]>([]);
  const [carServicesCount, setCarServicesCount] = useState<number>(0);
  const [loadCarServicesList, setLoadCarServicesList] = useState<any>(false);
  const [uploadingImage, setUploadingImage] = useState<any>(false);
  const [loadCarServicesImages, setLoadCarServicesImages] =
    useState<any>(false);

  const [addEditModalOpen, setAddEditModalOpen] = useState<any>(false);
  const [addEditImagesOpen, setAddEditImagesOpen] = useState<any>(false);
  const [isEdit, setIsEdit] = useState<any>(false);
  const [carsFileList, setCarsFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [AddEditCarServiceForm] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<any>();
  const [recordId, setRecordId] = useState<number>();
  const [postEditRequestLoading, setPostEidetRequestLoading] =
    useState<any>(false);

  useEffect(() => {
    getCarServicesList();
    carMakersSearch();
    carModelsSearch();
  }, []);

  function getCarServicesList(page: number = 1, pageSize: number = 10) {
    setLoadCarServicesList(true);
    setCurrentPage(page);
    let url = `car-services/?limit=${pageSize}&offset=${(page - 1) * pageSize}`;
    params.forEach((value: any, key: any) => (url += `&${key}=${value}`));
    GetReq(url).then((res) => {
      setLoadCarServicesList(false);
      if (StatusSuccessCodes.includes(res.status)) {
        setCarServicesList(res.data.results);
        setCarServicesCount(res.data.count);
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
    if (values.model) {
      params.set("model", values.model);
    } else {
      params.delete("model");
    }

    replace(`${pathname}?${params.toString()}`);
    getCarServicesList();
  }

  const onSearchReset = () => {
    searchForm.resetFields();
    params.has("search") && params.delete("search");
    replace(`${pathname}`);
    getCarServicesList();
    setMake(undefined);
  };

  function openAddModel() {
    setAddEditModalOpen(true);
  }
  function openEditModel(record?: any) {
    setAddEditModalOpen(true);
    record.id ? setIsEdit(true) : setIsEdit(false);
    setRecordId(record?.id);
    record ? AddEditCarServiceForm.setFieldsValue(record) : null;
    setImageUrl(record.image);
  }

  function openAddEditImages(record?: any) {
    setAddEditImagesOpen(true);
    getCarImages(record.id);
    setRecordId(record?.id);
  }

  function getCarImages(id: number) {
    setLoadCarServicesImages(true);
    let url = `car-images/?car_service=${id}`;
    GetReq(url).then((res) => {
      setLoadCarServicesImages(false);
      if (StatusSuccessCodes.includes(res.status)) {
        setCarImagesList(res.data.results);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }
  function handleCancel() {
    setAddEditModalOpen(false);
    AddEditCarServiceForm.resetFields();
    setCarsFileList([]);
    setAddEditImagesOpen(false);
    setImageUrl(undefined);
    setMake(undefined);
  }

  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setCarsFileList(newFileList);

  const handleImagesUpload = (e: any) => {
    let imageData = new FormData();
    imageData.append("image", e?.file?.originFileObj);
    imageData.append("car_service", JSON.stringify(recordId));
    setUploadingImage(true);
    PostReq(`car-images/`, imageData).then((res) => {
      setUploadingImage(false);
      if (StatusSuccessCodes.includes(res.status)) {
        messageApi.success("Image Added Successfully");
        getCarImages(recordId ? recordId : 0);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  };
  const handleImagesChange = (e: any, record: any) => {
    let imageData = new FormData();
    imageData.append("image", e?.file?.originFileObj);
    imageData.append("car_service", JSON.stringify(recordId));
    setUploadingImage(true);
    PatchReq(`car-images/${record.id}/`, imageData).then((res) => {
      setUploadingImage(false);
      if (StatusSuccessCodes.includes(res.status)) {
        messageApi.success("Image Changed Successfully");
        getCarImages(recordId ? recordId : 0);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  };

  function addEditCarService(values: any) {
    const data = new FormData();
    for (const key in values) {
      if (key === "image" && typeof values[key] === "string") {
        continue;
      } else {
        data.append(`${key}`, values[key]);
      }
    }
    setPostEidetRequestLoading(true);
    isEdit
      ? PatchReq(`car-services/${recordId}/`, data).then((res) => {
          setPostEidetRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Car Service Updated Successfully");
            getCarServicesList();
            handleCancel();
          } else {
            res?.errors.forEach((err: any) => {
              messageApi.error(
                `${err.attr ? err.attr + ":" + err.detail : err.detail} `
              );
            });
          }
        })
      : PostReq(`car-services/`, data).then((res) => {
          setPostEidetRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Car Service Added Successfully");
            getCarServicesList();
            handleCancel();
          } else {
            res?.errors.forEach((err: any) => {
              messageApi.error(
                `${err.attr ? err.attr + ":" + err.detail : err.detail} `
              );
            });
          }
        });
  }

  const carImagesFile = (e: any) => {
    setCarsFileList(e.fileList);
    return e?.file?.originFileObj;
  };

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

  function carModelsSearch(make?: any, search?: any) {
    let url = `car-models/?limit=${9999}`;
    search ? (url += `&search=${search}`) : null;
    make ? (url += `&make=${make}`) : null;
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
        setCarModelsDropDown(list);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }

  function onCarModelSearch(value: any) {
    carModelsSearch(make, value);
  }

  return (
    <Fragment>
      {contextHolder}
      <div className="w-full h-fit bg-[#363B5E] py-8 px-5 flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row justify-between items-center content-center">
        <div className="flex flex-row flex-wrap gap-5 w-fit ">
          <h2 className="text-xl text-[white] font-semibold">Car Services</h2>
        </div>
        <Button
          style={{
            backgroundColor: "#363B5E",
            borderColor: "#F1DF78",
          }}
          className=" text-white"
          onClick={openAddModel}
        >
          Add New
        </Button>
        <Modal
          open={addEditImagesOpen}
          title="Add / Edit Car Service Images"
          onCancel={handleCancel}
          width={700}
          maskClosable={false}
          okButtonProps={{ style: { display: "none" } }}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <div className="m-5 flex flex-auto items-center w-full">
            {carImagesList.length >= 10 ? null : (
              <Upload
                maxCount={1}
                accept=".png, .jpeg"
                style={{ width: "100%" }}
                className="flex flex-col cursor-pointer avatar-uploader"
                fileList={carsFileList}
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
            dataSource={carImagesList}
            loading={loadCarServicesImages}
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
          title={isEdit ? "Edit Car Service" : "Add New Car Service"}
          onCancel={handleCancel}
          width={700}
          maskClosable={false}
          okButtonProps={{ style: { display: "none" } }}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <Form
            form={AddEditCarServiceForm}
            layout="vertical"
            onFinish={addEditCarService}
          >
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row gap-2 justify-between">
              <Form.Item
                label="Make"
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
                  onSelect={(e) => {
                    setMake(e);
                    carModelsSearch(e, null);
                  }}
                />
              </Form.Item>
              <Form.Item
                label="Model"
                name="model"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Select
                  showSearch
                  placeholder="Select Car Model"
                  onSearch={onCarModelSearch}
                  filterOption={false}
                  optionFilterProp="children"
                  options={carModelsDropDown}
                  allowClear={true}
                  onClear={() => carModelsSearch()}
                />
              </Form.Item>

              <Form.Item
                label="Year"
                name="year"
                rules={[{ required: true }]}
                className="w-full"
              >
                <InputNumber className="w-full" />
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
                label="Number Of Seats"
                name="number_of_seats"
                rules={[{ required: true }]}
                className="w-full"
              >
                <InputNumber
                  min={1}
                  className="w-full"
                  placeholder="Available No. Of Seats"
                />
              </Form.Item>
              <Form.Item
                label="Color"
                name="color"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Input placeholder="Enter Car Color" />
              </Form.Item>
              <Form.Item
                label="Cool"
                name="cool"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Select placeholder="A/C Working?">
                  <Select.Option key="active" value={true}>
                    Active
                  </Select.Option>
                  <Select.Option key="inActive" value={false}>
                    InActive
                  </Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Car Type"
                name="type"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Input placeholder="eg: SUV,Sedan,..." />
              </Form.Item>
            </div>
            <Form.Item
              label="Image"
              name="image"
              getValueFromEvent={carImagesFile}
              rules={[{ required: true }]}
            >
              <Upload
                maxCount={1}
                accept=".png, .jpeg"
                listType="picture-card"
                style={{ width: "100%" }}
                className="flex flex-col cursor-pointer avatar-uploader"
                fileList={carsFileList}
                onPreview={handlePreview}
                onChange={handleChange}
              >
                {carsFileList.length >= 1 ? null : carsFileList.length === 0 &&
                  imageUrl === undefined ? (
                  <div>
                    <BiPlus
                      size={20}
                      color="rgba(218, 222, 227, 1)"
                      className="mx-[250px]"
                    />
                    <div>Upload</div>
                  </div>
                ) : (
                  <Image
                    src={imageUrl}
                    alt="Car Image"
                    preview={false}
                    fallback="/images/noPreview.jpeg"
                  />
                )}
              </Upload>
            </Form.Item>
            {previewImage && (
              <Image
                preview={{
                  visible: previewOpen,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  afterOpenChange: (visible) => !visible && setPreviewImage(""),
                }}
                src={previewImage}
                alt="Preview Image"
              />
            )}
            <SubmitButton
              form={AddEditCarServiceForm}
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
              <Form.Item name="make">
                <Select
                  showSearch
                  placeholder="Select Car Maker"
                  onSearch={onCarMakerSearch}
                  filterOption={false}
                  optionFilterProp="children"
                  options={carMakersDropDown}
                  allowClear={true}
                  onClear={() => carMakersSearch()}
                  onSelect={(e) => {
                    setMake(e);
                    carModelsSearch(e, null);
                  }}
                />
              </Form.Item>
              <Form.Item name="model">
                <Select
                  showSearch
                  placeholder="Select Car Model"
                  onSearch={onCarModelSearch}
                  filterOption={false}
                  optionFilterProp="children"
                  options={carModelsDropDown}
                  allowClear={true}
                  onClear={() => carModelsSearch()}
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
            dataSource={carServicesList}
            loading={loadCarServicesList}
            columns={columns}
            rowKey={"id"}
            scroll={{ x: 0 }}
            pagination={{
              current: currentPage,
              total: carServicesCount,
              pageSize: 10,
              showTotal(total, range) {
                return `${range[0]}-${range[1]} of ${total} items`;
              },
              onChange: (page, pageSize) => {
                getCarServicesList(page, pageSize);
              },
            }}
          />
        </div>
      </div>
    </Fragment>
  );
}

export default isAuth(CarServicesPage);

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
