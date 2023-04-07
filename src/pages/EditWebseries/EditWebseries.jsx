import { useState } from "react";
import "./EditWebseries.css";
import EditWebseriesComponent from "./EditWebseriesComponent";
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

const Uploader = () => {
  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 rounded-3xl backgroundSet2">
      <div className="container max-w-2xl mx-auto flex-1 flex flex-col items-center justify-center px-2">
        <div
          className="bg-white dark:text-gray-200 text-gray-600 dark:bg-secondary-dark-bg px-6 py-8 rounded shadow-md w-full bg-grey-lighter1"
          style={{ borderRadius: "1.5rem" }}
        >
          <div className=" mb-2">
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 text-center">
              Edit Webseries
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="mx-auto w-full max-w-[550px]">
              <LivepeerConfig client={livepeerClient}>
                  <div className="file">
                    <EditWebseriesComponent />
                  </div>
              </LivepeerConfig>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Uploader;
