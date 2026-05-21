import { asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit';

// eslint-disable-next-line import/prefer-default-export
export const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});
