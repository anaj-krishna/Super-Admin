import axios from "axios";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export type ApiErrorInfo = {
  statusCode?: number;
  message: string;
  raw?: unknown;
};

export function getApiErrorMessage(error: unknown): ApiErrorInfo {
  if (axios.isAxiosError(error)) {
    const statusCode: number | undefined = error.response?.status;
    const data: unknown = error.response?.data;

    const messageValue: unknown = isRecord(data) ? data.message : undefined;

    const message =
      (typeof messageValue === "string" && messageValue) ||
      (Array.isArray(messageValue) && messageValue.filter((m) => typeof m === "string").join(", ")) ||
      error.message ||
      "Request failed";

    return { statusCode, message, raw: error };
  }

  return { message: "Request failed", raw: error };
}

export function isMembershipDeniedMessage(message: string): boolean {
  return (
    message === "Storekeeper not linked to this super admin" ||
    message === "Delivery boy not linked to this super admin"
  );
}

export function isTransitionDeniedMessage(message: string): boolean {
  return message.startsWith("Cannot transition from ");
}
