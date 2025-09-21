import "./globals.css";
import { ToastContainer } from "react-toastify";
import SessionWrapper from "@/components/SessionWraper";

export const metadata = {
  title: "Customer Churn Prediction",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionWrapper>{children}</SessionWrapper>
        <ToastContainer position="top-center" autoClose={3000} />
      </body>
    </html>
  );
}
