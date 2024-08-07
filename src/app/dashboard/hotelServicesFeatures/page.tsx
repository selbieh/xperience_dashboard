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
  // Image,
  TableColumnsType,
  Upload,
  UploadFile,
  GetProp,
  UploadProps,
} from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { MdDeleteForever } from "react-icons/md";

import isAuth from "../../../../components/isAuth";
import TextArea from "antd/es/input/TextArea";
import { BiPlus } from "react-icons/bi";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

function HotelServiceFeaturesPage() {
  const columns: TableColumnsType<any> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
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
          title="Delete Hotel Feature"
          description="Are You Sure You Want To Delete This Hotel Feature?"
          onConfirm={() => {
            deleteHotelFeature(record);
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

  const [previewImage, setPreviewImage] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [iconFileList, setIconsFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<any>();

  function deleteHotelFeature(record: any) {
    DeleteReq(`hotel-service-features/${record.id}/`).then((res) => {
      if (StatusSuccessCodes.includes(res.status)) {
        messageApi.success("Deleted Successfully");
        getHotelFeaturesList();
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

  const [hotelFeaturesList, setHotelFeaturesList] = useState<any[]>([]);
  const [hotelFeaturesListCount, setHotelFeaturesCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [AddEditHotelFeatureForm] = Form.useForm();
  const [postEditRequestLoading, setPostEditRequestLoading] =
    useState<any>(false);
  const [addEditModalOpen, setAddEditModalOpen] = useState<any>(false);
  const [isEdit, setIsEdit] = useState<any>(false);
  const [recordId, setRecordId] = useState<number | undefined>(undefined);

  useEffect(() => {
    getHotelFeaturesList();
  }, []);
  const [loadHotelFeaturesList, setLoadHotelFeaturesList] =
    useState<any>(false);

  function getHotelFeaturesList(page: number = 1, pageSize: number = 10) {
    setCurrentPage(page);
    let url = `hotel-service-features/?limit=${pageSize}&offset=${
      (page - 1) * pageSize
    }`;
    params.forEach((value: any, key: any) => (url += `&${key}=${value}`));
    setLoadHotelFeaturesList(true);
    GetReq(url).then((res) => {
      setLoadHotelFeaturesList(false);
      if (StatusSuccessCodes.includes(res.status)) {
        setHotelFeaturesList(res.data.results);
        setHotelFeaturesCount(res.data.count);
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

    if (values.status !== undefined) {
      params.set("status", values.status);
    } else {
      params.delete("status");
    }

    replace(`${pathname}?${params.toString()}`);
    getHotelFeaturesList();
  }

  const onSearchReset = () => {
    searchForm.resetFields();
    params.has("search") && params.delete("search");
    params.has("is_staff") && params.delete("is_staff");
    replace(`${pathname}`);
    getHotelFeaturesList();
  };

  function openAddEditModel(record?: any) {
    setAddEditModalOpen(true);
    record.id ? setIsEdit(true) : setIsEdit(false);
    setRecordId(record?.id);

    if (record.id) {
      setIconsFileList([
        {
          uid: "1",
          name: "xxx.png",
          url: record.image,
          percent: 33,
        },
      ]);
      AddEditHotelFeatureForm.setFieldsValue(record);
    }
  }

  function handleCancel() {
    setAddEditModalOpen(false);
    AddEditHotelFeatureForm.resetFields();
  }

  function addEditHotelFeatures(values: any) {
    console.log(values);
    setPostEditRequestLoading(true);
    const data = new FormData();
    for (const key in values) {
      if (key === "image" && typeof values[key] === "string") {
        continue;
      } else {
        data.append(`${key}`, values[key]);
      }
    }
    isEdit
      ? PatchReq(`hotel-service-features/${recordId}/`, data).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Updated Successfully");
            handleCancel();
            getHotelFeaturesList();
            setIconsFileList([]);
          } else {
            res?.errors.forEach((err: any) => {
              messageApi.error(
                `${err.attr ? err.attr + ":" + err.detail : err.detail} `
              );
            });
          }
        })
      : PostReq(`hotel-service-features/`, data).then((res) => {
          setPostEditRequestLoading(false);
          if (StatusSuccessCodes.includes(res.status)) {
            messageApi.success("Added Successfully");
            handleCancel();
            getHotelFeaturesList();
            setIconsFileList([]);
          } else {
            res?.errors.forEach((err: any) => {
              messageApi.error(
                `${err.attr ? err.attr + ":" + err.detail : err.detail} `
              );
            });
          }
        });
  }

  const iconImagesFile = (e: any) => {
    setIconsFileList(e.fileList);
    return e?.file?.originFileObj;
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  return (
    <Fragment>
      {contextHolder}
      <div className="w-full h-fit bg-[#363B5E] py-8 px-5 flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row justify-between items-center content-center">
        <div className="flex flex-row gap-5 w-fit ">
          <h2 className="text-xl text-[white] font-semibold">
            Hotel Service Features
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
            isEdit
              ? "Edit Hotel Service Feature"
              : "Add New Hotel Service Feature"
          }
          onCancel={handleCancel}
          width={700}
          maskClosable={false}
          okButtonProps={{ style: { display: "none" } }}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <Form
            form={AddEditHotelFeatureForm}
            layout="vertical"
            onFinish={addEditHotelFeatures}
          >
            <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row xxl:flex-row  gap-2 ">
              <Form.Item
                label="Feature Name"
                name="name"
                rules={[{ required: true }]}
                className="w-full"
              >
                <Input placeholder="Enter Hotel Feature Name" />
              </Form.Item>
            </div>
            <Form.Item
              label="Feature Description"
              name="description"
              rules={[{ required: true }]}
              className="w-full"
            >
              <TextArea placeholder="Enter Feature Description" />
            </Form.Item>
            <Form.Item
              label="Image"
              name="image"
              getValueFromEvent={iconImagesFile}
              rules={[
                { required: true },
                {
                  validator(_, value) {
                    if (value && typeof value !== "string") {
                      const validateDimensions = (value: any) => {
                        return new Promise((resolve, reject) => {
                          const img = new Image();
                          img.src = URL.createObjectURL(value);
                          img.onload = () => {
                            const { width, height } = img;
                            if (width <= 1000 && height <= 1000) {
                              resolve("");
                            } else {
                              reject("false");
                            }
                          };
                        });
                      };
                      return validateDimensions(value);
                    } else {
                      console.log("value");
                      return Promise.resolve();
                    }
                  },
                },
              ]}
            >
              <Upload
                maxCount={1}
                accept=".png, .jpeg"
                listType="picture-card"
                style={{ width: "100%" }}
                className="flex flex-col cursor-pointer avatar-uploader"
                fileList={iconFileList}
                onPreview={handlePreview}
                // onChange={handleChange}
              >
                {iconFileList.length >= 1 ? null : iconFileList.length === 0 &&
                  imageUrl === undefined ? (
                  <div>
                    <BiPlus
                      size={20}
                      color="rgba(218, 222, 227, 1)"
                      className="mx-[250px]"
                    />
                    <div>Upload</div>
                  </div>
                ) : null}
              </Upload>
            </Form.Item>
            {/* {previewImage && (
              <Image
                preview={{
                  visible: previewOpen,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  afterOpenChange: (visible) => !visible && setPreviewImage(""),
                }}
                src={previewImage}
                alt="Preview Image"
              />
            )} */}

            <SubmitButton
              form={AddEditHotelFeatureForm}
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
            dataSource={hotelFeaturesList}
            columns={columns}
            rowKey={"id"}
            scroll={{ x: 0 }}
            loading={loadHotelFeaturesList}
            pagination={{
              current: currentPage,
              total: hotelFeaturesListCount,
              pageSize: 10,
              showTotal(total, range) {
                return `${range[0]}-${range[1]} of ${total} items`;
              },
              onChange: (page, pageSize) => {
                getHotelFeaturesList(page, pageSize);
              },
            }}
          />
        </div>
      </div>
    </Fragment>
  );
}

export default isAuth(HotelServiceFeaturesPage);

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
