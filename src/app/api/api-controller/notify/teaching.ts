import {
    Attendance,
    errorResponse,
    Shift,
    ShiftWithDate,
    successResponse,
} from "@/lib/types";
import { lineMessagingApiClient } from "@/lib/line";
import { sql } from "@/lib/neon";
import { sendGroupMessage } from "../line/send";

function parseTimeToToday(timeString: string) {
    const [hour, minute] = timeString.split(":").map(Number);

    const nowJakarta = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );

    nowJakarta.setHours(hour, minute, 0, 0);
    return nowJakarta;
}

async function getAttendanceData(): Promise<Attendance[]> {
    const nowDate = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );
    const transactionDate = nowDate.toISOString().split("T")[0];

    const shifts = await fetch(
        "https://bluejack.binus.ac.id/lapi/api/Lecturer/GetShifts",
        {
            method: "GET",
            headers: {
                "X-Recsel-Secret": process.env.SLC_X_RECSEL_SECRET!,
            },
        }
    );

    const shiftsData = await shifts.json();

    const upcomingShifts: ShiftWithDate[] = shiftsData
        .map((s: Shift) => ({
            ...s,
            startDate: parseTimeToToday(s.Start),
        }))
        .sort(
            (a: ShiftWithDate, b: ShiftWithDate) =>
                Math.abs(a.startDate.getTime() - nowDate.getTime()) -
                Math.abs(b.startDate.getTime() - nowDate.getTime())
        );

    const closestShiftId =
        upcomingShifts.length > 0 ? upcomingShifts[0].ShiftId : null;

    if (!closestShiftId) {
        console.log("No upcoming shifts found.");
        return [];
    }
    console.log(`Closest shift ID: ${closestShiftId}`);

    const attendance = await fetch(
        `https://bluejack.binus.ac.id/lapi/api/Lecturer/GetLecturerAttendanceByLaboratoryId?transactionDate=${transactionDate}&shiftId=${closestShiftId}&labId=f5bbcbf8-7faa-df11-bca3-d8d385fce79c`,
        {
            method: "GET",
            headers: {
                "X-Recsel-Secret": process.env.SLC_X_RECSEL_SECRET!,
            },
        }
    );

    const attendanceRawData = await attendance.json();
    console.log(JSON.stringify(attendanceRawData));
    return attendanceRawData.RoomAttendance ?? [];
}

export async function checkTeachingSchedule() {
    try {
        const attendanceData = await getAttendanceData();

        if (attendanceData.length === 0) {
            console.log("No attendance data found for current shift.");
            return successResponse("No Teaching Schedule Found.");
        }

        const nonPresentLecturers = attendanceData
            .filter((a) => a.CampusName === "ASM" && a.GSLC === false)

            .flatMap((a) => {
                return a.Lecturers.flatMap((lect) => {
                    const target =
                        lect.First.Status === "Substituted"
                            ? lect.Next
                            : lect.First;
                    if (target.Status !== "Present") {
                        return [
                            {
                                UserName: target.UserName,
                                CourseName: a.CourseName,
                                ClassName: a.ClassName,
                                Room: a.Room,
                            },
                        ];
                    }

                    return [];
                });
            });

        console.log(
            `Non-present lecturers: ${JSON.stringify(nonPresentLecturers)}`
        );

        if (nonPresentLecturers.length === 0) {
            console.log("All lecturers are present.");
            return successResponse("All lecturers are present.");
        }

        const messages = await Promise.all(
            nonPresentLecturers.map(async (lect) => {
                const userId =
                    await sql`SELECT line_id FROM assistants WHERE initial = ${lect.UserName}`.then(
                        (res) => (res.length > 0 ? res[0].line_id : null)
                    );

                return {
                    text: `${lect.CourseName} - ${lect.ClassName} - ${lect.Room}`,
                    userId: userId,
                    mention: userId ? true : false,
                };
            })
        );
        console.log(`Messages to be sent: ${JSON.stringify(messages)}`);

        const sendMessageResponse = await sendGroupMessage(messages);

        if (!sendMessageResponse.success) {
            throw new Error(
                `Failed to send notification message: ${sendMessageResponse.message}`
            );
        }
        return successResponse("Teaching schedule check completed.");
    } catch (error) {
        console.error("Error in checking teaching schedule:", error);

        lineMessagingApiClient.pushMessage({
            to: process.env.LINE_RMOSUBCO_GROUP_ID!,
            messages: [
                {
                    type: "text",
                    text: `Dear RMO & Subco, \n\nAn error occured while checking attendance data.\n\nPlease check attendance transaction immediately.\n\nThank you.`,
                },
            ],
        });

        return errorResponse("An internal error occured: " + error, 500);
    }
}
