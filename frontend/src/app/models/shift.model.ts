import { AssignmentModel } from "./assignment.model";

export interface ShiftModel {
    id: number,
    organization_id: number,
    start_time: Date,
    end_time: Date,
    required_people?: number,
    place?: string,
    assignments: AssignmentModel[],
}
