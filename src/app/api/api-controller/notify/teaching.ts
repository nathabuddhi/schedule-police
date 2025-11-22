import {
    Attendance,
    errorResponse,
    Shift,
    ShiftWithDate,
    successResponse,
} from "@/lib/types";

function parseTimeToToday(timeString: string) {
    const [hour, minute] = timeString.split(":").map(Number);

    const nowJakarta = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );

    nowJakarta.setHours(hour, minute, 0, 0);
    return nowJakarta;
}

export async function checkTeachingSchedule() {
    try {
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
            return;
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
        const attendanceData = attendanceRawData.RoomAttendance;
        if (attendanceData.length === 0) {
            console.log("No attendance data found for current shift.");
            return successResponse("No Teaching Schedule Found.");
        }

        return notifyTeachingSchedule(attendanceData);
    } catch (error) {
        console.error("Error in checking teaching schedule:", error);
        return errorResponse("An internal error occured: " + error, 500);
    }
}

function notifyTeachingSchedule(attendanceData: Attendance[]) {
    console.log("Notifying teaching schedule: ", attendanceData);
}
