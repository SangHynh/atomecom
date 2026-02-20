import { USER_ROLE } from '../enums/userRole.enum.js';
import { USER_STATUS } from '../enums/userStatus.enum.js';

export interface Address {
  street: string;
  city: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: USER_ROLE;
  status: USER_STATUS;
  isVerified: boolean;
  addresses: Address[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isOnline?: boolean;
  lastIp?: string;
  lastDevice?: string;
  deletedAt?: string;
}
