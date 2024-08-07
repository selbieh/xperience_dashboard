"use client";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  DropdownProps,
  Layout,
  Menu,
  MenuProps,
  message,
  notification,
  Space,
} from "antd";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import {
  AiOutlineLogout,
  AiOutlineMenuFold,
  AiOutlineMenuUnfold,
  AiOutlineTransaction,
} from "react-icons/ai";
import { BiSolidCarGarage } from "react-icons/bi";
import { BsInfoCircleFill } from "react-icons/bs";
import { CgOptions } from "react-icons/cg";
import { FaRegUserCircle } from "react-icons/fa";
import { GrServices } from "react-icons/gr";
import { IoCarSportOutline } from "react-icons/io5";
import { LuUsers2 } from "react-icons/lu";
import { MdCircleNotifications, MdNotifications } from "react-icons/md";
import { PiTrademark } from "react-icons/pi";
import { RiHotelFill, RiLogoutBoxRLine } from "react-icons/ri";
import { RxDashboard } from "react-icons/rx";
import { SiHiltonhotelsandresorts } from "react-icons/si";
import { ToastContainer } from "react-toastify";

import { GetReq, PatchReq } from "../api/api";
import { StatusSuccessCodes } from "../api/successStatus";
import { firebaseCloudMessaging } from "../config/firebase";
import { CiDiscount1 } from "react-icons/ci";

const { Header, Sider, Content } = Layout;
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fcmToken, setFcmToken] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<string>("");
  const getToken = async () => {
    try {
      const token = await firebaseCloudMessaging.init();
      if (token) {
        await firebaseCloudMessaging.getMessage();
        setFcmToken(token);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) =>
          console.log("service worker registered Successfully", registration)
        )
        .catch((error) => {
          console.log("service worker registration Failed");
        });

      navigator.serviceWorker.addEventListener("message", (event) => {
        setMessages(event.data.notification.title);
        openNotification(event.data.notification);
      });
    }

    async function setToken() {
      await getToken();
    }

    setToken();
    getListNotifications();
  }, [messages]);
  const router = useRouter();
  const pathname = usePathname();
  const [prefix_pathname, setPrefix_pathname] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<any>({});
  const items: MenuProps["items"] = [];
  const [notifications, setNotifications] = useState<any>([]);
  const [open, setOpen] = useState(false);
  const [numberNotification, setNumberNotification] = useState(0);
  const [apiNotification, contextHolder] = notification.useNotification();
  const [messageApi, contextHolderMessage] = message.useMessage();
  const isEffectCalledRef = useRef(false);
  const [userName, setUserName] = useState<string>("");
  useEffect(() => {
    // requestPermission();

    if (typeof window !== "undefined") {
      const currentUser: any = localStorage.getItem("currentUser");
      setUserName(currentUser?.user?.name ? currentUser?.user?.name : "Admin");
    }

    isMobile && isMobile ? setCollapsed(!collapsed) : setCollapsed(collapsed);
    setPrefix_pathname(pathname?.slice(0, 3));

    let current_user = null;
    if (current_user != null) {
      setCurrentUser(current_user);
      if (!isEffectCalledRef.current) {
        isEffectCalledRef.current = true;
      }
    }
  }, [router, currentUser.id]);

  function getListNotifications() {
    let numberNotif = 0;
    GetReq("admin-notifications/?limit=10000&offset=0").then((res) => {
      if (StatusSuccessCodes.includes(res?.status)) {
        setNotifications(
          res?.data?.results?.map((item: any) => {
            setNumberNotification((numberNotif += item.read ? 0 : 1));
            return {
              key: item.id,
              onClick: () => {
                !item.read && markAsRead(item.id);
              },
              label: (
                <div
                  className="flex justify-between"
                  style={{
                    backgroundColor: item.read ? "white" : "#f3f6f4",
                    height: "70px",
                    padding: "7px",
                    borderRadius: "5px",
                  }}
                >
                  <Space className="flex flex-row">
                    <MdNotifications size={15} />
                    <span className="flex flex-col">
                      <b className="w-[150px] sm:w-[250px] lg:w-[400px] xl:w-[400px] ">
                        {" "}
                        {item.title}
                      </b>
                      <>{item.body}</>
                      <small>
                        {new Date(item.created_at).toLocaleString("CA", {
                          hour12: true,
                        })}
                      </small>
                    </span>
                  </Space>
                  {!item.read && <Badge status="processing" />}
                </div>
              ),
            };
          })
        );
      }
    });
  }

  function markAsRead(id: string) {
    PatchReq(`admin-notifications/${id}`, { read: true }).then((res) => {
      if (StatusSuccessCodes.includes(res?.status)) {
        getListNotifications();
      }
    });
  }

  const openNotification = (description: any) => {
    apiNotification.info({
      message: description.title,
      description: description.body,
      placement: "topRight",
      icon: <BsInfoCircleFill color="#292D4A" />,
    });
  };

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    setOpen(true);
  };

  const handleOpenChange: DropdownProps["onOpenChange"] = (nextOpen, info) => {
    if (info.source === "trigger" || nextOpen) {
      setOpen(nextOpen);
    }
  };

  function logOut() {
    localStorage.removeItem("currentUser");
    setCurrentUser({});
    router.push("/login");
  }

  const itemsProfile: MenuProps["items"] = [
    {
      label: (
        <span>
          <Space>
            Hi
            {userName}
          </Space>
        </span>
      ),
      key: "0",
    },
    {
      label: (
        <div className="flex h-48px  items-center" onClick={() => logOut()}>
          <Space>
            <AiOutlineLogout />
            Logout
          </Space>
        </div>
      ),
      key: "3",
    },
  ];

  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {contextHolder}
      {contextHolderMessage}
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          width={240}
          theme="light"
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            overflow: "hidden",
            height: "100vh",
            position: "fixed",
            top: 0,
            bottom: 0,
            zIndex: 999,
            backgroundColor: "#292D4A",
          }}
        >
          <div className="flex justify-center  py-3 w-fit m-auto">
            <Image
              src="/images/XLogoGoldG.png"
              alt="XperienceVIP"
              width={90}
              height={60}
              style={{ maxWidth: "50%" }}
              className=" bg-transparent"
            />
          </div>
          <Menu
            mode="inline"
            defaultSelectedKeys={[pathname]}
            style={{
              backgroundColor: "#292D4A",
            }}
            // selectedKeys={[
            //   pathname,
            //   pathname.includes("carServices")
            //     ? `/dashboard/carServices`
            //     : pathname.includes("hotelServices")
            //     ? `/dashboard/hotelServices`
            //     : pathname.includes("hotelServices")
            //     ? `/dashboard/hotelServices`
            //     : "",
            // ]}
            items={[
              {
                key: `/dashboard`,
                label: (
                  <Link href={`/dashboard`}>
                    <span className="text-white">
                      <Space>
                        <RxDashboard
                          size={collapsed ? 25 : 20}
                          style={{ marginInlineEnd: "10px" }}
                          color="white"
                        />
                        Dashboard
                      </Space>
                    </span>
                  </Link>
                ),
              },
              // {
              //   key: `/dashboard/reservations`,
              //   label: (
              //     <Link href={`/dashboard/reservations`}>
              //       <span className="text-white">
              //         <Space>
              //           <TbReservedLine
              //             size={collapsed ? 25 : 20}
              //             style={{ marginInlineEnd: "10px" }}
              //             color="white"
              //           />
              //           Reservations
              //         </Space>
              //       </span>
              //     </Link>
              //   ),
              // },
              {
                key: `/dashboard/carMakers`,
                label: (
                  <Link href={`/dashboard/carMakers`}>
                    <span className="text-white">
                      <Space>
                        <PiTrademark
                          size={collapsed ? 25 : 20}
                          style={{ marginInlineEnd: "10px" }}
                          color="white"
                        />
                        Car Makers
                      </Space>
                    </span>
                  </Link>
                ),
              },
              {
                key: `/dashboard/carModels`,
                label: (
                  <Link href={`/dashboard/carModels`}>
                    <span className="text-white">
                      <Space>
                        <BiSolidCarGarage
                          size={collapsed ? 25 : 20}
                          style={{ marginInlineEnd: "10px" }}
                          color="white"
                        />
                        Car Models
                      </Space>
                    </span>
                  </Link>
                ),
              },
              {
                key: `/dashboard/carServices`,
                label: (
                  <Link href={`/dashboard/carServices`}>
                    <span className="text-white">
                      <Space>
                        <IoCarSportOutline
                          size={collapsed ? 25 : 20}
                          style={{ marginInlineEnd: "10px" }}
                          color="white"
                        />
                        Car Services
                      </Space>
                    </span>
                  </Link>
                ),
              },
              {
                key: `/dashboard/carReservations`,
                label: (
                  <Link href={`/dashboard/carReservations`}>
                    <span className="text-white">
                      <Space>
                        <IoCarSportOutline
                          size={collapsed ? 25 : 20}
                          style={{ marginInlineEnd: "10px" }}
                          color="white"
                        />
                        Car Reservations
                      </Space>
                    </span>
                  </Link>
                ),
              },
              {
                key: `/dashboard/hotelServicesFeatures`,
                label: (
                  <Link href={`/dashboard/hotelServicesFeatures`}>
                    <span className="text-white">
                      <Space>
                        <RiHotelFill
                          size={collapsed ? 25 : 20}
                          style={{ marginInlineEnd: "10px" }}
                          color="white"
                        />
                        Hotel Service Features
                      </Space>
                    </span>
                  </Link>
                ),
              },
              {
                key: `/dashboard/hotelServices`,
                label: (
                  <Link href={`/dashboard/hotelServices`}>
                    <span className="text-white">
                      <Space>
                        <SiHiltonhotelsandresorts
                          size={collapsed ? 25 : 20}
                          style={{ marginInlineEnd: "10px" }}
                          color="white"
                        />
                        Hotel Services
                      </Space>
                    </span>
                  </Link>
                ),
              },
              {
                key: `/dashboard/hotelReservations`,
                label: (
                  <Link href={`/dashboard/hotelReservations`}>
                    <span className="text-white">
                      <Space>
                        <SiHiltonhotelsandresorts
                          size={collapsed ? 25 : 20}
                          style={{ marginInlineEnd: "10px" }}
                          color="white"
                        />
                        Hotel Reservations
                      </Space>
                    </span>
                  </Link>
                ),
              },
              {
                key: `/dashboard/subscriptionOptions`,
                label: (
                  <Link href={`/dashboard/subscriptionOptions`}>
                    <span className="text-white">
                      <Space>
                        <GrServices
                          size={collapsed ? 25 : 20}
                          style={{ marginInlineEnd: "10px" }}
                          color="white"
                        />
                        Subscription Options
                      </Space>
                    </span>
                  </Link>
                ),
              },
              {
                key: `/dashboard/serviceOptions`,
                label: (
                  <Link href={`/dashboard/serviceOptions`}>
                    <span className="text-white">
                      <Space>
                        <CgOptions
                          size={collapsed ? 25 : 20}
                          style={{ marginInlineEnd: "10px" }}
                          color="white"
                        />
                        Service Options
                      </Space>
                    </span>
                  </Link>
                ),
              },
              {
                key: `/dashboard/transactions`,
                label: (
                  <Link href={`/dashboard/transactions`}>
                    <span className="text-white">
                      <Space>
                        <AiOutlineTransaction
                          size={collapsed ? 25 : 20}
                          style={{ marginInlineEnd: "10px" }}
                          color="white"
                        />
                        Transactions
                      </Space>
                    </span>
                  </Link>
                ),
              },
              {
                key: `/dashboard/promocode`,
                label: (
                  <Link href={`/dashboard/promocode`}>
                    <span className="text-white">
                      <Space>
                        <CiDiscount1
                          size={collapsed ? 25 : 20}
                          style={{ marginInlineEnd: "10px" }}
                          color="white"
                        />
                        Promo Codes
                      </Space>
                    </span>
                  </Link>
                ),
              },
              {
                key: `/dashboard/users`,
                label: (
                  <Link href={`/dashboard/users`}>
                    <span className="text-white">
                      <Space>
                        <LuUsers2
                          size={collapsed ? 25 : 20}
                          style={{ marginInlineEnd: "10px" }}
                          color="white"
                        />
                        Users
                      </Space>
                    </span>
                  </Link>
                ),
              },
            ]}
          />

          <Menu
            // title={t("settings")}
            className="absolute bottom-0"
            mode="inline"
            defaultSelectedKeys={[pathname]}
            selectedKeys={[pathname]}
            style={{
              backgroundColor: "#292D4A",
            }}
            items={[
              {
                key: `#2`,
                label: (
                  <div onClick={() => logOut()}>
                    <span className="text-white">
                      <Space>
                        <RiLogoutBoxRLine
                          size={collapsed ? 25 : 20}
                          style={{ marginInlineEnd: "10px" }}
                          color="white"
                        />
                        Logout
                      </Space>
                    </span>
                  </div>
                ),
              },
            ]}
          />
        </Sider>
        <Layout>
          <Header
            className="flex justify-between items-center align-middle h-[66px] bg-[#fff] p-2"
            style={{
              padding: isMobile ? "0 10px" : "0 50px",
              position: "sticky",
              top: 0,
              zIndex: 998,
              width: "100%",
              display: "flex",
              alignItems: "center",
              backgroundColor: "#292D4A",
            }}
          >
            <Button
              type="text"
              icon={
                collapsed ? (
                  <AiOutlineMenuUnfold size={20} color="white" />
                ) : (
                  <AiOutlineMenuFold size={20} color="white" />
                )
              }
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
              className={collapsed ? "left-[80px]" : "left-[200px]"}
            />
            <div className="flex items-center">
              <Space size={24}>
                <Dropdown
                  menu={{
                    items: notifications,
                    onClick: (e) => handleMenuClick(e),
                  }}
                  trigger={["click"]}
                  overlayClassName="w-45 h-60 overflow-y-auto shadow-2xl rounded-lg"
                  open={open}
                  onOpenChange={handleOpenChange}
                  arrow={true}
                >
                  <a className="p-1" onClick={(e) => e.preventDefault()}>
                    <Space className="mt-3">
                      <Badge count={numberNotification} size="small">
                        <MdCircleNotifications
                          size={24}
                          className="cursor-pointer text-black"
                          color="white"
                        />
                      </Badge>
                    </Space>
                  </a>
                </Dropdown>

                <Dropdown menu={{ items: itemsProfile }}>
                  <a onClick={(e) => e.preventDefault()}>
                    <Space>
                      <Avatar
                        size={34}
                        icon={<FaRegUserCircle color="white" />}
                      />
                      {isMobile ? "" : currentUser ? currentUser.name : "Admin"}
                    </Space>
                  </a>
                </Dropdown>
              </Space>
            </div>
          </Header>
          <Content
            style={{
              minHeight: 280,
            }}
            className={collapsed ? "pl-[80px]" : "pl-[240px]"}
          >
            <Suspense>
              <ToastContainer />
              {children}
            </Suspense>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
