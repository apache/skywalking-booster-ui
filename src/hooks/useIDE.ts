import * as EventBus from "vertx3-eventbus-client";
import router from "@/router";
import { useAppStoreWithOut } from "@/store/modules/app";

const appStore = useAppStoreWithOut();

export default function connect(idePort = 8080) {
  console.log("Connecting to IDE...");

  const eb = new EventBus(`http://localhost:${idePort}/eventbus`);
  eb.onopen = () => {
    console.log("EventBus connected");
    appStore.setAutoRefresh(true);

    eb.registerHandler(
      "portal.SetCurrentPage",
      (error: Error, message: any) => {
        console.log("Setting current page:" + JSON.stringify(message));
        router.push(message.body.page);
      }
    );

    eb.registerHandler("portal.SetSettings", (error: Error, message: any) => {
      console.log("Setting config:" + JSON.stringify(message));
    });
  };
}
