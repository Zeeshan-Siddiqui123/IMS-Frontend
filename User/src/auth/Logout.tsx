import { Modal } from "antd"
import { toast } from "sonner"
import { userRepo } from "@/repositories/userRepo"
import { useNavigate } from "react-router-dom"

const Logout = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    Modal.confirm({
      title: "Are you sure?",
      content: "Do you really want to logout?",
      okText: "Logout",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await userRepo.logoutUser()
          // Clear token used for socket auth
          localStorage.removeItem('token')
          toast.success("Logout successful")
          navigate("/login")
        } catch (err) {
          toast.error("Logout failed")
        }
      },
    })
  }

  return (
    <button id="logoutBtn" className="hidden" onClick={handleLogout}></button>
  )
}

export default Logout
