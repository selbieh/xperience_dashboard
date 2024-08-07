"use client";
import { Button, Form, Image, Input, Skeleton, message } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [otpDisabled, setOtpDisabled] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("currentUser");
      let isAdmin = isAuth !== null ? JSON.parse(isAuth) : "";
      if (typeof isAdmin !== "string" && isAdmin?.user?.is_staff) {
        router.push("/dashboard");
      } else {
      }
    }
  }, [router]);

  const [form] = Form.useForm();
  const onFinish = (values: any) => {
    setLoading(true);
    axios
      .post(`https://api.xperiences.vip/api/token/`, values)
      .then(async function (response) {
        setLoading(false);

        if (response?.data?.user?.is_staff) {
          localStorage.setItem("currentUser", JSON.stringify(response?.data));
          router.push("./dashboard");
        } else {
          messageApi.error(
            "You Are Not Admin! You Can't Login To The Dashboard"
          );
          form.setFieldValue("otp", null);
          setOtpDisabled(true);
        }
      })
      .catch(function (error) {
        setLoading(false);
        messageApi.open({
          type: "error",
          content: error?.response?.data?.errors[0].detail,
        });
      });
    otpDisabled;
    //   ? axios
    //       .post(
    //         `https://impressive-domini-royals-1be52931.koyeb.app/api/auth/mobile/`,
    //         values
    //       )
    //       .then(async function (response) {
    //         setLoading(false);
    //         messageApi.success(response.data.detail);
    //         setOtpDisabled(false);
    //       })
    //       .catch(function (error) {
    //         setLoading(false);

    //         messageApi.open({
    //           type: "error",
    //           content: error?.response?.data?.detail,
    //         });
    //       })
    //   : axios
    //       .post(
    //         `https://impressive-domini-royals-1be52931.koyeb.app/api/token/`,
    //         values
    //       )
    //       .then(async function (response) {
    //         setLoading(false);

    //         if (response?.data?.user?.is_staff) {
    //           localStorage.setItem(
    //             "currentUser",
    //             JSON.stringify(response?.data)
    //           );
    //           router.push("./dashboard");
    //         } else {
    //           messageApi.error(
    //             "You Are Not Admin! You Can't Login To The Dashboard"
    //           );
    //           form.setFieldValue("otp", null);
    //           setOtpDisabled(true);
    //         }
    //       })
    //       .catch(function (error) {
    //         setLoading(false);
    //         messageApi.open({
    //           type: "error",
    //           content: error?.response?.data?.errors[0].detail,
    //         });
    //       });
  };
  return (
    <div>
      {contextHolder}
      <div className="flex flex-col sm:flex-row items-center md:items-start sm:justify-center md:justify-start flex-auto min-w-0 h-screen">
        <div className="bg-[#181C33] md:flex md:items-center md:justify-end w-full sm:w-auto md:h-full md:w-1/4 py-8 px-4 sm:p-12 md:p-16 sm:rounded-2xl md:rounded-none sm:shadow md:shadow-none sm:bg-card">
          <div className="w-full max-w-80 sm:w-80 mx-auto sm:mx-0">
            <div className="mt-8 text-4xl font-extrabold tracking-tight leading-tight text-[white]">
              <Image
                src="/images/fullXLogoGoldG.png"
                alt="XperienceVIP"
                // width={"70%"}
                // height={"100%"}
                className=" bg-transparent"
                preview={false}
              />
              <br />
              CRM.
              <br />
              Sign in
            </div>
            <Form
              className="mt-8"
              layout="vertical"
              form={form}
              onFinish={onFinish}
              style={{ maxWidth: 600 }}
            >
              <Form.Item
                name="mobile"
                label={<p className="text-white">Mobile</p>}
                rules={[
                  { required: true, message: "Please input your mobile!" },
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
              >
                <Input
                  style={{
                    backgroundColor: "white",
                    color: "black",
                  }}
                  // disabled={!otpDisabled}
                />
              </Form.Item>
              {/* {!otpDisabled ? (
                <Form.Item
                  name="token"
                  label={<p className="text-white">OTP</p>}
                  rules={[{ required: true, message: "Please Enter OTP!" }]}
                >
                  <Input.OTP disabled={otpDisabled} length={6} />
                </Form.Item>
              ) : (
                <></>
              )} */}
              <Form.Item>
                <Button
                  className="flex justify-center w-60 "
                  type="primary"
                  size="large"
                  htmlType="submit"
                  style={{
                    backgroundColor: "#292D4A",
                    borderColor: "#F1DF78",
                  }}
                  loading={loading}
                >
                  {otpDisabled ? "Send OTP" : "Sign In"}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
        <div className="flex flex-row h-full w-full">
          <div className="relative hidden md:flex flex-auto items-center justify-center w-1/4 h-full  lg:px-28 overflow-hidden  bg-[url('/images/Untitled1.png')] [background-size:100%_100%]"></div>
          <div className="relative hidden md:flex flex-auto items-center justify-center w-1/4 h-full  lg:px-28 overflow-hidden bg-[url('/images/Untitled11.png')] [background-size:100%_100%]"></div>
          <div className="relative hidden md:flex flex-auto items-center justify-center w-1/4 h-full  lg:px-28 overflow-hidden bg-[url('/images/Untitled111.png')] [background-size:100%_100%]"></div>
          <div className="relative hidden md:flex flex-auto items-center justify-center w-1/4 h-full  lg:px-28 overflow-hidden bg-[url('/images/Untitled1111.png')] [background-size:100%_100%]"></div>
        </div>
      </div>
    </div>
  );
}
