import React, { useState, useRef } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

//impoprt use histro etcc....

function SignUp() {
  const refPasswordField = useRef();
  const [buttonText, setButtonText] = useState("Show");
  let passwordLength = 0;
  let navigate = useNavigate();

  const onSubmit = (data) => {
    console.log(data);
    // check if the username exists.
    axios
      .post(
        "https://post-website-server.herokuapp.com/auth/validUsername",
        data
      )
      .then((response) => {
        if (response.data === "Success") {
          alert("Account created");

          axios
            .post("https://post-website-server.herokuapp.com/auth", data)
            .then((response) => {
              // setListOfPosts(response.data);
              console.log(
                "You sumbitted the data : " + JSON.stringify(response.data)
              );
              navigate("/");
            });
        } else {
          alert("Username is taken");
        }
        // console.log(response);
      });
  };

  const initialValues = {
    userName: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    userName: Yup.string()
      .min(3, "Username must be at least 3 characters")
      .max(15, "Username must be at most 15 characters")
      .required("You must input your username..."),
    password: Yup.string()
      .min(4, "Password must be at least 4 characters")
      .max(20, "Password must be at most 20 characters")
      .required("You must input your password..."),
  });

  return (
    <div className="Signup">
      <Formik
        className="formik"
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      >
        <Form className="formContainer">
          <div className="formUsername">
            <ErrorMessage
              className="ErrorMessage"
              name="userName"
              component="span"
            />
            <Field
              className="inputField"
              id="inputCreatePost"
              name="userName"
              placeholder="Username..."
            />
          </div>

          <div className="formPassword">
            <ErrorMessage
              className="ErrorMessage"
              name="password"
              component="span"
            />
            <Field
              innerRef={refPasswordField}
              className="inputField"
              type={buttonText === "Show" ? "password" : "text"}
              id="inputCreatePost"
              name="password"
              placeholder="Password..."
            />

            <button
              type="button"
              className="showButton"
              onClick={() => {
                if (refPasswordField.current.value.length > 0) {
                  if (buttonText === "Show") {
                    setButtonText("Hide");
                  } else {
                    setButtonText("Show");
                  }
                }
              }}
            >
              {buttonText}
            </button>
          </div>

          <button className="submitButton" type="submit">
            Sign up{" "}
          </button>
        </Form>
      </Formik>
    </div>
  );
}

export default SignUp;
