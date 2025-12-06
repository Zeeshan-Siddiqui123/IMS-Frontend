import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CiUnread, CiRead } from "react-icons/ci";
import { userRepo } from "../repositories/userRepo";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import authBg from "@/assets/auth-bg.png";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bq_id: z.string().min(1, "BQ ID is required"),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  CNIC: z.string().regex(/^\d{5}-\d{7}-\d{1}$/, "CNIC must be in format XXXXX-XXXXXXX-X"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  course: z.string().min(1, "Course is required"),
  gender: z.string().min(1, "Gender is required"),
  shift: z.string().min(1, "Shift is required"),
  dob: z.string().refine((val) => {
    const dobDate = new Date(val);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    return age > 12;
  }, "You must be greater than 12 years old"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUp: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [courses, setCourses] = useState<string[]>([]);
  const [genders, setGenders] = useState<string[]>([]);
  const [shifts, setShifts] = useState<string[]>([]);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError, // Added setError
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      bq_id: "",
      email: "",
      phone: "",
      CNIC: "",
      password: "",
      course: "",
      gender: "",
      shift: "",
      dob: "", // Added default value
    },
  });

  const cnicValue = watch("CNIC");
  const phoneValue = watch("phone");

  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const res = await userRepo.getEnums();
        setCourses(res.courses || []);
        setGenders(res.genders || []);
        setShifts(res.shifts || []);
      } catch (err) {
        toast.error("Failed to load options");
      }
    };
    fetchEnums();
  }, []);

  // Phone masking/cleaning helper
  useEffect(() => {
    if (phoneValue) {
      let cleaned = phoneValue.replace(/\D/g, "");
      // Remove leading 0 if present (e.g. 0300 -> 300)
      if (cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1);
      }
      cleaned = cleaned.slice(0, 10);

      if (cleaned !== phoneValue) {
        setValue("phone", cleaned);
      }
    }
  }, [phoneValue, setValue]);

  // CNIC formatting helper
  const formatCNIC = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 5) return cleaned;
    if (cleaned.length <= 12) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
  };

  useEffect(() => {
    if (cnicValue) {
      const formatted = formatCNIC(cnicValue);
      if (formatted !== cnicValue && formatted.length <= 15) { // 13 digits + 2 dashes = 15 chars
        setValue("CNIC", formatted);
      }
    }
  }, [cnicValue, setValue]);


  const onSubmit = async (data: SignUpFormValues) => {
    try {
      const dataToSend = {
        ...data,
        phone: data.phone ? `92${data.phone}` : "",
        // CNIC is already in correct format due to auto-formatting
      };

      await userRepo.addUser(dataToSend);
      toast.success("User registered successfully");
      navigate("/login");
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          // @ts-ignore
          setError(key as keyof SignUpFormValues, { type: "server", message: backendErrors[key] });
        });
        toast.error("Registration failed. Please check the errors above.");
      } else {
        toast.error(error.response?.data?.message || "Registration failed");
      }
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      {/* Left Side - Image */}
      <div className="hidden lg:block h-full relative">
        <img
          src={authBg}
          alt="Authentication Background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" /> {/* Overlay */}
        <div className="absolute bottom-10 left-10 text-white z-10 p-6">
          <h1 className="text-4xl font-bold mb-2">Join the Community</h1>
          <p className="text-lg opacity-90">Start your journey with us today.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="h-full overflow-y-auto bg-gray-50 dark:bg-neutral-950 p-4">
        <div className="flex min-h-full items-center justify-center">
          <Card className="w-full max-w-lg border-none shadow-none bg-transparent">
            <CardHeader className="space-y-1 text-center lg:text-left p-0 mb-6">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>
                Enter your details to register
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className={errors.name ? "border-red-500" : ""}
                      {...register("name")}
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bq_id">BQ ID</Label>
                    <Input
                      id="bq_id"
                      placeholder="BQ-123"
                      className={errors.bq_id ? "border-red-500" : ""}
                      {...register("bq_id")}
                    />
                    {errors.bq_id && <p className="text-red-500 text-xs">{errors.bq_id.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    className={errors.email ? "border-red-500" : ""}
                    {...register("email")}
                  />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm font-medium text-gray-500 z-10">+92</span>
                      <Input
                        id="phone"
                        className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                        placeholder="3001234567"
                        maxLength={10}
                        {...register("phone")}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="CNIC">CNIC</Label>
                    <Input
                      id="CNIC"
                      placeholder="12345-1234567-1"
                      maxLength={15}
                      className={errors.CNIC ? "border-red-500" : ""}
                      {...register("CNIC")}
                    />
                    {errors.CNIC && <p className="text-red-500 text-xs">{errors.CNIC.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showPassword ? <CiUnread size={20} /> : <CiRead size={20} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    className={errors.dob ? "border-red-500" : ""}
                    {...register("dob")}
                  />
                  {errors.dob && <p className="text-red-500 text-xs">{errors.dob.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Controller
                      name="course"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={errors.course ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.course && <p className="text-red-500 text-xs">{errors.course.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <ToggleGroup
                          type="single"
                          value={field.value}
                          onValueChange={(value) => {
                            if (value) field.onChange(value);
                          }}
                          className="justify-start gap-4"
                        >
                          {genders.map((g) => (
                            <ToggleGroupItem
                              key={g}
                              value={g}
                              className="flex-1 rounded-md border border-input data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                              {g}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      )}
                    />
                    {errors.gender && <p className="text-red-500 text-xs">{errors.gender.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Shift</Label>
                    <Controller
                      name="shift"
                      control={control}
                      render={({ field }) => (
                        <ToggleGroup
                          type="single"
                          value={field.value}
                          onValueChange={(value) => {
                            if (value) field.onChange(value);
                          }}
                          className="justify-start gap-4"
                        >
                          {shifts.map((s) => (
                            <ToggleGroupItem
                              key={s}
                              value={s}
                              className="flex-1 rounded-md border border-input data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                              {s}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      )}
                    />
                    {errors.shift && <p className="text-red-500 text-xs">{errors.shift.message}</p>}
                  </div>
                </div>

                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  Create Account
                </Button>
              </form>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="underline text-primary hover:text-primary/90">
                  Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignUp;