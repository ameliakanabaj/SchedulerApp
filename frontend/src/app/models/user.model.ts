import { AssignmentModel } from "./assignment.model";
import { AvailabilityModel } from "./availability.model";

export interface UserModel {
    user_id: number,
    organization_id?: number,
    password_must_be_reset?: boolean,
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    role: string,
    position?: string,
    assignments: AssignmentModel[],
    availabilities: AvailabilityModel[]
}
