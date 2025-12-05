"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Edit3, Camera, Loader2 } from "lucide-react"
import { userRepo } from "../repositories/userRepo"
import { useAuthStore } from "@/hooks/store/authStore"

export default function ProfileShadCN() {
  const { user: authUser, setUser: setAuthUser } = useAuthStore()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState<any>({
    name: "",
    bq_id: "",
    email: "",
    phone: "",
    CNIC: "",
    course: "",
    gender: "",
    shift: "",
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userRepo.profile()
        setUser(res.user || res)
        setFormData({
          ...formData,
          ...{
            name: res.user?.name || res.name,
            bq_id: res.user?.bq_id || res.bq_id,
            email: res.user?.email || res.email,
            phone: (res.user?.phone || "").startsWith("92") ? (res.user?.phone || "").slice(2) : (res.user?.phone || ""),
            CNIC: res.user?.CNIC || "",
            course: res.user?.course || "",
            gender: res.user?.gender || "",
            shift: res.user?.shift || "",
          },
        })
        setEditingId(res.user?._id || res._id)
      } catch (err) {
        console.error(err)
        toast.error("Failed to fetch profile")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length <= 10) {
        setFormData({ ...formData, [name]: cleaned });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        const dataToSend = {
          ...formData,
          phone: formData.phone ? `92${formData.phone}` : "",
        };
        await userRepo.updateUser(editingId, dataToSend)
        setUser({ ...user, ...dataToSend })
        toast.success("Profile updated successfully")
      }
      setIsModalOpen(false)
    } catch (error: any) {
      console.error(error)
      toast.error("Action failed")
    }
  }

  const handleAvatarClick = () => {
    avatarInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB")
      return
    }

    try {
      setIsUploadingAvatar(true)
      const res = await userRepo.updateAvatar(file)

      setUser({ ...user, avatar: res.user.avatar })

      if (authUser) {
        setAuthUser({ ...authUser, avatar: res.user.avatar } as any)
      }

      toast.success("Avatar updated successfully")
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || "Failed to update avatar")
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  const profileFields = [
    { label: "BQ ID", value: user?.bq_id },
    { label: "Name", value: user?.name },
    { label: "Email", value: user?.email },
    { label: "Phone", value: user?.phone },
    { label: "CNIC", value: user?.CNIC },
    { label: "Course", value: user?.course },
    { label: "Gender", value: user?.gender },
    { label: "Shift", value: user?.shift },
  ]

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center gap-4">
            {/* Avatar with upload functionality */}
            <div className="relative group">
              <div
                className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer"
                onClick={handleAvatarClick}
              >
                {isUploadingAvatar ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                  </div>
                ) : (
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=6366f1&color=fff`}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Camera overlay */}
              <div
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={handleAvatarClick}
              >
                <Camera className="w-6 h-6 text-white" />
              </div>

              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isUploadingAvatar}
              />
            </div>

            <div>
              <span className="text-3xl font-bold text-gray-900">{user?.name || "Student Name"}</span>
              <p className="text-gray-500">{user?.incubation_id || "N/A"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="default" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" /> Edit Profile
            </Button>
          </div>
        </div>

        {/* Tabs for Details */}
        <Card className="p-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsContent value="details" className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileFields.map((field, idx) => (
                <Card key={idx} className="p-4 flex flex-col gap-1 border border-gray-200 shadow hover:shadow-md transition">
                  <CardContent className="p-0">
                    <p className="text-sm text-gray-400">{field.label}</p>
                    <p className="font-semibold text-gray-900">{field.value || "N/A"}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Dialog for updating profile */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {["name", "bq_id", "email", "CNIC"].map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="text-sm font-medium">
                    {field.toUpperCase()}
                  </Label>
                  <Input
                    id={field}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                  />
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  PHONE
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 font-medium">
                    +92
                  </span>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-12"
                    placeholder="3001234567"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}