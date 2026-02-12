import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  firstName : string;
  lastName:string;
  address:string;
  age:number;
  gender:string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface UserState {
  allUsers: User[];
  selectedUser: User | null;
}

const initialState: UserState = {
  allUsers: [],
  selectedUser: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAllUsers: (state, action: PayloadAction<User[]>) => {
      state.allUsers = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    clearUserState: () => initialState,
  },
});

export const { setAllUsers, setSelectedUser, clearUserState } = userSlice.actions;
export default userSlice.reducer;