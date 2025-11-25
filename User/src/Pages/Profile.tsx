import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:5000";

export default function Profile() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/profile");
        setUser(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleUpdate = async () => {
    try {
      const res = await axios.put("/profile/update", user);
    //   toast({
    //     title: "Updated Successfully!",
    //     description: "Your profile information has been saved.",
    //   });
    } catch (err) {
    //   toast({
    //     title: "Error",
    //     description: "Something went wrong.",
    //     variant: "destructive",
    //   });
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Update Profile
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              placeholder="Enter email"
            />
          </div>

          <Button className="w-full" onClick={handleUpdate}>
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
