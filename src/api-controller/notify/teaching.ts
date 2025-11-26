import {
    Attendance,
    NonPresentLecturer,
    RegionMap,
    Shift,
    ShiftWithDate,
    StandardResponse,
} from "@/lib/types";
import { lineMessagingApiClient } from "@/lib/line";
import { sql } from "@/lib/neon";
import { sendTeachingReminderToGroup } from "@/api-controller/line/send";

function parseTimeToToday(timeString: string) {
    const [hour, minute] = timeString.split(":").map(Number);

    const nowJakarta = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );

    nowJakarta.setHours(hour, minute, 0, 0);
    return nowJakarta;
}

async function getCurrentShiftId(nowDate: Date): Promise<string | null> {
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

    const shiftsWithDate: ShiftWithDate[] = shiftsData.map((s: Shift) => ({
        ...s,
        startDate: parseTimeToToday(s.Start),
    }));

    const futureShifts = shiftsWithDate.filter(
        (s) => s.startDate.getTime() > nowDate.getTime()
    );

    if (futureShifts.length === 0) return null;

    futureShifts.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return futureShifts[0].ShiftId;
}

async function getAttendanceData(): Promise<Attendance[]> {
    const nowDate = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );
    const transactionDate = nowDate.toISOString().split("T")[0];

    const closestShiftId = await getCurrentShiftId(nowDate);

    if (!closestShiftId) {
        console.warn("No upcoming shifts found.");
        return [];
    }

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
    return attendanceRawData.RoomAttendance ?? [];
}

function getNonPresentLecturersByRegion(
    attendanceData: Attendance[]
): RegionMap {
    return attendanceData
        .filter((a) => !a.GSLC)
        .reduce<RegionMap>((acc, record) => {
            const region = record.CampusName;

            const nonPresent = record.Lecturers.map((lect) => {
                const target =
                    lect.First.Status === "Substituted"
                        ? lect.Next
                        : lect.First;

                if (!target || target.Status === "Present") {
                    return null;
                }

                return {
                    UserName: target.UserName,
                    CourseName: record.CourseName,
                    ClassName: record.ClassName,
                    Room: record.Room,
                } as NonPresentLecturer;
            }).filter((i): i is NonPresentLecturer => i !== null);

            if (nonPresent.length > 0) {
                acc[region] = [...(acc[region] ?? []), ...nonPresent];
            }

            return acc;
        }, {});
}

export async function checkTeachingSchedule(): Promise<StandardResponse<void>> {
    try {
        const activeRegionKeys =
            await sql`SELECT DISTINCT(region) FROM active_regions`;

        if (activeRegionKeys.length === 0) {
            console.warn("No active regions found in the database.");
            return { success: true, message: "No active regions found." };
        }

        const attendanceData = await getAttendanceData();

        if (attendanceData.length === 0) {
            console.log("No attendance data found for current shift.");
            return { success: true, message: "No attendance data found." };
        }

        const nonPresentLecturersByRegion =
            getNonPresentLecturersByRegion(attendanceData);

        for (const row of activeRegionKeys) {
            if (nonPresentLecturersByRegion[row.region]?.length === 0) {
                console.log(`All ${row.region} lecturers are present.`);
                continue;
            }
            const groupIdReq =
                await sql`SELECT * FROM active_regions WHERE region = ${row.region} `;

            if (groupIdReq.length === 0) {
                console.error(`No group ID found for region: ${row.region}`);
                continue;
            }

            const groupId = groupIdReq[0];

            const nonPresentLecturers =
                nonPresentLecturersByRegion[row.region] ?? [];

            const messages = await Promise.all(
                nonPresentLecturers.map(async (lect) => {
                    const userId =
                        await sql`SELECT line_id FROM assistants WHERE initial = ${lect.UserName}`.then(
                            (res) => (res.length > 0 ? res[0].line_id : null)
                        );

                    return {
                        text: `${lect.CourseName} - ${lect.ClassName} - ${lect.Room}`,
                        userId: userId ? userId : lect.UserName,
                        mention: userId ? true : false,
                    };
                })
            );

            const sendMessageResponse = await sendTeachingReminderToGroup(
                messages,
                groupId.remind_group_line_id
            );
            if (!sendMessageResponse.success) {
                console.error(
                    `Failed to send notification message: ${sendMessageResponse.message}`
                );
                lineMessagingApiClient.pushMessage({
                    to: groupId.op_group_line_id,
                    messages: [
                        {
                            type: "text",
                            text: `Dear OP Officers, \n\nAn error occured while checking attendance data.\n\nPlease check attendance transaction immediately.\n\nThank you.`,
                        },
                    ],
                });

                continue;
            }
        }
        return { success: true, message: "Teaching schedule check completed." };
    } catch (error) {
        console.error("Error in checking teaching schedule:", error);

        return {
            success: false,
            message: `Error checking teaching schedule: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        };
    }
}
