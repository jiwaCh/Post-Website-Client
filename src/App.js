import "./App.css";
import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";
import Post from "./pages/Post";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import PageNotFound from "./pages/PageNotFound";
import axios from "axios";

// 2) prevent multiple user for signing up using the same username

// 3) post the app --- we have more shit to do, no time... dont fuck round

//JSON.stringify() method converts a JavaScript object or value to a JSON string

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [currentUserName, setCurrentUserName] = useState("");

  useEffect(() => {
    axios
      .get(`https://post-website-server.herokuapp.com/auth/valid`, {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        setCurrentUserName(response.data.userName);
        if (response.error || response.data.error) {
          setIsLoggedIn(false);
          console.log(
            " ----------------logged out - from use effect app.js----------------"
          );
        } else {
          setIsLoggedIn(true);
          console.log(
            "----------------logged in - from use effect app.js----------------"
          );
        }
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      {/* <meta name="viewport" content="width=1, initial-scale=100"></meta> */}

      <BrowserRouter>
        <div className="navbar">
          <div className="left">
            {isLoggedIn ? <Link to="/">Home</Link> : null}
            {isLoggedIn ? <Link to="/createpost"> Create Post</Link> : null}

            {isLoggedIn ? null : <Link to="/login"> Login</Link>}
            {isLoggedIn ? null : <Link to="/signup"> Sign up</Link>}
          </div>
          <div className="right">
            {isLoggedIn ? <button onClick={logout}>Logout</button> : null}
            {isLoggedIn ? <span> Username: {currentUserName}</span> : null}
          </div>
        </div>

        <Routes>
          <Route
            path="/"
            element={<Home passingDataParentToChild_isLogged={isLoggedIn} />}
          />

          <Route
            path="/createpost"
            element={
              <CreatePost passingDataParentToChild_isLogged2={isLoggedIn} />
            }
          />

          <Route
            path="/post/:id"
            element={<Post passingDataParentToChild_isLogged3={isLoggedIn} />}
          />
          <Route
            path="/login"
            element={
              <Login
                passingDataFromChildToParent={(userName) => {
                  setCurrentUserName(userName);
                  setIsLoggedIn(true);
                }}
              />
            }
          />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
