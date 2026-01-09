import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { NPC } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 64) || "draft";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; npc: NPC };
    const name = safeName(body.name ?? "draft");
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      path.join(DATA_DIR, `${name}.json`),
      JSON.stringify(body.npc, null, 2),
      "utf-8"
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = safeName(searchParams.get("name") ?? "draft");
  try {
    const data = await fs.readFile(
      path.join(DATA_DIR, `${name}.json`),
      "utf-8"
    );
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
}
