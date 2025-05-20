import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home/home";
import Navbar from "./components/Navbar/navbar";
import ShoppingList from "./components/Shoppinglist/shoppinglist";
import Register from "./pages/register/register";
import Login from "./pages/login/Login";
import Todo from "./pages/To-Do/todo";
import Sceduler from "./pages/sceduler/sceduler";
import { AuthProvider } from "./components/AuthContex/AuthContex";
import Finances from "./pages/Finances/Finances";
import Timer from "./pages/Pomodoro/Timer";
import Profile from './components/Profile/profile';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/finances" element={<Finances />} />
          <Route path="/sceduler" element={<Sceduler />} />
          <Route path="/shoppinglist" element={<ShoppingList />} />
          <Route path="/pomodoro" element={<Timer />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);