import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <nav className="App-header">
      <Link to="/" className="link">
        Home
      </Link>
      <Link to="/register" className="link">
        Register
      </Link>
      <Link to="login" className="link">
        Login
      </Link>
    </nav>
  );
};

export default Header;
