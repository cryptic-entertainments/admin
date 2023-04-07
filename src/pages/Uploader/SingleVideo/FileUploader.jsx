import axios from "axios";
import { Line } from "rc-progress";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStateContext } from "../../../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Web3Storage } from "web3.storage";
import { useAssetMetrics, useCreateAsset } from "@livepeer/react";
import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as React from "react";

// Construct with token and endpoint
function getAccessToken() {
  return process.env.REACT_APP_WEBTHREETOKEN;
}

function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() });
}

var uploadStatus = false;

// eslint-disable-next-line react-hooks/exhaustive-deps

const FileUploader = () => {
  const navigate = useNavigate();
  const { currentColor, account, status, setAccountAddress } =
    useStateContext();
  const [videoTitle, setVideoTitle] = useState("");
  const [videoCategory, setVideoCategory] = useState("");
  const [videoFile, setVideoFile] = useState("");
  const [videoFileName, setVideoFileName] = useState("");
  const [videoUploading, setVideoUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [videoProgress, setVideoProgress] = useState(null);
  const [imageProgress, setImageProgress] = useState(null);
  const [videoUploadPercentage, setVideoUploadPercentage] = useState(0);
  const [fetchCategory, setFetchCategory] = useState([]);
  const [video, setVideo] = useState("");
  const [videoId, setVideoId] = useState("");
  const [categoryName, setCategoryName] = useState("");

  // video upload to livepeer

  const {
    mutate: createAsset,
    data: asset,
    status: createStatus,
    progress,
    error,
  } = useCreateAsset(
    video
      ? {
          sources: [{ name: video.name, file: video }],
        }
      : null
  );

  const { data: metrics } = useAssetMetrics({
    assetId: asset?.[0].id,
    refetchInterval: 30000,
  });

  // console.log(`this is livepeer data ${asset}`);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0 && acceptedFiles?.[0]) {
      setVideo(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "video/*": [".mp4"],
    },
    maxFiles: 1,
    onDrop,
  });

  function videoUploadSuccess() {
    setVideoTitle("");
    setVideoCategory("");
    setCategoryName("");
    setVideo("");
    setVideoId("");
    setVideoFile("");
    setVideoFileName("");
    setVideoUploading(false);
    setDescription("");
    setImageFile("");
    setImageFileName("");
    setVideoProgress(null);
    setImageProgress(null);
  }

  function handleFileChange(target, setter) {
    setVideoFileName(target.files[0].name);
    setter(target.files[0]);
  }

  function handleFileChangeImage(target, setter) {
    setImageFileName(target.files[0].name);
    setter(target.files[0]);
  }

  async function handleFileUpload(videoId) {
    document.getElementById("select").style.cursor = "not-allowed";
    document.getElementById("countries").style.pointerEvents = "none";
    document.getElementById("title-container").style.cursor = "not-allowed";
    document.getElementById("title").style.pointerEvents = "none";
    document.getElementById("description-container").style.cursor =
      "not-allowed";
    document.getElementById("description").style.pointerEvents = "none";
    document.getElementById("image-container").style.cursor = "not-allowed";
    document.getElementById("image").style.pointerEvents = "none";
    document.getElementById("video-container").style.cursor = "not-allowed";
    document.getElementById("video").style.pointerEvents = "none";
    document.querySelector("button").style.disabled = "true";
    setVideoUploading(true);

    // Web3Storage video upload end
    async function imageUpload() {
      console.log("called img uploading function");
      var count = 1;
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
          console.log(`calling after playbacid ${videoId}`);
          data.append("category", videoCategory);
          data.append("categoryName", categoryName);
          data.append("name", videoTitle);
          data.append("video_desc", description);
          data.append(
            "video_uid",
            `https://lp-playback.com/hls/${videoId}/index.m3u8`
          );
          data.append("thumbnail_ipfs", ImageUrl);
          data.append("user_address", account);
          data.append("user_type", "admin");
          const categoryName = $( "#countries option:selected" ).text();
          data.append("categoryName", categoryName);
          console.log(`this is video category${videoCategory}`);
          uploadStatus = true;
          var config = {
            method: "post",
            url: `${process.env.REACT_APP_LOCALHOST_URL}/php/API/upload_video`,
            data: data,
          };
          if (count === 1) {
            await axios(config)
              .then(function (response) {
                if (response.data.status === 201) {
                  videoUploadSuccess();
                  setVideoUploading(false);
                  count = 0;
                  uploadStatus = true;
                  swal({
                    title: "Video Uploaded Successfully",
                    icon: "success",
                    button: "Ok",
                  }).then(() => {
                    navigate("/videos");
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
          }
        };
      } catch (error) {
        console.log(error);
      }
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
    if (uploadStatus === false || uploadStatus === "false") {
      imageUpload();
      console.log(uploadStatus);
    }
  }

  function handleChange(target, setter) {
    setter(target.value);
  }

  function handleChange2(e) {
    setVideoCategory(e.target.value);
    setCategoryName(e.target.selectedOptions[0].text);
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
        if (e.dataTransfer.files[0].type === "video/mp4") {
          setVideoFileName(e.dataTransfer.files[0].name);
          setVideoFile(e.dataTransfer.files[0]);
        } else {
          setImageFileName(e.dataTransfer.files[0].name);
          setImageFile(e.dataTransfer.files[0]);
        }

        if (e.dataTransfer.files.length) {
          inputElement.files = e.dataTransfer.files;
          updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }

        dropZoneElement.classList.remove("drop-zone--over");
      });
    });

    function updateThumbnail(dropZoneElement, file) {
      let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");
      if (dropZoneElement.querySelector(".drop-zone__prompt")) {
        dropZoneElement.querySelector(".drop-zone__prompt").remove();
      }
      if (!thumbnailElement) {
        thumbnailElement = document.createElement("div");
        thumbnailElement.classList.add("drop-zone__thumb");
        dropZoneElement.appendChild(thumbnailElement);
      }
      thumbnailElement.dataset.label = file.name;
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

  const isLoading = useMemo(
    () =>
      createStatus === "loading" ||
      (asset?.[0] && asset[0].createStatus?.phase !== "ready"),
    [createStatus, asset]
  );

  const progressFormatted = useMemo(
    () =>
      progress?.[0].phase === "failed"
        ? "Failed to process video."
        : progress?.[0].phase === "waiting"
        ? "Waiting..."
        : progress?.[0].phase === "uploading"
        ? `Video uploading in progress: ${Math.round(
            progress?.[0]?.progress * 100
          )}%`
        : progress?.[0].phase === "processing"
        ? `Video Processing in progress: ${Math.round(
            progress?.[0].progress * 100
          )}%`
        : null,
    [progress]
  );

  const progressFormatted2 = useMemo(
    () =>
      progress?.[0].phase === "failed"
        ? "Failed to process video."
        : progress?.[0].phase === "waiting"
        ? "Waiting..."
        : progress?.[0].phase === "uploading"
        ? parseInt(Math.round(progress?.[0]?.progress * 100))
        : progress?.[0].phase === "processing"
        ? parseInt(Math.round(progress?.[0]?.progress * 100))
        : null,
    [progress]
  );

  function UploadImageData(data) {
    handleFileUpload(data);
  }

  useEffect(() => {
    if (progress?.[0].phase === "ready" && asset?.[0]?.playbackId) {
      UploadImageData(asset[0].playbackId);
    }
  }, [asset?.[0]?.playbackId, progress?.[0].phase]);

  async function fetchData() {
    try {
      const result = await axios.get(
        `${process.env.REACT_APP_LOCALHOST_URL}/php/API/fetch_video_category`
      );
      setFetchCategory(result.data);
    } catch (error) {
      setFetchCategory([]);
      console.error(error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      {/* call handle file upload function after uploading video on livepeer */}
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

      <div className="mx-auto w-full max-w-[550px]">
        <form
          className="py-6 px-9"
          action="https://formbold.com/s/FORM_ID"
          method="POST"
        >
          <div className="mb-5" id="select">
            <label
              htmlFor="countries"
              className="mb-3 block text-base font-medium "
            >
              Select an option
            </label>
            <select
              id="countries"
              className="w-full rounded-md border border-[#e0e0e0]  py-3 px-6 text-base font-medium text-[#6B7280] outline-none bg-[#e7e7e7] focus:border-[#6A64F1] focus:shadow-md"
              placeholder="Select category"
              onChange={handleChange2}
            >
              <option defaultValue>Choose video category</option>
              {fetchCategory.map((category) => (
                <option
                  value={category.category_uuid}
                  key={category.category_uuid}
                >
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-5" id="title-container">
            <label htmlFor="title" className="mb-3 block font-medium text-base">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={videoTitle}
              onChange={(e) => handleChange(e.target, setVideoTitle)}
              id="title"
              placeholder="Video Title"
              className="w-full rounded-md border border-[#e0e0e0]  py-3 px-6 text-base font-medium text-[#6B7280] outline-none bg-[#e7e7e7] focus:border-[#6A64F1] focus:shadow-md"
            />
          </div>

          <div className="mb-5" id="description-container">
            <label htmlFor="email" className="mb-3 block text-base font-medium">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => handleChange(e.target, setDescription)}
              id="description"
              rows="3"
              className="w-full rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium text-[#6B7280] outline-none bg-[#e7e7e7] focus:border-[#6A64F1] focus:shadow-md"
              placeholder="Video Description..."
            ></textarea>
          </div>

          <div className="mb-5" id="image-container">
            {!imageProgress ? (
              <>
                <div id="image">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="thumbnail">Thumbnail</label>
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

          <div className="mb-5" id="video-container">
            {!progressFormatted ? (
              <>
                <div id="video">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="video">Video</label>
                      <div className="drop-zone">
                        {!asset && (
                          <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <p>Drag and drop or browse files</p>

                            {error?.message && <p>{error.message}</p>}
                          </div>
                        )}

                        {/* {asset?.[0]?.playbackId && (
                          <Player
                            title={asset[0].name}
                            playbackId={asset[0].playbackId}
                          />
                        )} */}

                        <div>
                          {video ? <p>{video.name}</p> : ""}
                          {progressFormatted && <p>{progressFormatted}</p>}
                        </div>
                      </div>
                      <span
                        className="my-1"
                        style={{ fontSize: "12px", color: currentColor }}
                      >
                        <i className="fa fa-info-circle" aria-hidden="true"></i>{" "}
                        Video size should be less than 100 mb
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {progressFormatted && (
                  <p className="mt-2 text-gray">{progressFormatted}</p>
                )}
                <Line
                  percent={progressFormatted2}
                  strokeWidth={3}
                  strokeColor={currentColor}
                  className="mt-2"
                />
              </>
            )}
          </div>
          <div>
            {!videoUploading ? (
              videoTitle &&
              videoCategory &&
              video &&
              description &&
              imageFile ? (
                !asset?.[0].id && (
                  <button
                    type="button"
                    className="hover:shadow-form w-full rounded-md  py-3 px-8 text-center text-base font-semibold text-white outline-none"
                    onClick={() => {
                      createAsset?.();
                    }}
                    disabled={isLoading || !createAsset}
                    style={{ background: currentColor }}
                  >
                    Send File
                  </button>
                )
              ) : (
                <button
                  type="button"
                  className="hover:shadow-form w-full rounded-md  py-3 px-8 text-center text-base font-semibold text-white outline-none opacity-70 transition ease-in-out duration-150 cursor-not-allowed"
                  onClick={() => {
                    createAsset?.();
                  }}
                  disabled={isLoading || !createAsset}
                  style={{ background: currentColor }}
                >
                  Send File
                </button>
              )
            ) : (
              <button
                type="button"
                className="w-full inline-flex items-center py-3 px-8 border border-transparent text-base leading-6 font-medium rounded-md justify-center  text-white transition ease-in-out duration-150 cursor-not-allowed"
                disabled
                style={{ background: currentColor }}
              >
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default FileUploader;
