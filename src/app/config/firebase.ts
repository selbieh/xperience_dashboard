import * as firebase from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { StatusSuccessCodes } from "../api/successStatus";
import { PostReq } from "../api/api";

const firebaseCloudMessaging = {
  tokenInlocalforage: async () => {
    return localStorage.getItem("fcm_token");
  },

  init: async function () {
    if (!firebase.getApps().length) {
      try {
        const messaging = getMessaging();
        const tokenInLocalForage = await this.tokenInlocalforage();

        const status = await Notification.requestPermission();
        console.log(status);
        if (status && status === "granted") {
          const fcm_token = await getToken(messaging, {
            vapidKey:
              "BEH0OMvStZlMB91AoHer9AGH02amwbydsDMh-Dvs98_bGTu5_Dh8AjwyQR5fUboWdWe7nAAQHaMmXLr4DivpK4c",
          });
          if (fcm_token) {
            PostReq("devices", {
              registration_id: `${fcm_token}`,
              type: "web",
            }).then((res: any) => {
              if (StatusSuccessCodes.includes(res.status)) {
                localStorage.setItem("fcm_token", fcm_token);
                return fcm_token;
              } else {
                //   res?.errors.forEach((err: any) => {
                //     messageApi.error(
                //       `${err.attr ? err.attr + ":" + err.detail : err.detail} `
                //     );
                //   });
              }
            });
          } else {
            console.log("failed to generate the app registration token.");
          }
        }
      } catch (error) {
        console.log(error);
        return null;
      }
    } else {
      try {
        const tokenInLocalForage = await this.tokenInlocalforage();
        if (tokenInLocalForage !== null) {
          return tokenInLocalForage;
        }

        const messaging = getMessaging();
        const status = await Notification.requestPermission();

        if (status && status === "granted") {
          const fcm_token = await getToken(messaging, {
            vapidKey:
              "BEH0OMvStZlMB91AoHer9AGH02amwbydsDMh-Dvs98_bGTu5_Dh8AjwyQR5fUboWdWe7nAAQHaMmXLr4DivpK4c",
          });
          if (fcm_token) {
            PostReq("devices", {
              registration_id: `${fcm_token}`,
              type: "web",
            }).then((res: any) => {
              if (StatusSuccessCodes.includes(res.status)) {
                localStorage.setItem("fcm_token", fcm_token);
                return fcm_token;
              } else {
                //   res?.errors.forEach((err: any) => {
                //     messageApi.error(
                //       `${err.attr ? err.attr + ":" + err.detail : err.detail} `
                //     );
                //   });
              }
            });
          }
        }
      } catch (error) {
        console.log(error);
        return null;
      }
    }
  },

  getMessage: async function () {
    if (firebase.getApps().length > 0) {
      try {
        const messaging = getMessaging();
        onMessage(messaging, (payload) => console.log("message Recieved"));
      } catch (error) {}
    }
  },
};

export { firebaseCloudMessaging };
