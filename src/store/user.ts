/* eslint-disable no-param-reassign */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { verifyUser, setLanguage } from 'api/user';
import { IUserPreferences, IUserSettings } from '../interfaces/user';
import { createAppSlice } from './helpers';

interface IInitialState {
  id: string | null;
  email: string | null;
  loading: boolean;
  settings: IUserSettings;
  preferences: IUserPreferences;
}

const initialState: IInitialState = {
  id: null,
  email: null,
  loading: true,
  settings: {
    language: null,
  },
  preferences: {
    projectsOrder: [],
  },
};

export const restoreSession = createAsyncThunk(
  'user/restoreSession',
  async () => {
    const res = await verifyUser();

    return res;
  },
);

interface ISetUserLanguageInputArgs {
  userId: string;
  language: string
}

export const setUserLanguage = createAsyncThunk(
  'user/setUserLanguage',
  async (data: ISetUserLanguageInputArgs) => {
    const { userId, language } = data;

    const res = await setLanguage(userId, language);

    return res;
  },
);

const userSlice = createAppSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (!action.payload) {
          return;
        }

        const { id, email, preferences } = action.payload;

        state.loading = false;
        state.id = id;
        state.email = email;
        state.preferences = preferences || {};
      })
      .addCase(restoreSession.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(setUserLanguage.pending, (state) => {
        state.loading = true;
      })
      .addCase(setUserLanguage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(setUserLanguage.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default userSlice.reducer;
