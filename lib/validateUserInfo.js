import { toast } from "react-toastify";

export default function validateUserInfo(userName, email) {
  if (!userName || userName.trim().length === 0) {
    toast.error("Username input field must not be blank");
    return false;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    toast.error("Invalid email address");
    return false;
  }

  return true;
}
