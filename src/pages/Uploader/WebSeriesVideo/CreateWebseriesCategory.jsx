import axios from "axios";
import { Buffer } from "buffer";
import { useState } from "react";
import { Line } from "rc-progress";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStateContext } from "../../../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Web3Storage } from "web3.storage";
import swal from "@sweetalert/with-react";
import "./Webseries.css";

// Construct with token and endpoint
function getAccessToken() {
  return process.env.REACT_APP_WEBTHREETOKEN;
}

function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

const CreateWebseriesCategory = () => {
  const navigate = useNavigate();
  const { currentColor, account, status, setAccountAddress } =
    useStateContext();
  const [videoTitle, setVideoTitle] = useState("");
  const [videoCategory, setVideoCategory] = useState("");
  const [videoFile, setVideoFile] = useState("");

  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [imageProgress, setImageProgress] = useState(null);

  function videoUploadSuccess() {
    setVideoTitle("");
    setVideoCategory("");
    setVideoFile("");
    setDescription("");
    setImageFile("");
    setImageFileName("");
    setImageProgress(null);
  }

  function handleFileChangeImage(target, setter) {
    setImageFileName(target.files[0].name);
    setter(target.files[0]);
  }

  async function handleFileUpload() {
    document.getElementById("title-container").style.cursor = "not-allowed";
    document.getElementById("title").style.pointerEvents = "none";
    document.getElementById("description-container").style.cursor =
      "not-allowed";
    document.getElementById("description").style.pointerEvents = "none";
    document.getElementById("image-container").style.cursor = "not-allowed";
    document.getElementById("image").style.pointerEvents = "none";
    document.querySelector("button").style.disabled = "true";
    imageUpload();

    async function imageUpload() {
      try {
        let ImageUrl = "";
        var FormData = require("form-data");
        var data = new FormData();
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(imageFile);
        reader.onloadend = async () => {
          // Web3Storage image upload start
          try {
            const fileInput = document.querySelector("#input_thumbnail");
            const files = fileInput.files;
            const onRootCidReady = (cid) => {
              console.log("uploading files with cid:", cid);
            };
            const totalSize = files[0].size;
            let fileName = files[0].name.replace(/\s/g, "%20");
            fileName = fileName.replace(/#/g, "%23");
            let uploaded = 0;
            const onStoredChunk = (size) => {
              uploaded += size;
              const pct = 100 * (uploaded / totalSize);
              setImageProgress(pct.toFixed(1));
              console.log(`Uploading... ${pct.toFixed(1)}% complete`);
            };
            const client = makeStorageClient();
            const IpfsCid = await client.put(files, {
              onRootCidReady,
              onStoredChunk,
            });
            ImageUrl = `https://${IpfsCid}.ipfs.w3s.link/${fileName}`;
          } catch (error) {
            console.log(error);
          }
          //   web3Storage image upload end
          data.append("name", videoTitle);
          data.append("video_desc", description);
          data.append("thumbnail_ipfs", ImageUrl);
          data.append("user_address", account);

          var config = {
            method: "post",
            url: `${process.env.REACT_APP_LOCALHOST_URL}/php/API/webseries_upload_category`,
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
                navigate("/webseries");
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
        };
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

  useEffect(() => {
    document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
      const dropZoneElement = inputElement.closest(".drop-zone");

      dropZoneElement.addEventListener("click", (e) => {
        inputElement.click();
      });

      inputElement.addEventListener("change", (e) => {
        if (inputElement.files.length) {
          updateThumbnail(dropZoneElement, inputElement.files[0]);
        }
      });

      dropZoneElement.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZoneElement.classList.add("drop-zone--over");
      });

      ["dragleave", "dragend"].forEach((type) => {
        dropZoneElement.addEventListener(type, (e) => {
          dropZoneElement.classList.remove("drop-zone--over");
        });
      });

      dropZoneElement.addEventListener("drop", (e) => {
        e.preventDefault();
          setImageFileName(e.dataTransfer.files[0].name);
          setImageFile(e.dataTransfer.files[0]);

        if (e.dataTransfer.files.length) {
          inputElement.files = e.dataTransfer.files;
          updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }

        dropZoneElement.classList.remove("drop-zone--over");
      });
    });

    function updateThumbnail(dropZoneElement, file) {
      let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

      // First time - remove the prompt
      if (dropZoneElement.querySelector(".drop-zone__prompt")) {
        dropZoneElement.querySelector(".drop-zone__prompt").remove();
      }

      // First time - there is no thumbnail element, so lets create it
      if (!thumbnailElement) {
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");
        dropZoneElement.appendChild(thumbnailElement);
      }

      thumbnailElement.dataset.label = file.name;

      // Show thumbnail for image files
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
          thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
        };
      } else {
        thumbnailElement.style.backgroundImage = null;
      }
    }
  }, []);

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
              Add Webseries Category
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

                <div className="mb-5" id="image-container">
                  {!imageProgress ? (
                    <>
                      <div id="image">
                        <div className="col-md-12">
                          <div className="form-group">
                            <label htmlFor="thumbnail">Cover Thumbnail</label>
                            <div className="drop-zone">
                              <span className="drop-zone__prompt">
                                <i className="fa-solid fa-cloud-arrow-up icon"></i>
                                <br />
                                Drop thumbnail here or click to upload
                              </span>
                              <input
                                type="file"
                                name="thumbnail"
                                id="input_thumbnail"
                                className="drop-zone__input"
                                required
                                onChange={(e) =>
                                  handleFileChangeImage(e.target, setImageFile)
                                }
                                accept="image/*"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-2">
                        Thumbnail uploading in progress... {imageProgress}%
                      </p>
                      <Line
                        percent={imageProgress}
                        strokeWidth={3}
                        strokeColor={currentColor}
                        className="mt-2"
                      />
                    </>
                  )}
                </div>
                <div>
                  {videoTitle && description && imageFile ? (
                    <button
                      type="button"
                      className="hover:shadow-form w-full rounded-md  py-3 px-8 text-center text-base font-semibold text-white outline-none"
                      onClick={handleFileUpload}
                      style={{ background: currentColor }}
                    >
                      Send File
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="hover:shadow-form w-full rounded-md  py-3 px-8 text-center text-base font-semibold text-white outline-none opacity-70 transition ease-in-out duration-150 cursor-not-allowed"
                      onClick={handleFileUpload}
                      style={{ background: currentColor }}
                      disabled
                    >
                      Send File
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

export default CreateWebseriesCategory;
