import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { message, Spin } from "antd"
import { SectionCards } from "@/components/section-cards"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { userRepo } from "@/repositories/userRepo"

interface User {
  _id: string
  name: string
  bq_id: string
  email: string
  phone: string
  CNIC: string
  course: string
}



export default function Page() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])

  const fetchUsers = async () => {
    try {
      const data = await userRepo.getAllUsers()
      setUsers(data || [])
    } catch {
      message.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])
  return (

    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
            <div className="rounded-lg border shadow-sm bg-white dark:bg-neutral-900 mt-4">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Spin size="large" />
              </div>
            ) : (
              <div >
                <Table >
                <TableHeader className="bg-neutral-100 dark:bg-neutral-800">
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>BQ Id</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>CNIC</TableHead>
                    <TableHead>Course</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <TableRow key={user._id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell>{user.bq_id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.CNIC}</TableCell>
                        <TableCell>{user.course}</TableCell>
                        
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
              
            )}
          </div>
          </div>
          
          {/* <DataTable  /> */}
        </div>
      </div>
    </div>

  )
}
