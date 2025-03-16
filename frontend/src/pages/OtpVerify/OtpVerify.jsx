import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Leaf } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'
import { getCookie } from '@/lib/getCookie'


export default function VerifyOTPPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [otp, setOtp] = useState("");

  const email = getCookie('email') || "";
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!email) {
      toast.error("Please login again!");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    // First API call - send OTP
    axios.post('http://localhost:3000/api/v1/send-otp', { email }, { withCredentials: true })
      .then((response) => {
        console.log("OTP send response:", response.data);
        
        // Check for tempAuthToken (the correct field name from your backend)
        if (response.data.tempAuthToken) {
          // Save token to localStorage for later use
          localStorage.setItem("tempAuthToken", response.data.tempAuthToken);
          toast.success("OTP sent successfully! Please check your email.");
        } else {
          toast.error("Failed to receive OTP token.");
          console.error("Missing tempAuthToken in response:", response.data);
        }
      })
      .catch((error) => {
        if (error.response) {
          console.error("🔴 Error Response:", error.response.data);
          toast.error("Failed to send OTP: " + error.response.data.message);
        } else {
          console.error("🔴 Error:", error.message);
          toast.error("Failed to send OTP.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [email, navigate]);
  
  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
  
    try {
      // Get the token we saved from the first API call
      const token = localStorage.getItem("tempAuthToken");
      
      if (!token) {
        toast.error("Authentication token missing. Please try again.");
        return;
      }
  
      // Use the correct endpoint path with hyphen, not underscore
      const response = await axios.post("http://localhost:3000/api/v1/verify-otp", 
        { email, otp }, // Include the email in the request body
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
  
      console.log("OTP verification response:", response.data);
      
      // Check for authToken in the response
      if (response.data.authToken) {
        // Store the authenticated token
        localStorage.setItem("authToken", response.data.authToken);
        // Remove temp token
        localStorage.removeItem("tempAuthToken");
        // Update Redux state with the token
        dispatch(setUser(response.data.authToken));
  
        toast.success("OTP Verified! Logged in successfully.");
        navigate("/");
      } else {
        toast.error("Invalid response from server. Missing authentication token.");
      }
    } catch (error) {
      console.error("OTP verification error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Invalid OTP! Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col justify-center items-center p-4">
      <Link to="/" className="flex items-center mb-8">
        <Leaf className="h-8 w-8 text-green-600 mr-2" />
        <span className="text-2xl font-bold text-green-800">AYUSH Portal</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify your OTP</CardTitle>
          <CardDescription>A 6-digit OTP has been sent to {email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOtpSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter your OTP</Label>
                <div className="relative">
                  <Input
                    id="otp"
                    type={showPassword ? "text" : "password"}
                    placeholder="OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide OTP" : "Show OTP"}</span>
                  </Button>
                </div>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full mt-6" 
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Verify"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-gray-600">
            {`Don't have an account? `}
            <Link to="/signup" className="text-green-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}