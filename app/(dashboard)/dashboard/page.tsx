"use client";
import { useAuth } from "@/app/context/AuthContext"; 
import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase"; 
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { Trophy, Clock, TrendingUp, ArrowRight, Activity, Calendar, Zap, Loader2, Coins, Wallet, CreditCard } from "lucide-react";
import Link from "next/link";
import { formatFirebaseDate } from "@/app/lib/dateUtils";

export default function DashboardOverview() {
  const { userData, user, loading: authLoading } = useAuth();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalTests: 0, averageScore: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  // Map category IDs to friendly names
  const categoryNames = {
    senior: "Senior Secondary (JAMB/WAEC)",
    junior: "Junior Secondary (BECE/Common Entrance)",
    professional: "Job Interview & Career",
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "testResults"),
          where("userId", "==", user.uid),
          orderBy("date", "desc"),
          limit(5)
        );
        
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => {
           const data = doc.data();
           const date = data.date ? formatFirebaseDate(data.date) : 'Recent';
           
           let displayName = data.subject || 'Unknown';
           
           if (data.type === 'mock') {
             const examTypeMap: Record<string, string> = {
               'jamb': 'JAMB Mock',
               'waec': 'WAEC Mock',
               'neco': 'NECO Mock',
               'bece': 'BECE/Junior WAEC',
               'common-entrance': 'Common Entrance',
               'interview': 'Job Interview Prep',
               'general': 'General Knowledge'
             };
             
             if (data.examType) {
               displayName = examTypeMap[data.examType] || data.examType.toUpperCase();
             } else if (data.subjectsIncluded && Array.isArray(data.subjectsIncluded)) {
               displayName = `Mock Exam (${data.subjectsIncluded.length} subjects)`;
             }
           }
           
           return {
             id: doc.id, 
             date, 
             percentage: data.percentage || 0, 
             subject: displayName, 
             score: data.score || 0, 
             totalQuestions: data.totalQuestions || 0,
           };
        });
        
        setRecentActivity(results);

        if (results.length > 0) {
           const totalScore = results.reduce((acc, curr) => acc + curr.percentage, 0);
           setStats({
             totalTests: results.length,
             averageScore: Math.round(totalScore / results.length)
           });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading) fetchData();
  }, [user, authLoading]);

  if (authLoading || dataLoading) {
    return <div className="p-8 flex items-center justify-center h-screen"><Loader2 className="animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* 1. Welcome & Primary CTA */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Hello, <span className="text-emerald-600">{userData?.displayName || "Scholar"}</span>! 🚀
          </h1>
          <p className="text-slate-500 max-w-md mb-6">
            You are preparing for <span className="font-bold text-slate-700">{categoryNames[userData?.examCategory as keyof typeof categoryNames] || "your exams"}</span>. 
            You currently have <span className="text-emerald-600 font-bold">{userData?.credits || 0} credits</span> available.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard/practice" className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition flex items-center gap-2">
              Enter Practice Centre <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard/buy-credits" className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-xl border-2 border-emerald-100 hover:bg-emerald-50 transition flex items-center gap-2">
              <Coins size={18} /> Buy Credits
            </Link>
          </div>
        </div>
        <div className="hidden md:block absolute right-0 bottom-0 opacity-10">
           <Trophy size={200} className="text-emerald-600 transform translate-x-10 translate-y-10" />
        </div>
      </div>

      {/* 2. Key Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Wallet size={24} />} 
          label="Credit Balance" 
          value={userData?.credits || 0} 
          subtext="Available for exams"
          color={ (userData?.credits || 0) < 15 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}
        />
        <StatCard 
          icon={<Trophy size={24} />} 
          label="Average Score" 
          value={`${stats.averageScore}%`} 
          subtext="Based on recent activity"
          color="bg-amber-100 text-amber-600"
        />
        <StatCard 
          icon={<TrendingUp size={24} />} 
          label="Tests Taken" 
          value={stats.totalTests}
          subtext="Recent sessions"
          color="bg-blue-100 text-blue-600"
        />
      </div>

      {/* 3. Recent Activity List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Activity size={20} className="text-slate-400" /> Recent Activity
            </h3>
            <Link href="/dashboard/practice" className="text-sm text-emerald-600 font-semibold hover:underline">
              Take a new test
            </Link>
          </div>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((item, idx) => (
                <Link href={`/dashboard/result/${item.id}`} key={idx} className="block hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${item.percentage >= 50 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <Calendar size={18} />
                      </div>
                      <div>
                        <span className="block font-bold text-slate-700">{item.subject}</span>
                        <span className="text-xs text-slate-500">{item.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500 hidden sm:block">{item.score}/{item.totalQuestions}</span>
                      <span className={`font-bold px-3 py-1 rounded-lg ${item.percentage >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
              <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No tests taken yet.</p>
              <Link href="/dashboard/practice" className="text-emerald-600 font-bold text-sm hover:underline">Start your first test</Link>
            </div>
          )}
        </div>

        {/* Tip of the Day & Category Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
              <div className="bg-white/10 w-fit p-2 rounded-lg mb-4">
                <Zap size={20} className="text-yellow-400" fill="currentColor" />
              </div>
              <h3 className="font-bold text-lg mb-2">Tip of the Day</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                "Consistency beats intensity. It is better to practice for 30 minutes every day than for 5 hours once a week."
              </p>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-600" /> Quick Top-up
            </h4>
            <p className="text-xs text-slate-500 mb-4">Low on credits? Get a bundle to continue your practice sessions.</p>
            <Link href="/dashboard/buy-credits" className="block text-center py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-sm hover:bg-emerald-100 transition">
              View Credit Packages
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component
function StatCard({ icon, label, value, subtext, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition">
      <div className={`p-3 rounded-xl ${color} flex-shrink-0`}>{icon}</div>
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        <p className="text-xs text-slate-400 mt-1">{subtext}</p>
      </div>
    </div>
  );
}