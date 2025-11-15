// pages/admin/dashboard.js
import Link from "next/link";
import Layout from "../../components/Layout";

export default function AdminDashboard() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-6">
        <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
        <div className="space-y-2">
          <Link href="/admin/questions"><a className="block p-3 border rounded">Manage Questions</a></Link>
        </div>
      </div>
    </Layout>
  );
}
