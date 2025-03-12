import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
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
      .catch((error) => navigate("/register"));
  }, [navigate]);

  const handleRegister = () => {
    axios
      .post("http://localhost:4000/register", { username, password })
      .then(() => {
        alert(`User ${username} Register Successfully`);
        navigate("/login");
      })
      .catch((error) => {
        alert(`User Registration Unsuccessful`);
        navigate("/register");
      });
  };

  return (
    <div>
      <h2>Register</h2>
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
        <button type="submit" onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
};

export default Register;
