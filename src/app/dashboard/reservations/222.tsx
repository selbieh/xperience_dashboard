"use client";
import { Button, message } from "antd";
import { Fragment } from "react";
import isAuth from "../../../../components/isAuth";

function ReservationsPage() {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <Fragment>
      {contextHolder}
      <div className="w-full h-fit bg-[#363B5E] py-8 px-5 flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row justify-between items-center content-center">
        <div>
          <div className="flex flex-row flex-wrap gap-5 w-fit ">
            <h2 className="text-xl text-[white] font-semibold">Reservations</h2>
          </div>
        </div>
        <div className="flex-row flex-wrap gap-5">
          <Button
            style={{
              backgroundColor: "#363B5E",
              borderColor: "#F1DF78",
            }}
            className=" text-white"
            //   onClick={openAddEditModel}
          >
            Add New Hotel Reservation
          </Button>
          <Button
            style={{
              backgroundColor: "#363B5E",
              borderColor: "#F1DF78",
            }}
            className=" text-white"
            //   onClick={openAddEditModel}
          >
            Add New
          </Button>
        </div>
      </div>
    </Fragment>
  );
}

export default isAuth(ReservationsPage);
