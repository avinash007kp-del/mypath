import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { ZodError } from "zod";

export function successResponse<T>(data: T, status = 200, message?: string) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(message: string, status = 400, errors?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details: errors,
    },
    { status }
  );
}

export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return errorResponse("Validation failed", 422, formattedErrors);
  }

  if (error instanceof Error) {
    // Check if it's MongoDB connection error
    if (
      error.message.includes("MONGODB_URI") ||
      error.message.includes("MongoServerSelectionError") ||
      error.message.includes("ECONNREFUSED")
    ) {
      return errorResponse(
        "Database connection error. Please ensure MongoDB is running and MONGODB_URI is properly configured.",
        503
      );
    }
    return errorResponse(error.message, 500);
  }

  return errorResponse("An unexpected server error occurred", 500);
}
