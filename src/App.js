import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { Navbar, Footer, Sidebar, ThemeSettings } from "./components";
import {
  Signup,
  Dashboard,
  Videos,
  Calendar,
  Users,
  Stacked,
  Pyramid,
  Customers,
  Kanban,
  Line,
  Area,
  Bar,
  Pie,
  Financial,
  ColorPicker,
  ColorMapping,
  Editor,
  Uploader,
  EditVideo,
  EditWebseries,
  WebseriesUpload,
  CreateWebseriesCategory,
  CreateVideoCategory,
  Webseries
} from "./pages";
import "./App.css";
import { useStateContext } from "./contexts/ContextProvider";
import VideoDetails from "./pages/VideoDetails/VideoDetails";
import WebseriesDetails from "./pages/WebseriesDetails/WebseriesDetails";
import Loader from "./pages/Other/Loader";
import DualAuth from "./pages/Signup/DualAuth";

const App = () => {
  const {
    setCurrentColor,
    setCurrentMode,
    currentMode,
    activeMenu,
    currentColor,
    themeSettings,
    setThemeSettings,
    accountAddress,
    setAccountAddress,
    status,
    account,
  } = useStateContext();
  const [isUserLogin, setIsUserLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const currentThemeColor = localStorage.getItem("colorMode");
    const currentThemeMode = localStorage.getItem("themeMode");
    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, []);

  setTimeout(() => {
    setLoading(false);
  }, 3000);

  useEffect(() => {
    const accountAddress2 = sessionStorage.getItem("crypticUser");
    if (status === "notConnected") {
      setIsUserLogin(false);
      setAccountAddress(null);
    } else if (status === "connected") {
      if (!accountAddress2) {
        setIsUserLogin(false);
        setAccountAddress(null);
      } else {
        setAccountAddress(accountAddress2);
      }
    }
  }, [status]);

  useEffect(() => {
    if (!accountAddress) {
      setIsUserLogin(false);
    } else {
      setIsUserLogin(true);
    }
  }, [accountAddress]);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className={currentMode === "Dark" ? "dark" : ""}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Signup />} />
              <Route path="/dualauth" element={<DualAuth />} />
            </Routes>
            <div className="flex relative dark:bg-main-dark-bg">
              {isUserLogin && (
                <>
                  <div
                    className="fixed right-4 bottom-4"
                    style={{ zIndex: "1000" }}
                  >
                    <TooltipComponent content="Settings" position="Top">
                      <button
                        type="button"
                        onClick={() => setThemeSettings(true)}
                        style={{
                          background: currentColor,
                          borderRadius: "50%",
                        }}
                        className="text-3xl text-white p-3 hover:drop-shadow-xl hover:bg-light-gray"
                      >
                        <FiSettings />
                      </button>
                    </TooltipComponent>
                  </div>
                  {activeMenu ? (
                    <div
                      className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white "
                      style={{ zIndex: "1000" }}
                    >
                      <Sidebar />
                    </div>
                  ) : (
                    <div className="w-0 dark:bg-secondary-dark-bg">
                      <Sidebar />
                    </div>
                  )}
                </>
              )}
              <div
                className={
                  isUserLogin
                    ? activeMenu
                      ? "dark:bg-main-dark-bg  bg-main-bg min-h-screen md:ml-72 w-full  "
                      : "bg-main-bg dark:bg-main-dark-bg  w-full min-h-screen flex-2 "
                    : ""
                }
              >
                {isUserLogin && (
                  <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full ">
                    <Navbar />
                  </div>
                )}
                <div>
                  {isUserLogin && themeSettings && <ThemeSettings />}

                  <Routes>
                    {/* dashboard  */}
                    <Route path="/" element={<Uploader />} />
                    <Route path="/dashboard" element={<Uploader />} />
                    {/* pages  */}
                    <Route path="/videoupload" element={<Uploader />} />
                    <Route path="/videos" element={<Videos />} />
                    <Route
                      path="/videodetails/:id"
                      element={<VideoDetails />}
                    />
                    <Route
                      path="/webseriesdetails/:id"
                      element={<WebseriesDetails />}
                    />
                    <Route path="/editvideo/:id" element={<EditVideo />} />
                    <Route path="/editwebseries/:id" element={<EditWebseries />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/webseriesupload" element={<WebseriesUpload />} />
                    <Route path="/webseries" element={<Webseries />} />
                    <Route
                      path="/addwebseriescategory"
                      element={<CreateWebseriesCategory />}
                    />
                    <Route
                      path="/addvideocategory"
                      element={<CreateVideoCategory />}
                    />
                    {/* apps  */}
                    <Route path="/kanban" element={<Kanban />} />
                    <Route path="/editor" element={<Editor />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/color-picker" element={<ColorPicker />} />
                  </Routes>
                </div>
                {isUserLogin && <Footer />}
              </div>
            </div>
          </BrowserRouter>
        </div>
      )}
    </>
  );
};

export default App;
