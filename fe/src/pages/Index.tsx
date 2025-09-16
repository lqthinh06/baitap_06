import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import OTPVerificationForm from "@/components/auth/OTPVerificationForm";


type AuthView = "login" | "signup" | "forgot-password" | "signup-otp" | "forgot-otp";

const Index = () => {
  const [currentView, setCurrentView] = useState<AuthView>("login");
  const [userEmail, setUserEmail] = useState("");

  const renderAuthForm = () => {
    switch (currentView) {
      case "login":
        return (
          <LoginForm 
            onSwitchToSignUp={() => setCurrentView("signup")}
            onSwitchToForgotPassword={() => setCurrentView("forgot-password")}
            onLoginSuccess={() => {
              // Handle successful login
              console.log("Login successful");
            }}
          />
        );
      case "signup":
        return (
          <SignUpForm 
            onSwitchToLogin={() => setCurrentView("login")}
            onSwitchToForgotPassword={() => setCurrentView("forgot-password")}
            onSignUpSuccess={(email) => {
              setUserEmail(email);
              setCurrentView("signup-otp");
            }}
          />
        );
      case "forgot-password":
        return (
          <ForgotPasswordForm 
            onSwitchToLogin={() => setCurrentView("login")}
            onSwitchToSignUp={() => setCurrentView("signup")}
            onEmailSent={(email) => {
              setUserEmail(email);
              setCurrentView("forgot-otp");
            }}
          />
        );
      case "signup-otp":
  return (
    <OTPVerificationForm
      title="Xác thực tài khoản"
      subtitle="Nhập mã OTP đã gửi đến email:"
      email={userEmail}
      mode="register"
      onVerifySuccess={() => {
        // verified → đưa về login hoặc dashboard tuỳ bạn
        setCurrentView("login");
        setUserEmail("");
      }}
      onGoBack={() => setCurrentView("signup")}
    />
  );

case "forgot-otp":
  return (
    <OTPVerificationForm
      title="Xác thực đặt lại mật khẩu"
      subtitle="Nhập mã OTP đã gửi đến email:"
      email={userEmail}
      mode="reset"
      onVerifySuccess={() => {
        // reset ok → về login
        setCurrentView("login");
        setUserEmail("");
      }}
      onGoBack={() => setCurrentView("forgot-password")}
    />
  );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case "login":
        return "Đăng nhập";
      case "signup":
        return "Tạo tài khoản";
      case "forgot-password":
        return "Quên mật khẩu";
      case "signup-otp":
        return "Xác thực tài khoản";
      case "forgot-otp":
        return "Xác thực OTP";
      default:
        return "";
    }
  };

  const getSubtitle = () => {
    switch (currentView) {
      case "login":
        return "Chào mừng bạn quay trở lại";
      case "signup":
        return "Điền thông tin để tạo tài khoản mới";
      case "forgot-password":
        return "Đặt lại mật khẩu của bạn";
      case "signup-otp":
        return "Xác nhận email của bạn để hoàn tất đăng ký";
      case "forgot-otp":
        return "Xác nhận danh tính để đặt lại mật khẩu";
      default:
        return "";
    }
  };

  return (
    <AuthLayout title={getTitle()} subtitle={getSubtitle()}>
      {renderAuthForm()}
    </AuthLayout>
  );
};

export default Index;