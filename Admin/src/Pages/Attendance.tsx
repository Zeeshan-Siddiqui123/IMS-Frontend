import { useEffect, useState } from "react"
import { attendanceRepo } from "@/repositories/attendanceRepo"
import { Button } from "@/components/ui/button"
import { Input, Select, Table, message } from "antd"
import Loader from "@/components/Loader"


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
      filterByDate("today", data || []) 

      console.log(data);
      
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
      const dateKey = new Date(item.createdAt).toISOString().split("T")[0]
      const key = `${userId}_${dateKey}`

      if (!map.has(key)) {
        map.set(key, {
          key,
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

  // 📅 Date Filters (no dayjs)
  const filterByDate = (type: string, baseData = allHistory) => {
    const today = new Date()
    let filtered: any[] = []

    switch (type) {
      case "today":
        filtered = baseData.filter((rec) => {
          const recDate = new Date(rec.createdAt)
          return (
            recDate.getDate() === today.getDate() &&
            recDate.getMonth() === today.getMonth() &&
            recDate.getFullYear() === today.getFullYear()
          )
        })
        break

      case "previousMonth":
        const prevMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1
        const prevYear = prevMonth === 11 ? today.getFullYear() - 1 : today.getFullYear()
        filtered = baseData.filter((rec) => {
          const recDate = new Date(rec.createdAt)
          return (
            recDate.getMonth() === prevMonth &&
            recDate.getFullYear() === prevYear
          )
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

  // 📝 Table Columns
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
      render: (date: string) =>
        date
          ? new Date(date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—",
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
  if (loading) {
  return (
    <div className="flex  items-center justify-center h-screen">
      <Loader /> {/* Apka custom Loader component */}
    </div>
  )
}

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
        pagination={false}
        locale={{ emptyText: "No attendance records found." }}
        className="mt-4"
        bordered
      />
    </div>
  )
}

export default Attendance
