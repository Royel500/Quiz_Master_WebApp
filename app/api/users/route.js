// app/api/users/route.js
import { ObjectId } from "mongodb";
import dbConnect from "../../lib/dbConnect";

// simple sanitizer/validator
function validateUser(body) {
  const { name, age, email, gender, phone } = body ?? {};
  if (!name || !String(name).trim()) return { ok: false, message: "Name is required" };
  const ageNum = Number(age);
  if (!age || Number.isNaN(ageNum) || ageNum < 5 || ageNum > 100) return { ok: false, message: "Valid age (5-100) is required" };
  if (email && !/^\S+@\S+\.\S+$/.test(String(email))) return { ok: false, message: "Email is invalid" };
  // phone and gender are optional; you can add validation if you want
  return { ok: true, value: { name: String(name).trim(), age: ageNum, email: email ? String(email).trim() : "", gender: gender || "", phone: phone || "" } };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const v = validateUser(body);
    if (!v.ok) {
      return new Response(JSON.stringify({ message: v.message }), { status: 400, headers: { "Content-Type": "application/json" }});
    }

    const collection = await dbConnect("users");
    const toInsert = {
      ...v.value,
      createdAt: new Date(),
      // you can store client IP or userAgent if desired
    };

    const result = await collection.insertOne(toInsert);
    const created = await collection.findOne({ _id: result.insertedId });
    const payload = { ...created, _id: created._id.toString() };

    return new Response(JSON.stringify({ ok: true, user: payload }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("POST /api/users error:", err);
    return new Response(JSON.stringify({ ok: false, message: "Server error", error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// optional: GET for testing — returns last 50 users
export async function GET() {
  try {
    const collection = await dbConnect("users");
    const docs = await collection.find({}).sort({ createdAt: -1 }).limit(50).toArray();
    const items = docs.map(d => ({ ...d, _id: d._id.toString() }));
    return new Response(JSON.stringify(items), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    console.error("GET /api/users error:", err);
    return new Response(JSON.stringify({ message: "Server error", error: err.message }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}
