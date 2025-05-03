
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const LoginForm = () => {
  const [patientId, setPatientId] = useState("");
  const [patientDob, setPatientDob] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      toast({
        title: "Patient login not implemented",
        description: "This feature is not yet available.",
      });
      setLoading(false);
    }, 1000);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      if (adminPassword === "3581") {
        // Save admin status in session storage
        sessionStorage.setItem("isAdmin", "true");
        
        toast({
          title: "Login successful",
          description: "Welcome, Doctor",
        });
        
        navigate("/doctor-dashboard");
      } else {
        toast({
          title: "Invalid credentials",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        });
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-primary">
      <Tabs defaultValue="patient" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="patient">Patient</TabsTrigger>
          <TabsTrigger value="doctor">Doctor</TabsTrigger>
        </TabsList>
        
        <CardContent className="pt-6">
          <TabsContent value="patient">
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  placeholder="Enter your 9-digit ID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patientDob">Date of Birth</Label>
                <Input
                  id="patientDob"
                  type="date"
                  value={patientDob}
                  onChange={(e) => setPatientDob(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Format: YYYY-MM-DD</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="doctor">
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminUsername">Username</Label>
                <Input
                  id="adminUsername"
                  defaultValue="admin"
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Hint: Use "3581" for demo</p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default LoginForm;
