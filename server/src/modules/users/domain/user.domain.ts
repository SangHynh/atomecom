import type { USER_ROLE } from '@enum/userRole.enum.js';
import type { USER_STATUS } from '@enum/userStatus.enum.js';

export interface UserAddress {
  isDefault: boolean;
  street: string;
  city: string;
  version?: number;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: USER_ROLE;
  addresses: UserAddress[];
  status?: USER_STATUS;
  isVerified?: boolean;
  version?: number;
}
