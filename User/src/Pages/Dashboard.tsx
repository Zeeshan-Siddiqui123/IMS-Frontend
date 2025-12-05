// Pages/Dashboard.tsx
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/UserAvatar"
import { userRepo } from "../repositories/userRepo"
import { attRepo } from "../repositories/attRepo"
import { postRepo } from "../repositories/postRepo"
import { likeRepo } from "../repositories/likeRepo"
import { commentRepo } from "../repositories/commentRepo"
import { useAuthStore } from "@/hooks/store/authStore"
import {
  CalendarCheck,
  Clock,
  MessageSquare,
  FileText,
  TrendingUp,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Megaphone,
  Sun,
  Moon,
  TimerIcon
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts"

interface AttendanceRecord {
  _id: string
  createdAt: string
  checkInTime: string | null
  checkOutTime: string | null
  status: string
  shift?: string
  hoursWorked?: number
}

interface PostStat {
  _id: string
  title: string
  likeCount: number
  commentCount: number
  createdAt: string
}

interface AdminAnnouncement {
  _id: string
  title: string
  description: string
  createdAt: string
}

const Dashboard = () => {
  const { user, setUser, isLoading, setLoading } = useAuthStore()

  // States
  const [todayAttendance, setTodayAttendance] = useState<any>(null)
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [myPosts, setMyPosts] = useState<PostStat[]>([])
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(true)

  // Stats
  const [totalHours, setTotalHours] = useState(0)
  const [totalAnnouncements, setTotalAnnouncements] = useState(0)
  const [totalPosts, setTotalPosts] = useState(0)
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    late: 0
  })

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        setLoading(false)
        return
      }
      try {
        const res = await userRepo.profile()
        setUser(res.data)
      } catch (err: any) {
        console.error("Failed to fetch user:", err)
        setLoading(false)
      }
    }
    fetchUser()
  }, [user, setUser, setLoading])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) return

      setDashboardLoading(true)

      try {
        // Fetch today's attendance
        const todayRes = await attRepo.getTodayStatus(user._id)
        setTodayAttendance(todayRes)

        // ✅ FIXED: Fetch ALL attendance history using pagination
        let allHistory: any[] = []
        let currentPage = 1
        let hasMoreData = true

        while (hasMoreData) {
          const historyRes = await attRepo.getUserHistory(user._id, currentPage, 100)
          const pageHistory = historyRes.history || []

          if (pageHistory.length === 0) {
            hasMoreData = false
          } else {
            allHistory = [...allHistory, ...pageHistory]

            // Check if there are more pages
            const totalPages = historyRes.pagination?.totalPages || 1
            if (currentPage >= totalPages) {
              hasMoreData = false
            } else {
              currentPage++
            }
          }
        }

        setAttendanceHistory(allHistory)
        console.log('📊 Total Attendance Records Fetched:', allHistory.length)

        // ✅ UPDATED: Calculate ALL attendance stats from complete history
        const presentCount = allHistory.filter((h: any) => h.status === 'Present').length
        const absentCount = allHistory.filter((h: any) => h.status === 'Absent').length
        const lateCount = allHistory.filter((h: any) => h.status?.includes('Late')).length

        setAttendanceStats({
          present: presentCount,
          absent: absentCount,
          late: lateCount
        })

        // Fetch user's posts
        const postsRes = await postRepo.getAllUsersPosts(1, 100)
        const userPosts = (postsRes.data || []).filter((p: any) => p.user === user._id || p.user?._id === user._id)

        // ✅ CHANGED: Fetch stats for TOP 10 posts only (not all posts)
        let likesTotal = 0
        let commentsTotal = 0
        const postsWithStats: PostStat[] = []

        for (const post of userPosts.slice(0, 10)) {
          try {
            const likesRes = await likeRepo.getLikesByPost(post._id, 1, 1)
            const commentsRes = await commentRepo.getCommentsByPost(post._id, 1, 1)
            const likeCount = likesRes.pagination?.totalItems || 0
            const commentCount = commentsRes.pagination?.totalItems || 0

            likesTotal += likeCount
            commentsTotal += commentCount

            postsWithStats.push({
              _id: post._id,
              title: post.title || 'Untitled',
              likeCount,
              commentCount,
              createdAt: post.createdAt
            })
          } catch (e) {
            console.error('Error fetching post stats:', e)
          }
        }

        setMyPosts(postsWithStats)
        setTotalHours(likesTotal)
        setTotalAnnouncements(commentsTotal)
        setTotalPosts(userPosts.length)

        // Fetch admin announcements
        const announcementsRes = await postRepo.getAllPosts(1, 5)
        setAnnouncements(announcementsRes.data || [])

      } catch (err) {
        console.error("Error fetching dashboard data:", err)
      } finally {
        setDashboardLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?._id])

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Chart colors
  const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6']

  // ✅ UPDATED: Attendance pie data (overall, not last 10 days)
  const attendancePieData = [
    { name: 'Present', value: attendanceStats.present, color: '#22c55e' },
    { name: 'Absent', value: attendanceStats.absent, color: '#ef4444' },
    { name: 'Late', value: attendanceStats.late, color: '#f59e0b' },
  ].filter(d => d.value > 0)

  // ✅ ADDED: Total attendance count display
  const totalAttendanceRecords = attendanceHistory.length

  // Post engagement chart data
  const postEngagementData = myPosts.slice(0, 5).map(post => ({
    name: post.title.length > 15 ? post.title.substring(0, 15) + '...' : post.title,
    likes: post.likeCount,
    comments: post.commentCount
  }))

  // Weekly attendance data (last 7 records)
  const weeklyAttendanceData = attendanceHistory.slice(0, 7).reverse().map(record => ({
    date: new Date(record.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
    hours: record.hoursWorked || (record.checkInTime && record.checkOutTime
      ? Math.round((new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / (1000 * 60 * 60) * 10) / 10
      : 0)
  }))

  const isCheckedIn = Boolean(todayAttendance?.checkInTime)
  const isCheckedOut = Boolean(todayAttendance?.checkOutTime)

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl  font-bold text-foreground">
            Hey Incubatee, {user.name}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your account today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {todayAttendance?.shift && (
            <Badge variant="outline" className="gap-1">
              {todayAttendance.shift === 'Morning' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              {todayAttendance.shift}
            </Badge>
          )}
          {isCheckedIn ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Checked In
            </Badge>
          ) : (
            <Badge variant="secondary">
              <XCircle className="w-3 h-3 mr-1" />
              Not Checked In
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <h3 className="text-2xl font-bold mt-1">{totalPosts}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <h3 className="text-2xl font-bold mt-1">{totalHours}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <TimerIcon className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Annoucements</p>
                <h3 className="text-2xl font-bold mt-1">{totalAnnouncements}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Megaphone className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <h3 className="text-2xl font-bold mt-1">
                  {attendanceHistory.length > 0
                    ? Math.round((attendanceStats.present / attendanceHistory.length) * 100)
                    : 0}%
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Attendance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Admin Announcements
            </CardTitle>
            <CardDescription>Latest updates from admin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        className="h-8 w-8 bg-primary"
                        fallbackColor="bg-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{announcement.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {announcement.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Megaphone className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm">No announcements yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ✅ UPDATED: Attendance Pie Chart with total count */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Attendance Overview
            </CardTitle>
            <CardDescription>
              Your overall attendance distribution ({totalAttendanceRecords} total records)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attendancePieData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={attendancePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {attendancePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                {/* ✅ ADDED: Summary stats below chart */}
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-muted-foreground">Present: {attendanceStats.present}</span>
                  </div> <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-muted-foreground">Late: {attendanceStats.late}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-muted-foreground">No attendance data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Hours & Announcements */}
      <div className="lg:grid-cols-2 gap-6">
        {/* Weekly Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Weekly Hours
            </CardTitle>
            <CardDescription>Hours worked in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyAttendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Hours"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-muted-foreground">No attendance data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Announcements */}

      </div>
    </div>
  )
}

export default Dashboard