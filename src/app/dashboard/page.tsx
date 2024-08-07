"use client";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  message,
  Row,
  Select,
  Statistic,
} from "antd";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { isMobile } from "react-device-detect";

import { useEffect, useRef, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";

import isAuth from "../../../components/isAuth";
import { GetReq } from "../api/api";
import { StatusSuccessCodes } from "../api/successStatus";
import { GoDotFill } from "react-icons/go";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Parameters {
  status?: any;
  created_at_after?: any;
  created_at_before?: any;
  key?: any;
}
const { RangePicker } = DatePicker;
function Dashboard() {
  const [loadStatistics, setLoadStatistics] = useState<boolean>(false);
  const [statisticsData, setStatisticsData] = useState<any>();
  const [statisticsPendingData, setStatisticsPendingData] = useState<any>();
  const [statisticsConfirmedData, setStatisticsConfirmedData] = useState<any>();
  const [statisticsCompletedData, setStatisticsCompletedData] = useState<any>();
  const [statisticsCancelledData, setStatisticsCancelledData] = useState<any>();
  const [messageApi, contextHolder] = message.useMessage();
  const [loadUsersList, setLoadUsersList] = useState<any>(false);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [searchForm] = Form.useForm();
  const [reservationsCount, setReservationsCount] = useState({
    labels: [],
    total_amount: [],
  });
  const [parameters, setParameters] = useState<Parameters>({});
  const [reservationsTotals, setReservationsTotals] = useState({
    labels: [],
    totals: [],
  });
  const isEffectRefreshRef = useRef(false);
  const options = {
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        min: 0,

        ticks: {
          stepSize: 5,
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        tension: 0.1,
      },
    },
    plugins: {
      filler: {
        propagate: false,
      },
    },
    interaction: {
      intersect: true,
    },
  };
  useEffect(() => {
    if (!isEffectRefreshRef.current) {
      getStatistics();
      getStatisticsStatus();
      getUsersList();
      isEffectRefreshRef.current = true;
    }
  }, [parameters]);

  function getStatistics() {
    let url = `filter-reservations/?limit=999999`;
    setLoadStatistics(true);
    GetReq(url).then((res) => {
      setLoadStatistics(false);
      if (StatusSuccessCodes.includes(res.status)) {
        setStatisticsData(res.data);
        setTotalRevenue(
          +res?.data?.total_final_price_car +
            +res?.data?.total_final_price_hotel
        );
        // getStatisticscompleted();
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }
  function getStatisticsStatus() {
    let url = `filter-reservations/?limit=999999`;
    for (let key in parameters) {
      url += `&${key}=${parameters[key as keyof typeof parameters]}`;
    }
    setLoadStatistics(true);
    GetReq(url).then((res) => {
      setLoadStatistics(false);
      if (StatusSuccessCodes.includes(res.status)) {
        setStatisticsCompletedData(res.data);
        mapReports(res.data);
        mapReports2(res.data);
        // getStatisticspending();
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }

  function getUsersList() {
    let url = `user/profile/?limit=99999999&is_staff=false`;
    setLoadUsersList(true);
    GetReq(url).then((res) => {
      setLoadUsersList(false);
      if (StatusSuccessCodes.includes(res.status)) {
        setUsersCount(res.data.count);
      } else {
        res?.errors.forEach((err: any) => {
          messageApi.error(
            `${err.attr ? err.attr + ":" + err.detail : err.detail} `
          );
        });
      }
    });
  }

  const data = {
    labels: reservationsCount.labels,
    datasets: [
      {
        label: "",
        data: reservationsCount.total_amount,
        backgroundColor: [
          "#1BD7B7",
          "#FF5D6B",
          "#E9ECF1",
          "#ffd966",
          "#6fa8dc",
          "#c27ba0",
        ],
      },
    ],
  };

  const doughnutData = {
    labels: reservationsTotals.labels,
    datasets: [
      {
        label: "Total Reservations Revenue",
        data: reservationsTotals.totals,
        backgroundColor: ["#1BD7B7", "#FF5D6B"],
        borderColor: ["#1BD7B7", "#FF5D6B"],
        borderWidth: 1,
      },
    ],
  };
  function mapReports2(statistics: any) {
    // if (statistics != null) {
    let labels: any = [
      "Car Reservations Revenue",
      "Hotel Reservations Revenue",
    ];

    let totals: any = [
      statistics?.total_final_price_car,
      statistics?.total_final_price_hotel,
    ];

    setReservationsTotals({ labels: labels, totals: totals });
    // } else {
    //   setSubscriptionUsers({ labels: [], total_amount: [] });
    // }
  }
  function mapReports(statistics: any) {
    // if (statistics != null) {
    let labels: any = ["Total Car Reservations", "Total Hotel Reservations"];

    let totals: any = [
      statistics?.total_car_reservations,
      statistics?.total_hotel_reservations,
    ];

    setReservationsCount({ labels: labels, total_amount: totals });
    // } else {
    //   setSubscriptionUsers({ labels: [], total_amount: [] });
    // }
  }
  const style: React.CSSProperties = {
    padding: "8px 0",
  };

  function applySearch(values: any) {
    let params: any = {};
    if (values?.date) {
      params["created_at_after"] = values?.date[0].format("YYYY-MM-DD");
      params["created_at_before"] = values?.date[1].format("YYYY-MM-DD");
      setParameters((prev: any) => {
        return { ...prev, ...params };
      });
    }
    if (values?.status) {
      params["status"] = values?.status;
      setParameters((prev: any) => {
        return { ...prev, ...params };
      });
    }
    isEffectRefreshRef.current = false;
  }

  const onSearchReset = () => {
    searchForm.resetFields();
    setParameters({});
    isEffectRefreshRef.current = false;
  };
  // const doughnutPlugin = {
  //   id: "myCustomPlugin",
  //   afterDatasetsDraw: function (chart: any) {
  //     const ctx = chart.ctx;
  //     const canvas = chart.canvas;
  //     const width = chart.width;
  //     const height = chart.height;

  //     ctx.restore();
  //     const fontSize = (height / 114).toFixed(2);
  //     ctx.font = `${fontSize}em Arial`;
  //     ctx.textBaseline = "middle";
  //     const text = totalRevenue.toString();
  //     const textX = Math.round((width - ctx.measureText(text).width) / 2);
  //     const textY = height / 2;

  //     ctx.fillText(text, textX, textY);
  //     ctx.save();
  //   },
  // };

  return (
    <div>
      {contextHolder}
      <Card className=" border rounded-lg bg-transparent">
        <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row  justify-center items-center content-center pb-5">
          <Statistic
            title="No of Users"
            value={usersCount}
            className="shadow-md bg-white border rounded-lg flex flex-col items-center align-middle justify-center w-fit p-2  mx-5"
          />
          <Statistic
            title="Total Reservations Count"
            value={
              statisticsData?.total_hotel_reservations +
              statisticsData?.total_car_reservations
            }
            className="shadow-md  bg-white border rounded-lg flex flex-col items-center align-middle justify-center w-fit p-2 m-2 mx-5"
          />
          <Statistic
            title="Total Car Reservations Count"
            value={statisticsData?.total_car_reservations}
            className="shadow-md  bg-white border rounded-lg flex flex-col items-center align-middle  w-fit p-2 m-2 mx-5"
          />

          <Statistic
            title="Total Hotel Reservations Count"
            value={statisticsData?.total_hotel_reservations}
            className="shadow-md  bg-white border rounded-lg flex flex-col items-center align-middle  w-fit p-2 m-2 mx-5"
          />
        </div>
        <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row justify-center items-center content-center">
          <Statistic
            prefix={"$"}
            title="Total Reservations Revenue"
            value={
              statisticsData?.total_final_price_car +
              statisticsData?.total_final_price_hotel
            }
            className="shadow-md  bg-white border rounded-lg flex flex-col items-center align-middle  w-fit p-2 m-2 mx-5"
          />
          <Statistic
            prefix={"$"}
            title="Total Car Reservations Revenue"
            value={statisticsData?.total_final_price_car}
            className="shadow-md  bg-white border rounded-lg flex flex-col items-center align-middle  w-fit p-2 m-2 mx-5"
          />
          <Statistic
            prefix={"$"}
            title="Total Hotel Reservations Revenue"
            value={statisticsData?.total_final_price_hotel}
            className="shadow-md  bg-white border rounded-lg flex flex-col items-center align-middle  w-fit p-2 m-2 mx-5"
          />
        </div>
      </Card>
      <Card className="p-5 border rounded-lg overflow-auto">
        <div>
          <div>
            <Form
              form={searchForm}
              onFinish={applySearch}
              layout="inline"
              className={
                "gap-3 mb-5 items-baseline flex " +
                (isMobile ? " flex-col" : "flex-row")
              }
            >
              <Form.Item name="status">
                <Select placeholder="Select Status" className="w-fit">
                  <Select.Option
                    key="WAITING_FOR_PAYMENT"
                    value={"WAITING_FOR_PAYMENT"}
                  >
                    Waiting For Payment
                  </Select.Option>
                  <Select.Option key="CONFIRMED" value={"CONFIRMED"}>
                    Confirmed
                  </Select.Option>
                  <Select.Option key="COMPLETED" value={"COMPLETED"}>
                    Completed
                  </Select.Option>
                  <Select.Option key="CANCELLED" value={"CANCELLED"}>
                    Cancelled
                  </Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="date">
                <RangePicker />
              </Form.Item>
              <Button
                htmlType="submit"
                style={{
                  backgroundColor: "#363B5E",
                  borderColor: "#F1DF78",
                }}
                className=" text-white mx-2"
              >
                Apply
              </Button>
              <Button onClick={onSearchReset}>Reset</Button>
            </Form>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row  ">
            <div className="w-full h-[350px] ">
              <Bar options={options} data={data} />
            </div>
            <div style={{ width: "200px" }}>
              <Doughnut
                data={doughnutData}
                options={{ cutout: "80%" }}
                // plugins={[doughnutPlugin]}
              />
              <h4 className="flex flex-row gap-2">
                <GoDotFill size={30} />
                {totalRevenue} {"Total Revenue"}
              </h4>
              <h4 className="flex flex-row gap-2">
                <GoDotFill size={30} color={"#1BD7B7"} />
                {statisticsData?.total_final_price_car}{" "}
                {"Car Reservations Revenue"}
              </h4>
              <h4 className="flex flex-row gap-2">
                <GoDotFill size={30} color={"#FF5D6B"} />
                {statisticsData?.total_final_price_hotel}{" "}
                {"Hotel Reservations Revenue"}
              </h4>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default isAuth(Dashboard);
