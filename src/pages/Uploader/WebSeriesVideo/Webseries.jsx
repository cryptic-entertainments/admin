import { useState } from "react";
import "./Webseries.css";
import WebSeriesFileUploader from "./WebSeriesFileUploader";
import WebSeriesUrlUploader from "./WebSeriesUrlUploader";
import { Switch } from "antd";
import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from "@livepeer/react";
import * as React from "react";


const livepeerClient = createReactClient({
  provider: studioProvider({
    apiKey: process.env.REACT_APP_LIVEPEER_API_KEY,
  }),
});

const Webseries = () => {
  const [status, setStatus] = useState(false);

  // let url = document.querySelector(".url");

  const stateChange = () => {
    let file = document.querySelector(".file");
    status === false ? setStatus(true) : setStatus(false);
    file.style.transform = `translateY(100)`;
    // url.style.transitionDelay = `10s`;
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 rounded-3xl backgroundSet">
      <div className="container max-w-2xl mx-auto flex-1 flex flex-col items-center justify-center px-2">
        <div
          className="bg-white dark:text-gray-200 text-gray-600 dark:bg-secondary-dark-bg px-6 py-8 rounded shadow-md w-full bg-grey-lighter1"
          style={{ borderRadius: "1.5rem" }}
        >
          <div className=" mb-2">
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 text-center">
              Webseries Uploader
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="mx-auto w-full max-w-[550px]">
              <div className="toggleBtn flex items-center justify-center mt-5">
                <img src="./images/file_icon.png" alt="files" width="20" />
                <Switch onClick={stateChange} className="mx-3" />
                <img src="./images/youtube_icon.png" alt="toutube" width="25" />
              </div>
              <LivepeerConfig client={livepeerClient}>
                {status === false ? (
                  <div className="file">
                    <WebSeriesFileUploader />
                  </div>
                ) : (
                  <div className="file">
                    <WebSeriesUrlUploader />
                  </div>
                )}
              </LivepeerConfig>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Webseries;
