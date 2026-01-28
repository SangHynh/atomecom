import type { USER_ROLE } from "../enum/userRole.enum.js";
import type { USER_STATUS } from "../enum/userStatus.enum.js";

export interface UserAddress {
  isDefault: boolean;
  street: string;
  city: string;
  phone: string;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string; 
  role: USER_ROLE;
  addresses: UserAddress[];
  status?: USER_STATUS;
  verified?: boolean;
}