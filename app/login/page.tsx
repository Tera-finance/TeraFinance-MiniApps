"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Phone, Loader2, Sparkles, Shield, Zap } from "lucide-react";

export default function LoginPage() {
  const [countryCode, setCountryCode] = useState("+62");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(whatsappNumber, countryCode);

      if (success) {
        toast({
          title: "Success!",
          description: "You have been logged in successfully.",
        });
        router.push("/");
      } else {
        toast({
          title: "Login Failed",
          description: "Please check your phone number and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full glass flex items-center justify-center glow-effect">
            <Sparkles className="w-10 h-10 text-light-blue" />
          </div>
          <h1 className="text-4xl font-bold gradient-text-purple mb-2">Tera Finance</h1>
          <p className="text-silver">Fast, affordable cross-border payments</p>
        </div>

        {/* Login Card */}
        <div className="glass-dark p-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-glow mb-2">Welcome Back</h2>
            <p className="text-silver text-sm">Login with your WhatsApp number</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label className="text-ice-blue mb-2 block">Country Code</Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="glass border-light-blue/30 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+62">Indonesia (+62)</SelectItem>
                  <SelectItem value="+1">USA (+1)</SelectItem>
                  <SelectItem value="+44">UK (+44)</SelectItem>
                  <SelectItem value="+81">Japan (+81)</SelectItem>
                  <SelectItem value="+86">China (+86)</SelectItem>
                  <SelectItem value="+52">Mexico (+52)</SelectItem>
                  <SelectItem value="+63">Philippines (+63)</SelectItem>
                  <SelectItem value="+33">France (+33)</SelectItem>
                  <SelectItem value="+49">Germany (+49)</SelectItem>
                  <SelectItem value="+91">India (+91)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-ice-blue mb-2 block">WhatsApp Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-silver" />
                <Input
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="8123456789"
                  className="glass pl-11 h-12 text-ice-blue border-light-blue/30"
                  required
                />
              </div>
              <p className="text-xs text-silver mt-2">
                Enter your number without the country code
              </p>
            </div>

            <Button
              type="submit"
              className="w-full btn-space h-12 text-lg glow-effect"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </div>

        {/* Features */}
        <div className="mt-8 space-y-4">
          <div className="glass p-4 flex items-center gap-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="w-10 h-10 rounded-full bg-light-blue/20 flex items-center justify-center glow-blue">
              <Zap className="w-5 h-5 text-ice-blue" />
            </div>
            <div>
              <p className="text-ice-blue font-semibold text-sm">Fast Transfers</p>
              <p className="text-silver text-xs">Complete in 5-10 minutes</p>
            </div>
          </div>

          <div className="glass p-4 flex items-center gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="w-10 h-10 rounded-full bg-light-blue/20 flex items-center justify-center glow-cyan">
              <Shield className="w-5 h-5 text-ice-blue" />
            </div>
            <div>
              <p className="text-ice-blue font-semibold text-sm">Secure & Transparent</p>
              <p className="text-silver text-xs">Powered by Base blockchain</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-silver text-xs mt-8">
          By logging in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
