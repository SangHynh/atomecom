import type { UserAddress } from "@modules/users/domain/user.domain.js";
import type { USER_ROLE } from "@shared/enum/userRole.enum.js";
import type { USER_STATUS } from "@shared/enum/userStatus.enum.js";

export interface FindAllUserDTO {
  page?: number;
  limit?: number;
  status?: USER_STATUS;
  keyword?: string;
  role?: USER_ROLE;
}
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string; 
  phone?: string;   
  role?: USER_ROLE; 
  addresses?: UserAddress[]; 
}

export interface UpdateUserDTO {
  name?: string;
  addresses?: UserAddress[]; 
}
