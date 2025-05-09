import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  async function handleRegister(event) {
    event.preventDefault();

    if (password !== repeatPassword) {
      setMessage("Password doesn't match");
      setRepeatPassword("");
      setPassword("");
      return;
    }

    try {
      await axios.post("http://localhost:9000/users", { username, password });
      alert("Registration was Successful");
      navigate("/");
    } catch (error) {
      if (error.response) {
        console.log(error.response.data);
        setMessage(error.response.data);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log("Error", error.message);
      }
    }
  }

  return (
    <div className="center-wrapperRegister">
      <div className="reg_formRegister">
        <form
          onSubmit={(event) => {
            handleRegister(event);
          }}
        >
          <TextField
            required
            onChange={(event) => {
              setUsername(event.target.value);
            }}
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            required
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            label="Password"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            margin="normal"
          />
          <TextField
            required
            onChange={(event) => {
              setRepeatPassword(event.target.value);
            }}
            label="repeat Password"
            variant="outlined"
            fullWidth
            type="password"
            value={repeatPassword}
            margin="normal"
          />
          <Button variant="contained" color="primary" type="submit">
            Register
          </Button>
          {message && <p style={{ color: "red" }}>{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default Register;
