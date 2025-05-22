import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./register.css";
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
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
      navigate("/login");
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
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const toggleShowRepeatPassword = () => {
    setShowRepeatPassword(!showRepeatPassword);
  };
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
            type={showPassword ? "text" : "password"}
            value={password}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    onMouseDown={(event) => event.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            required
            onChange={(event) => {
              setRepeatPassword(event.target.value);
            }}
            label="repeat password"
            variant="outlined"
            fullWidth
            type={showRepeatPassword ? "text" : "password"}
            value={repeatPassword}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle Repeat password visibility"
                    onClick={toggleShowRepeatPassword}
                    onMouseDown={(event) => event.preventDefault()}
                    edge="end"
                  >
                    {showRepeatPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button sx={{
            backgroundColor: "#8B0000",
            color: 'white',
            '&:hover': {
              backgroundColor: '#ac2727',
            }
          }} variant="contained" color="primary" type="submit">
            Register
          </Button>
          {message && <p style={{ color: "red" }}>{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default Register;
