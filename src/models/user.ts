import { UserRole } from '../type/UserType';
export default interface User {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    photoUrl: string;
    address: string;
    role: UserRole;
}
