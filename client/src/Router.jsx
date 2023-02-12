import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import store from "./redux/store";
import { Provider, useDispatch } from "react-redux";
import { combineReducers } from "redux";
import { LoginUser } from "./redux/action";
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
