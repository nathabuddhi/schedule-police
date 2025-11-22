import { checkTeachingSchedule } from "@/app/api/api-controller/notify/teaching";

export async function POST() {
    return await checkTeachingSchedule();
}
