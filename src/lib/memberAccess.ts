import { checkAccess } from "@/lib/referrals";
import {
  clearAccess,
  setApprovedAccess,
  setPendingAccess,
  setRejectedAccess,
} from "@/store/access";

export type RefreshedAccessStatus =
  | "approved"
  | "pending"
  | "rejected"
  | "guest"
  | "error";

export async function refreshMemberAccess(
  instagramHandle: string,
  phone: string,
): Promise<RefreshedAccessStatus> {
  try {
    const result = await checkAccess(instagramHandle, phone);

    if (result.status === "approved") {
      setApprovedAccess(
        result.instagramHandle || instagramHandle,
        phone,
        result.referralCode,
      );
      return "approved";
    }

    if (result.status === "pending") {
      setPendingAccess(result.instagramHandle || instagramHandle, phone);
      return "pending";
    }

    if (result.status === "rejected") {
      setRejectedAccess(result.instagramHandle || instagramHandle, phone);
      return "rejected";
    }

    clearAccess();
    return "guest";
  } catch {
    return "error";
  }
}
