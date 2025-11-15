// app/api/questions/route.js
import { ObjectId } from "mongodb";
import dbConnect from "../../lib/dbConnect";

async function toJSON(doc) {
  if (!doc) return null;
  return { ...doc, _id: doc._id.toString() };
}

export async function GET(request) {
  try {
    const collection = await dbConnect("questions");
    const docs = await collection.find({}).toArray();
    const items = docs.map(d => ({ ...d, _id: d._id.toString() }));
    return new Response(JSON.stringify(items), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET /api/questions error:", err);
    return new Response(JSON.stringify({ message: "Server error", error: err.message }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, options } = body ?? {};
    if (!text || !Array.isArray(options) || options.length !== 4) {
      return new Response(JSON.stringify({ message: "Invalid payload. 'text' and exactly 4 'options' are required." }), { status: 400, headers: { "Content-Type": "application/json" }});
    }
    const hasCorrect = options.some(o => !!o.isCorrect);
    if (!hasCorrect) {
      return new Response(JSON.stringify({ message: "At least one option must have isCorrect: true" }), { status: 400, headers: { "Content-Type": "application/json" }});
    }

    const collection = await dbConnect("questions");
    const result = await collection.insertOne({ text, options, createdAt: new Date() });
    const created = await collection.findOne({ _id: result.insertedId });
    const payload = await toJSON(created);
    return new Response(JSON.stringify(payload), { status: 201, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    console.error("POST /api/questions error:", err);
    return new Response(JSON.stringify({ message: "Server error", error: err.message }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, text, options } = body ?? {};
    if (!id) return new Response(JSON.stringify({ message: "Field 'id' is required" }), { status: 400, headers: { "Content-Type": "application/json" }});
    if (!text || !Array.isArray(options) || options.length !== 4) {
      return new Response(JSON.stringify({ message: "Invalid payload. 'text' and exactly 4 'options' are required." }), { status: 400, headers: { "Content-Type": "application/json" }});
    }

    const _id = new ObjectId(id);
    const collection = await dbConnect("questions");
    const result = await collection.findOneAndUpdate(
      { _id },
      { $set: { text, options } },
      { returnDocument: "after" }
    );

    if (!result.value) return new Response(JSON.stringify({ message: "Question not found" }), { status: 404, headers: { "Content-Type": "application/json" }});
    const updated = await toJSON(result.value);
    return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    console.error("PUT /api/questions error:", err);
    return new Response(JSON.stringify({ message: "Server error", error: err.message }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}

export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return new Response(JSON.stringify({ message: "Query param 'id' is required" }), { status: 400, headers: { "Content-Type": "application/json" }});

    const _id = new ObjectId(id);
    const collection = await dbConnect("questions");
    const result = await collection.deleteOne({ _id });
    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ message: "Question not found" }), { status: 404, headers: { "Content-Type": "application/json" }});
    }
    return new Response(JSON.stringify({ message: "deleted" }), { status: 200, headers: { "Content-Type": "application/json" }});
  } catch (err) {
    console.error("DELETE /api/questions error:", err);
    return new Response(JSON.stringify({ message: "Server error", error: err.message }), { status: 500, headers: { "Content-Type": "application/json" }});
  }
}
