import { DEFAULT_SYSTEM_MESSAGE_DURATION } from '../constants/app';
import { createAppSlice } from './helpers';

export enum EMessageType {
  Default = 'default',
  Info = 'info',
  Attention = 'attention',
  Warning = 'warning',
  Success = 'success',
  Error = 'error',
  Custom = 'custom',
}

export enum EContentType {
  Text = 'text',
  Html = 'html',
  Component = 'component',
}

export interface INotification {
  id: string;
  type: EMessageType;
  duration?: number | 'infinity',
  contentType?: EContentType;
  content?: string;
  component?: string;
  componentProps?: Record<string, any>;
}

interface IInitialState {
  notifications: INotification[],
}

const initialState: IInitialState = {
  notifications: [],
};

const systemNotificationsSlice = createAppSlice({
  name: 'systemNotifications',
  initialState,
  reducers: {
    createSystemNotification: (state, action: { payload: any, type: string }) => {
      const { payload } = action;

      const id = Math.random().toString(16).substring(2);

      state.notifications.push({
        id,
        type: EMessageType.Default,
        contentType: EContentType.Text,
        duration: DEFAULT_SYSTEM_MESSAGE_DURATION,
        ...payload,
      });
    },
    removeSystemNotification: (state, { payload }) => {
      const index = state.notifications.findIndex(({ id }) => id === payload);

      if (index === -1) {
        return;
      }

      state.notifications.splice(index, 1);
    },
  },
});

export const { createSystemNotification, removeSystemNotification } = systemNotificationsSlice.actions;

export default systemNotificationsSlice.reducer;
