import { ShiftModel } from "./shift.model";
import { UserModel } from "./user.model";

export interface OrganizationModel {
    id: string,
    name: string,
    users: UserModel[];
    shifts: ShiftModel[];
}
