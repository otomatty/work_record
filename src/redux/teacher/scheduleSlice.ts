import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";
import { schedulesService } from "../../services/teachers/schedulesService"; // API呼び出し関数をインポート

import { Schedule } from "../../types";

interface ScheduleState {
  schedules: Record<string, Schedule>;
  loading: boolean;
  error: string | null;
}

const initialState: ScheduleState = {
  schedules: {},
  loading: false,
  error: null,
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    fetchSchedulesStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchSchedulesSuccess(
      state,
      action: PayloadAction<Record<string, Schedule>>
    ) {
      state.schedules = action.payload;
      state.loading = false;
    },
    fetchSchedulesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addScheduleStart(state) {
      state.loading = true;
      state.error = null;
    },
    addScheduleSuccess(state, action: PayloadAction<Schedule>) {
      const { dayOfWeek } = action.payload;
      state.schedules[dayOfWeek] = action.payload;
      state.loading = false;
    },
    addScheduleFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchSchedulesStart,
  fetchSchedulesSuccess,
  fetchSchedulesFailure,
  addScheduleStart,
  addScheduleSuccess,
  addScheduleFailure,
} = scheduleSlice.actions;

export const fetchSchedules =
  (teacherId: string): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(fetchSchedulesStart());
      const schedules = await schedulesService.getSchedules(teacherId);
      dispatch(fetchSchedulesSuccess(schedules));
    } catch (error) {
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch(fetchSchedulesFailure(errorMessage));
    }
  };

export const addSchedule =
  (teacherId: string, dayOfWeek: string, schedule: Schedule): AppThunk =>
  async (dispatch) => {
    try {
      dispatch(addScheduleStart());
      await schedulesService.addSchedule(teacherId, dayOfWeek, schedule);
      dispatch(addScheduleSuccess(schedule));
    } catch (error) {
      let errorMessage = "An unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch(addScheduleFailure(errorMessage));
    }
  };

export const selectSchedulesByTeacher = (
  state: RootState,
  teacherId: string
) => {
  const schedules = state.schedule.schedules[teacherId] || {};
  console.log(
    "selectSchedulesByTeacher called with teacherId:",
    teacherId,
    "resulting schedules:",
    schedules
  ); // デバッグ用ログ
  return schedules;
};

export default scheduleSlice.reducer;
