import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../components/AuthContex/AuthContex';

function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  async function handleRegister(event) {
    event.preventDefault();


    try {
      const response = await axios.post("http://localhost:9000/login", { username, password });
      login(response.data.token);
      navigate("/");

    } catch (error) {
      if (error.response) {
        console.log(error.response.data);
        setMessage(error.response.data);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log('Error', error.message);
      }
    }

  }
 
  return (
    <div className='reg_form'>
        <form onSubmit={(event) => {handleRegister(event)}}>
      <TextField required onChange={(event) => {setUsername(event.target.value)}}
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <TextField required onChange={(event) => {setPassword(event.target.value)}}
        label="Password"
        variant="outlined"
        fullWidth
        type='password'
        value={password}
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        type="submit"
      >
        Login
      </Button>
      {
        message && <p style={{color:"red"}}>{message}</p>
      }
    </form>
    </div>
    
  );
}

export default Login;