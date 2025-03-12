import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:4000/profile", {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => navigate("/profile"))
      .catch((error) => navigate("/login"));
  }, [navigate]);

  const handleLogin = () => {
    axios
      .post("http://localhost:4000/login", { username, password })
      .then((user) => {
        localStorage.setItem("token", user.data.token);
        navigate("/profile");
      })
      .catch((error) => {
        navigate("/login");
      });
  };

  return (
    <div>
      <h2>Login</h2>
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          required
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          required
        />
      </div>
      <div>
        <button type="submit" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
