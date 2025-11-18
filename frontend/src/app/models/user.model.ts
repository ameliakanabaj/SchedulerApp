import { AssignmentModel } from "./assignment.model";
import { AvailabilityModel } from "./availability.model";

export interface UserModel {
    id: number,
    organization_id?: number,
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    role: string,
    position?: string,
    assignments: AssignmentModel[],
    availabilities: AvailabilityModel[]
}