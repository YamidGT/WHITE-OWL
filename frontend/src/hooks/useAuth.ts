import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../app/store";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from "../features/auth/authSlice";
import authService from "../features/auth/authService";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async (email: string, password: string) => {
    dispatch(loginStart());
    try {
      const data = await authService.login(email, password);
      dispatch(loginSuccess(data));
      return true;
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      return false;
    }
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: logoutUser,
  };
};
