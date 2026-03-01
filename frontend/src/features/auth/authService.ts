import axios from "axios";
import { User } from "../../types/User";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ user: User; token: string }> {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      name,
    });
    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem("token");
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  validateUNALEmail(email: string): boolean {
    const unalEmailRegex = /^[a-zA-Z0-9._%+-]+@unal\.edu\.co$/;
    return unalEmailRegex.test(email);
  },
};

export default authService;
