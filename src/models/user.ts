import { DocumentData } from 'firebase/firestore';
import { UserRole } from '../type/UserType';

export interface UserDataFirebase {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    photoUrl: string;
    address: string;
    role: UserRole;
}

// export default type User = Omit<UserDataFirebase,'id'>
export type User = Omit<UserDataFirebase, 'id'>;
