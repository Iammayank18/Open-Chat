import { configureStore } from "@reduxjs/toolkit";
import MainReducer from "./reducer";

export default configureStore({
  reducer: {
    MainReducer,
  },
});
