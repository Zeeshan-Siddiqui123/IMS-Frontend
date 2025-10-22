import React, { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { attRepo } from "@/repositories/attRepo";
import Loader from "@/components/Loader";
import dayjs from "dayjs"

interface AttendanceData {
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
}

interface HistoryRecord {
  _id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
}

interface Props {
  userId: string;
}

const Attendance: React.FC<Props> = ({ userId }) => {
  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // ✅ Load today's attendance
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await attRepo.getTodayStatus(userId);
        setAttendance(res || null);
      } catch (err: any) {
        console.error(err);
      }
    };
    fetchAttendance();
  }, [userId]);

  // ✅ Load user attendance history
  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const res = await attRepo.getUserHistory(userId);
        setHistory(res.history || []);
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  // ✅ Columns for Ant Design Table
  const columns: ColumnsType<HistoryRecord> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Check In",
      dataIndex: "checkInTime",
      key: "checkInTime",
      render: (text) =>
        text ? new Date(text).toLocaleTimeString() : "—",
    },
    {
      title: "Check Out",
      dataIndex: "checkOutTime",
      key: "checkOutTime",
      render: (text) =>
        text ? new Date(text).toLocaleTimeString() : "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  const isCheckedIn = Boolean(attendance?.checkInTime);
  const isCheckedOut = Boolean(attendance?.checkOutTime);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold ml-5 mt-5">Today's Status</h2>

      {isCheckedIn && (
        <div className="bg-gray-100 dark:bg-neutral-800 p-3 rounded-md shadow-sm text-sm w-fit ml-5">
          <p>
            <span className="font-semibold">Status:</span>{" "}
            {attendance?.status || (isCheckedOut ? "Checked Out" : "Checked In")}
          </p>
          <p>
            <span className="font-semibold">Check-in Time:</span>{" "}
            {attendance?.checkInTime
              ? new Date(attendance.checkInTime).toLocaleTimeString()
              : "—"}
          </p>
          <p>
            <span className="font-semibold">Check-out Time:</span>{" "}
            {attendance?.checkOutTime
              ? new Date(attendance.checkOutTime).toLocaleTimeString()
              : "Not checked out yet"}
          </p>
        </div>
      )}

      {/* ✅ History Table */}
      <div>
        <h2 className="text-lg font-semibold mb-2 ml-5">Your Attendance History</h2>
        {isHistoryLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-500 ml-5">No records found.</p>
        ) : (
          <Table
            columns={columns}
            dataSource={history.map((item) => ({ ...item, key: item._id }))}
            pagination={{ pageSize: 5 }}
            bordered
            className="ml-5 mr-5"
          />
        )}
      </div>
    </div>
  );
};

export default Attendance;
