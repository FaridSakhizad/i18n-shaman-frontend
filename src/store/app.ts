import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAppLanguagesData } from 'api/languages';
import { ILanguage } from 'interfaces';

interface IInitialState {
  loading: boolean;
  languages: ILanguage[],
}

const initialState: IInitialState = {
  loading: false,
  languages: [],
};

export const getAppLanguages = createAsyncThunk(
  'appSlice/getAppLanguages',
  async () => {
    const res = await getAppLanguagesData();

    return res;
  },
);

const appSlice = createSlice({
  name: 'appSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAppLanguages.pending, (state) => {
        // eslint-disable-next-line no-param-reassign
        state.loading = true;
      })
      .addCase(getAppLanguages.fulfilled, (state, action) => {
        const { payload } = action;

        // eslint-disable-next-line no-param-reassign
        state.loading = false;
        // eslint-disable-next-line no-param-reassign
        state.languages = payload;
      })
      .addCase(getAppLanguages.rejected, (state) => {
        // eslint-disable-next-line no-param-reassign
        state.loading = false;
      });
  },
});

export default appSlice.reducer;
