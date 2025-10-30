"use client"

import { toast } from "sonner"

export const useSonner = () => {
  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    switch (type) {
      case "success":
        toast.success(message)
        break
      case "error":
        toast.error(message)
        break
      case "warning":
        toast.warning(message)
        break
      default:
        toast(message)
        break
    }
  }

  return { showToast, toast }
}