
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { setCurrentUser } from '@/state/auth';
import axiosInstance from '@/api/axios';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const next = new URLSearchParams(useLocation().search).get('next');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axiosInstance.post('/auth/admin/login', { username: email, password, provider: 'db' });
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Login failed');
      }
      const admin = response.data.user;
      const userRole = response.data.user_role
      const adminType = response.data.admin_type;

      dispatch(
        setCurrentUser({
          user: admin,
          role: userRole,
          adminType: adminType
        }));
      navigate(next || '/');

      toast({
        title: "Login successful",
        description: `Welcome back, ${admin.name}!`,
      });
    } catch (error) {
      toast({
        title: error.response?.data.message || "Login failed",
        description: error.response?.data.description || error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
            <img src="/favicon.ico" className='h-full w-full rounded-lg p-2' alt="" />
          </div>
          <CardTitle className="text-2xl font-bold">StudentX Admin Portal</CardTitle>
          <CardDescription>Sign in to manage app data and track insights</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="text"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          {/* <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">Demo Credentials:</p>
            <p className="text-xs text-blue-600">Email: any admin email from the demo data</p>
            <p className="text-xs text-blue-600">Password: password123</p>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
};
