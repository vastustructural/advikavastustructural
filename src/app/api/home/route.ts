import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-utils";
import { getHomePageData } from "@/lib/data";

export async function GET() {
    try {
        const homeData = await getHomePageData();
        return NextResponse.json(homeData);
    } catch (error) {
        console.error("GET /api/home error:", error);
        return apiError("Failed to fetch home page data");
    }
}
