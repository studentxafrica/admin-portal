import { Merchant, User } from "@/types/user";
import { createSlice } from "@reduxjs/toolkit";


export interface AuthState {
	user: Merchant | null;
	role: string | null;
	adminType: string | null;
}

const initialValue = {
	user: null,
	role: null,
	adminType: null
};

const authSlice = createSlice({
	name: "auth",
	initialState: initialValue,
	reducers: {
		setCurrentUser(state, action) {
			state.user = action.payload.user;
			state.role = action.payload.role;
			state.adminType = action.payload.adminType;
		},
		setLogout(state) {
			state.user = null;
			state.role = null;
			state.adminType = null;
			localStorage.clear();
		},
	},
});

export const { setCurrentUser, setLogout } = authSlice.actions;

export const authReducer = authSlice.reducer;
