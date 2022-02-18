import React from "react";
import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <div className="PageNotFound">
      <h1>Page Not Found</h1>
      <h1>
        Go To <Link to="/">Home Page</Link>
      </h1>
    </div>
  );
};

export default PageNotFound;
