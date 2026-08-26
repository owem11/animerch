import { NextResponse } from "next/server";

export async function GET() {
    const apiKey = process.env.UPTIMEROBOT_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "UptimeRobot API Key missing" }, { status: 500 });
    }

    try {
        const response = await fetch("https://api.uptimerobot.com/v2/getMonitors", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `api_key=${apiKey}&format=json&all_time_uptime_ratio=1`,
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("UptimeRobot API Error:", error);
        return NextResponse.json({ error: "Failed to fetch from UptimeRobot" }, { status: 500 });
    }
}
