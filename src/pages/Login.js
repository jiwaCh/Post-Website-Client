import React, { useRef } from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = (props) => {
  let navigate = useNavigate();
  const refPassword = useRef();
  const [buttonText, setButtonText] = useState("Show");

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = () => {
    const data = { userName: userName, password: password };
    axios
      .post("https://post-website-server.herokuapp.com/auth/login", data)
      .then((response) => {
        if (response.data.error) {
          alert(response.data.error);
        } else {
          localStorage.setItem("accessToken", response.data);
          props.passingDataFromChildToParent(userName);
          navigate("/");
        }
      });
    // console.log(data);
  };

  return (
    <div className="loginContainer">
      <div className="g1">
        <div> Username: </div>
        <input
          className="input"
          type="text"
          value={userName}
          onChange={(event) => {
            setUserName(event.target.value);
          }}
        />
      </div>

      <div className="g2">
        <div> Password: </div>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
        />
      </div>

      <div className="g3">
        <button type="button" onClick={onSubmit}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
