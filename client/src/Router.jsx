import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import store from "./redux/store";
import { Provider } from "react-redux";

const Router = () => {
  return (
    <>
      <BrowserRouter>
        <Provider store={store}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chat" element={<App />} />
          </Routes>
        </Provider>
      </BrowserRouter>
    </>
  );
};

export default Router;
