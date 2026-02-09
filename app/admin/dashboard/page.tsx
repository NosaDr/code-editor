"use client";
import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { Users, FileText, BookOpen, Activity } from "lucide-react";

export default function AdminOverview() {
  const [stats, setStats] = useState({ users: 0, questions: 0, subjects: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Note: getCountFromServer is efficient for counting
        const userColl = collection(db, "users");
        const qColl = collection(db, "questions");
        const subColl = collection(db, "subjects");

        const userSnapshot = await getCountFromServer(userColl);
        const qSnapshot = await getCountFromServer(qColl);
        const subSnapshot = await getCountFromServer(subColl);

        setStats({
          users: userSnapshot.data().count,
          questions: qSnapshot.data().count,
          subjects: subSnapshot.data().count
        });
      } catch (e) {
        console.error("Error fetching stats", e);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8 py-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Welcome back, Admin.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard title="Total Students" value={stats.users} icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />} color="bg-blue-500" />
        <StatCard title="Total Questions" value={stats.questions} icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6" />} color="bg-emerald-500" />
        <StatCard title="Active Subjects" value={stats.subjects} icon={<BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />} color="bg-purple-500" />
      </div>

      <div className="bg-white p-6 sm:p-8 lg:p-12 rounded-2xl border border-slate-200 shadow-sm text-center py-16 sm:py-20">
        <Activity className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-300 mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-slate-900">Real-time Activity Log</h3>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Detailed user analytics coming in Phase 2.</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1 truncate">{title}</p>
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tabular-nums">{value}</h3>
      </div>
      <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 text-white ${color} shadow-lg shadow-gray-200`}>
        {icon}
      </div>
    </div>
  );
}