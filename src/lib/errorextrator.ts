import { ApiErrorResponse } from "../models/store";

function extractApiError(err: unknown): ApiErrorResponse {
  let message = "Something went wrong !!!";
  const code = 500;

  if (err instanceof Error) {
    if (err.message.includes("401")) {
      return { message: "Unauthorized", code: 401 };
    }
    if (err.message.includes("403")) {
      return { message: "Forbidden", code: 403 };
    }
    if (err.message.includes("404")) {
      return { message: "Not found", code: 404 };
    }
    message = err.message;
  }

  return { message, code };
}

export default extractApiError;