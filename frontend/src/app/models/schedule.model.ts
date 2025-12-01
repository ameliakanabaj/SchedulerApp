import { AssignmentModel } from "./assignment.model";

export interface ScheduleModel {
    id: number,
    organization_id: number,
    date_from: Date | string,
    date_to: Date | string,
    generatedAt: Date | string,
    status: string,
    deadline_generate_date: Date | string,
    assignments?: AssignmentModel[],
}
