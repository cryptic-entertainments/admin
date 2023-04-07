import axios from "axios";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStateContext } from "../../../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import swal from "@sweetalert/with-react";
import "./Uploader.css";

const CreateVideoCategory = () => {
  const navigate = useNavigate();
  const { currentColor, account, status, setAccountAddress } =
    useStateContext();
  const [videoTitle, setVideoTitle] = useState("");
  const [description, setDescription] = useState("");

  function videoUploadSuccess() {
    setVideoTitle("");
    setDescription("");
  }

  async function handleFileUpload() {
    document.getElementById("title-container").style.cursor = "not-allowed";
    document.getElementById("title").style.pointerEvents = "none";
    document.getElementById("description-container").style.cursor =
      "not-allowed";
    document.getElementById("description").style.pointerEvents = "none";
    document.querySelector("button").style.disabled = "true";
    imageUpload();

    async function imageUpload() {
      try {
        var FormData = require("form-data");
        var data = new FormData();
        data.append("name", videoTitle);
        data.append("video_desc", description);

        var config = {
          method: "post",
          url: `${process.env.REACT_APP_LOCALHOST_URL}/php/API/video_upload_category`,
          data: data,
        };
        axios(config)
          .then(function (response) {
            if (response.data.status === 201) {
              videoUploadSuccess();
              swal({
                title: "Video Uploaded Successfully",
                icon: "success",
                button: "Ok",
              }).then(() => {
                navigate("/videoupload");
              });
            } else {
              swal({
                title: "Video Upload Failed",
                icon: "error",
                button: "Ok",
              }).then(() => {
                navigate("/videos");
              });
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      } catch (error) {
        console.log(error);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  function handleChange(target, setter) {
    setter(target.value);
  }

  const accountAddress = sessionStorage.getItem("crypticUser");

  useEffect(() => {
    if (status === "notConnected") {
      setAccountAddress(null);
      navigate("/login");
    } else if (status === "connected") {
      if (!accountAddress) {
        setAccountAddress(null);
        navigate("/login");
      } else {
        setAccountAddress(account);
      }
    }
  }, [status, accountAddress]);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 rounded-3xl">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="container max-w-2xl mx-auto flex-1 flex flex-col items-center justify-center px-2">
        <div
          className="bg-white dark:text-gray-200 text-gray-600 dark:bg-secondary-dark-bg px-6 py-8 rounded shadow-md w-full bg-grey-lighter1"
          style={{ borderRadius: "1.5rem" }}
        >
          <div className=" mb-2">
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 text-center">
              Add Video Category
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="mx-auto w-full max-w-[550px]">
              <form
                className="py-6 px-9"
                action="https://formbold.com/s/FORM_ID"
                method="POST"
              >
                <div className="mb-5" id="title-container">
                  <label
                    htmlFor="title"
                    className="mb-3 block font-medium text-base"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={videoTitle}
                    onChange={(e) => handleChange(e.target, setVideoTitle)}
                    id="title"
                    placeholder="Webseries Name"
                    className="w-full rounded-md border border-[#e0e0e0]  py-3 px-6 text-base font-medium text-[#6B7280] outline-none bg-[#e7e7e7] focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>

                <div className="mb-5" id="description-container">
                  <label
                    htmlFor="email"
                    className="mb-3 block text-base font-medium"
                  >
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => handleChange(e.target, setDescription)}
                    id="description"
                    rows="3"
                    className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] outline-none bg-[#e7e7e7] focus:border-[#6A64F1] focus:shadow-md"
                    placeholder="Webseries Description..."
                  ></textarea>
                </div>
                <div>
                  {videoTitle && description ? (
                    <button
                      type="button"
                      className="hover:shadow-form w-full rounded-md  py-3 px-8 text-center text-base font-semibold text-white outline-none"
                      onClick={handleFileUpload}
                      style={{ background: currentColor }}
                    >
                      Add Category
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="hover:shadow-form w-full rounded-md  py-3 px-8 text-center text-base font-semibold text-white outline-none opacity-70 transition ease-in-out duration-150 cursor-not-allowed"
                      onClick={handleFileUpload}
                      style={{ background: currentColor }}
                      disabled
                    >
                      Add Category
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVideoCategory;
