import React, { useState } from "react"
import { message } from "antd"
import { CiUnread, CiRead } from "react-icons/ci"
import { userRepo } from "../repositories/userRepo"
import { Button } from "../components/ui/button"


const SignUp: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [formData, setFormData] = useState({
        name: "",
        bq_id: "",
        email: "",
        password: "",
        phone: "",
        CNIC: "",
        course: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        try {
            await userRepo.addUser(formData)
            message.success("User registered successfully")
            setFormData({
                name: "",
                bq_id: "",
                email: "",
                password: "",
                phone: "",
                CNIC: "",
                course: "",
            })
            setErrors({})
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors)
            } else {
                message.error(error.response?.data?.message || "Registration failed")
            }
        }
    }

    return (

            <div className="max-w-xl mx-auto p-6 mt-10 rounded-lg border shadow bg-white dark:bg-neutral-900">
                <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {[
                        { name: "name", label: "Full Name", type: "text" },
                        { name: "bq_id", label: "BQ ID", type: "text" },
                        { name: "email", label: "Email", type: "email" },
                        { name: "phone", label: "Phone", type: "text" },
                        { name: "CNIC", label: "CNIC", type: "text" },
                        { name: "course", label: "Course", type: "text" },
                        { name: "password", label: "Password", type: showPassword ? "text" : "password" },
                    ].map((input) => (
                        <div key={input.name} className="relative z-0 w-full group">
                            <input
                                type={input.type}
                                name={input.name}
                                id={input.name}
                                value={(formData as any)[input.name]}
                                onChange={handleChange}
                                className={`peer block w-full appearance-none border-0 border-b-2 bg-transparent py-2.5 px-0 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0
              ${errors[input.name] ? "border-red-500" : "border-gray-300"}`}
                                placeholder=" "
                                autoComplete="off"
                            />
                            <label
                                htmlFor={input.name}
                                className={`absolute top-3 origin-[0] transform text-gray-500 duration-200 
              ${(formData as any)[input.name]
                                        ? "-translate-y-6 scale-75 text-blue-600"
                                        : "peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-blue-600"
                                    }`}
                            >
                                {input.label}
                            </label>

                            {input.name === "password" && (
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-3 text-gray-500 cursor-pointer text-sm select-none"
                                >
                                    {showPassword ? <CiUnread color="gray" /> : <CiRead color="black" />}
                                </span>
                            )}

                            {errors[input.name] && (
                                <p className="text-red-500 text-xs mt-1">{errors[input.name]}</p>
                            )}
                        </div>
                    ))}
                </div>

                <Button
                    className="w-full h-11 text-lg font-medium shadow-sm hover:shadow-md transition"
                    onClick={handleSubmit}
                >
                    Sign Up
                </Button>
            </div>


    )
}

export default SignUp
