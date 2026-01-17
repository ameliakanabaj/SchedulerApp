import { AssignmentModel } from "./assignment.model";

export interface ShiftModel {
    shift_id: number,
    organization_id: number,
    start_time: string,
    end_time: string,
    required_people?: number,
    place?: string,
    assignments?: AssignmentModel[],
}
