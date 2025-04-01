import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice"; // Import user slice

export const store = configureStore({
  reducer: {
    user: userReducer, 
  },
});
