import { ShiftModel } from "./shift.model";
import { UserModel } from "./user.model";

export interface AssignmentModel {
    assignment_id: number;
    shift_id: number;
    schedule_id: number;
    user_id: number;
    role_on_shift?: string;

    shift: ShiftModel;
    user?: UserModel;
}