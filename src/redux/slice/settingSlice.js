import { createSlice } from "@reduxjs/toolkit";

const settingSlice = createSlice({
  name: "setting",
  initialState: {
    settingItem: [],
  },
  reducers: {
    // החלפה של הגדרה קיימת, או הוספה אם אינה קיימת.
    //
    // כאן היה באג: שני הענפים של ה-map החזירו את הפריט הישן (x) ולא את
    // action.payload, כך שעדכון הגדרה קיימת לא עשה דבר. מכיוון שהמצב נשמר
    // ל-sessionStorage, לקוח שכבר טען את ההגדרות פעם אחת נשאר נעול עליהן
    // לכל אורך הגלישה - וכל שינוי בפאנל הניהול לא הגיע אליו.
    addSetting: (state, action) => {
      const exists = state.settingItem.some(
        (x) => x.name === action.payload.name
      );

      return {
        ...state,
        settingItem: exists
          ? state.settingItem.map((x) =>
              x.name === action.payload.name ? action.payload : x
            )
          : [...state.settingItem, action.payload],
      };
    },
    removeSetting: (state, action) => {
      return {
        ...state,
        settingItem: state.settingItem.filter((x) => x.name !== action.payload),
      };
    },

    clearSetting: (state) => {
      return {
        ...state,
        settingItem: [],
      };
    },
  },
});

export const { addSetting, removeSetting, clearSetting } = settingSlice.actions;

export default settingSlice.reducer;
