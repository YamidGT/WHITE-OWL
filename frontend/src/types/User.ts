export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "professor" | "admin";
  createdAt?: string;
  updatedAt?: string;
}

export default User;
