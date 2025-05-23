import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../components/AuthContex/AuthContex";
import "./Login.css";
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const lastSite = location.state?.from || "/";

  async function handleRegister(event) {
    event.preventDefault();

    try {
      const response = await axios.post("http://localhost:9000/login", {
        username,
        password,
      });
      login(response.data.token);
      navigate(lastSite);
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

  return (
    <div className="center-wrapperLogin">
      <div className="reg_formLogin">
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
            sx={{ color: "white" }}
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
          <Button sx={{
            backgroundColor: "#8B0000",
            color: 'white',
            '&:hover': {
              backgroundColor: '#ac2727',
            }
          }
          } variant="contained" color="primary" type="submit">
            Login
          </Button>
          {message && <p style={{ color: "red" }}>{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;
