import { React, useState, useRef, useEffect } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { ImAttachment } from "react-icons/im";
import {
  IoIosCloseCircleOutline,
  IoIosCloseCircle,
  IoIosClose,
} from "react-icons/io";

const CreatePost = (props) => {
  const initialValues = {
    title: "",
    postText: "",
  };

  const isProduction = true;
  let hostUrl = null;
  const refInput = useRef();
  const refImg = useRef();
  const refCreatePostButton = useRef();
  const [imageFile, setImageFile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [buttonText, setButtonText] = useState("Create Post");

  let navigate = useNavigate();

  if (props.passingDataParentToChild_isLogged2 !== isLoggedIn) {
    console.log("Change in log state from create post " + isLoggedIn);
    setIsLoggedIn(props.passingDataParentToChild_isLogged2);
  }

  useEffect(() => {
    if (isProduction) {
      hostUrl = "https://post-website-server.herokuapp.com/";
    } else {
      hostUrl = "http://localhost:3001/";
    }
    if (!isLoggedIn) {
      console.log("navigate to login page from create post");
      navigate("/login");
    }
  }, [isLoggedIn]);

  const sendPostDataToDB = (data) => {
    axios
      .post(hostUrl + "Posts", data, {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        console.log(
          "You created a post with the data : " + JSON.stringify(response.data)
        );
        refCreatePostButton.current.style.cursor = "default";
        setButtonText("Uploading...");
        navigate("/");
      });
  };

  const onSubmit = (data) => {
    console.log("Create Post");
    refCreatePostButton.current.style.cursor = "wait";
    setButtonText("Uploading...");

    // upload Image if not null
    if (imageFile !== null) {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", "bguujs48");
      axios
        .post("https://api.cloudinary.com/v1_1/jiwa/image/upload", formData)
        .then((response) => {
          // console.log(response.data.url);
          if (response.data.url.includes("http")) {
            data.imageURL = response.data.url;
            sendPostDataToDB(data);
          } else {
            console.log({ err: "error - unable to get image url" });
          }
        });
    } else {
      sendPostDataToDB(data);
    }
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .max(250, "Title too long. Max 250 characters")
      .required("You must input a title"),
    postText: Yup.string()
      .max(2200, "Post too long. Max 2200 characters")
      .required("You must input a text to post..."),
  });

  // bguujs48
  return (
    <div className="createPostPage">
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      >
        <Form className="formContainer">
          <ErrorMessage
            className="ErrorMessage"
            name="title"
            component="span"
          />
          <Field
            className="inputField"
            component="textarea"
            rows="3"
            // cols="50"
            name="title"
            placeholder="Title..."
            style={{ width: "100%" }}
          />

          <ErrorMessage
            className="ErrorMessage"
            name="postText"
            component="span"
          />
          <Field
            className="inputField"
            name="postText"
            component="textarea"
            rows="5"
            placeholder="Post..."
            style={{ width: "100%" }}
          />
          <label
            className="uploadImageLabel"
            htmlFor="idInputfiles"
            style={{
              cursor: "pointer",
              backgroundColor: "white",
              padding: "2px",
              border: "1px solid rgba(0, 0, 0, 0.1)",
            }}
          >
            <ImAttachment
              style={{
                paddingRight: "1px",
                fontSize: "0.9em",
                backgroundColor: "transparent",
              }}
            />
            Attach an image
          </label>

          <div style={{ backgroundColor: "white" }}>
            <input
              id="idInputfiles"
              style={{ visibility: "hidden" }}
              className="chooseFileButton"
              ref={refInput}
              type="file"
              accept="image/*"
              onChange={(event) => {
                // set size of image -- we do this by uploading an image into Image() and getting it's width / height
                var image = new Image();

                image.src = URL.createObjectURL(event.target.files[0]);

                image.onload = () => {
                  const maxWidth = 50;
                  const maxHeight = 50;

                  let ratio = Math.min(
                    maxWidth / image.width,
                    maxHeight / image.height
                  );
                  refImg.current.style.height = image.height * ratio + "%";
                  refImg.current.style.width = image.width * ratio + "%";
                  // refImg.current.style.display = "block";

                  // console.log("height: " + image.height + "width: " + image.width);

                  // console.log(
                  //   "height: " +
                  //     refImg.current.style.height +
                  //     "width: " +
                  //     refImg.current.style.width
                  // );
                };
                // console.log("image.onload");

                setImageFile(event.target.files[0]); // call at end this prevent large img displayed / flashing before resized
              }}
            />

            {imageFile !== null ? (
              <div style={{ backgroundColor: "white", marginBottom: "10px" }}>
                <img
                  style={{ float: "left" }}
                  ref={refImg}
                  src={URL.createObjectURL(imageFile)}
                  alt="Girl in a jacket"
                />
                <IoIosCloseCircle
                  style={{
                    color: "red",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontSize: "1.2em",
                  }}
                  onClick={() => {
                    setImageFile(null);
                    refInput.current.type = null;
                    refInput.current.type = "file";
                  }}
                ></IoIosCloseCircle>
              </div>
            ) : null}
          </div>

          <button
            ref={refCreatePostButton}
            className="createPostButton "
            type="submit"
          >
            {buttonText}
          </button>
        </Form>
      </Formik>
    </div>
  );
};

export default CreatePost;
