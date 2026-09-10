/* eslint-disable no-param-reassign */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createUserProject,
  updateUserProject,
  deleteUserProject,
  getUserProjects,
} from 'api/projects';
import { IProject } from 'interfaces';
import { isApiError } from 'api/errors';

interface IInitialState {
  projects: IProject[] | null;
  loading: boolean;
}

const initialState: IInitialState = {
  projects: null,
  loading: false,
};

export const getProjects = createAsyncThunk(
  'projects/getProjects',
  async (_, { rejectWithValue }) => {
    const res = await getUserProjects();

    if (isApiError(res)) {
      return rejectWithValue(res);
    }

    return res;
  },
);

interface ICreateProjectInputArgs {
  newProjectName: string;
}

export const createProject = createAsyncThunk(
  'projects/createProject',
  async ({ newProjectName }: ICreateProjectInputArgs, { rejectWithValue }) => {
    const res = await createUserProject({
      projectName: newProjectName,
      projectId: Math.random().toString(16).substring(2),
    });

    if (isApiError(res)) {
      return rejectWithValue(res);
    }

    return res;
  },
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async (project: IProject, { rejectWithValue }) => {
    const res = await updateUserProject(project);

    if (isApiError(res)) {
      return rejectWithValue(res);
    }

    return res;
  },
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId: string, { rejectWithValue }) => {
    const res = await deleteUserProject(projectId);

    if (isApiError(res)) {
      return rejectWithValue(res);
    }

    return res;
  },
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getProjects.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(createProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(createProject.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;

        if (!state.projects) {
          return;
        }

        const projects = state.projects.map((item) => item);

        if (!projects) {
          return;
        }

        const index = projects.findIndex(({ projectId }) => projectId === action.payload.projectId);

        if (index < 0) {
          return;
        }

        state.projects[index] = action.payload;
      })
      .addCase(updateProject.rejected, (state) => {
        state.loading = false;
      });

    builder
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(deleteProject.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default projectsSlice.reducer;
