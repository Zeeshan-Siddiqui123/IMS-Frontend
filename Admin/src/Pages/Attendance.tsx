import { useEffect, useState } from "react"
import { attendanceRepo } from "@/repositories/attendanceRepo"
import { Button } from "@/components/ui/button"
import { Input, Select, Table, message } from "antd"
import dayjs from "dayjs"

const { Option } = Select

const Attendance = () => {
  const [searchName, setSearchName] = useState("")
  const [allHistory, setAllHistory] = useState<any[]>([])
  const [filteredHistory, setFilteredHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dateFilter, setDateFilter] = useState("today")

  // 📥 Fetch All History on Mount
  const fetchAllHistory = async () => {
    try {
      setLoading(true)
      const data = await attendanceRepo.getAttendanceHistory()
      setAllHistory(data || [])
      filterByDate("today", data || []) // ⏰ default
    } catch (error) {
      console.error("Error fetching all history:", error)
      message.error("Failed to fetch history")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllHistory()
  }, [])

  // 🔍 Search by Name
  const handleSearch = () => {
    if (!searchName.trim()) {
      filterByDate(dateFilter, allHistory)
      return
    }
    const lowerName = searchName.toLowerCase()
    const filtered = filteredHistory.filter((record) =>
      record.user?.name?.toLowerCase().includes(lowerName)
    )
    setFilteredHistory(filtered)
  }

  // 🧠 Group Records by (User + Date)
  const groupByUserAndDate = (data: any[]) => {
    const map = new Map()
    data.forEach((item) => {
      const userId = item.user?._id || item.user?.id
      const dateKey = dayjs(item.date).format("YYYY-MM-DD")
      const key = `${userId}_${dateKey}`

      if (!map.has(key)) {
        map.set(key, {
          key, // AntD Table needs a key
          user: item.user,
          date: dateKey,
          status: item.status,
          checkInTime: item.checkInTime,
          checkOutTime: item.checkOutTime,
        })
      }
    })
    return Array.from(map.values())
  }

  // 📅 Date Filters
  const filterByDate = (type: string, baseData = allHistory) => {
    const today = dayjs()
    let filtered: any[] = []

    switch (type) {
      case "today":
        filtered = baseData.filter((rec) =>
          dayjs(rec.date).isSame(today, "day")
        )
        break
      
        break
      case "previousMonth":
        const startPrev = today.subtract(1, "month").startOf("month")
        const endPrev = today.subtract(1, "month").endOf("month")
        filtered = baseData.filter((rec) => {
          const d = dayjs(rec.date)
          return d.isAfter(startPrev.subtract(1, "day")) && d.isBefore(endPrev.add(1, "day"))
        })
        break
      case "overall":
      default:
        filtered = baseData
        break
    }

    const grouped = groupByUserAndDate(filtered)
    setFilteredHistory(grouped)
  }

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value)
    filterByDate(value)
  }

  // 📝 Columns for AntD Table
    const columns = [
    {
      title: "Name",
      dataIndex: ["user", "name"],
      key: "name",
      render: (text: any) => text || "—",
    },
    {
      title: (
        <div className="flex flex-col">
          <span>Date</span>
          <Select
            value={dateFilter}
            onChange={handleDateFilterChange}
            size="small"
            style={{ width: 140, marginTop: 4 }}
          >
            <Option value="today">Today</Option>
            <Option value="previousMonth">Previous Month</Option>
            <Option value="overall">Overall</Option>
            
          </Select>
        </div>
      ),
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD MMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => text || "—",
    },
    {
      title: "Check In",
      dataIndex: "checkInTime",
      key: "checkInTime",
      render: (time: string) =>
        time ? new Date(time).toLocaleTimeString() : "—",
    },
    {
      title: "Check Out",
      dataIndex: "checkOutTime",
      key: "checkOutTime",
      render: (time: string) =>
        time ? new Date(time).toLocaleTimeString() : "—",
    },
  ]

  return (
    <div className="p-6 space-y-4">
      {/* 🔍 Search */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Enter User Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="w-60"
        />
        <Button onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </div>

      {/* 📊 Ant Design Table */}
      <Table
        columns={columns}
        dataSource={filteredHistory}
        loading={loading}
        pagination={false}
        locale={{ emptyText: "No attendance records found." }}
        className="mt-4"
        bordered
      />
    </div>
  )
}

export default Attendance
