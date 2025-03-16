import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { auth: false }, // Initial authentication state
  reducers: {
    setUser: (state, action) => {
      state.auth = action.payload; // Update authentication state
    },
    logout: (state) => {
      state.auth = false; // Clear auth state on logout
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
