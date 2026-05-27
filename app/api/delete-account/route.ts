import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json(
            { error: "Missing authorization token" },
            { status: 401 }
        );
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json(
            { error: "Server is missing Supabase admin configuration" },
            { status: 500 }
        );
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    const {
        data: { user },
        error: userError,
    } = await adminSupabase.auth.getUser(token);

    if (userError || !user) {
        return NextResponse.json(
            { error: "Invalid or expired session" },
            { status: 401 }
        );
    }

    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(
        user.id,
        true
    );

    if (deleteError) {
        return NextResponse.json(
            { error: deleteError.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}