"use client";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { 
  BookOpen, 
  Calculator, 
  FlaskConical, 
  Globe, 
  PenTool, 
  Zap, 
  Timer, 
  Lock, 
  Crown 
} from "lucide-react";
import { useRouter } from "next/navigation";

const subjects = [
  { id: "english", name: "Use of English", icon: <BookOpen size={24} />, color: "bg-blue-100 text-blue-600" },
  { id: "maths", name: "Mathematics", icon: <Calculator size={24} />, color: "bg-orange-100 text-orange-600" },
  { id: "physics", name: "Physics", icon: <Zap size={24} />, color: "bg-purple-100 text-purple-600" },
  { id: "chemistry", name: "Chemistry", icon: <FlaskConical size={24} />, color: "bg-emerald-100 text-emerald-600" },
  { id: "biology", name: "Biology", icon: <Globe size={24} />, color: "bg-green-100 text-green-600" },
  { id: "literature", name: "Literature", icon: <PenTool size={24} />, color: "bg-pink-100 text-pink-600" },
];

export default function PracticeSelection() {
  const { userData } = useAuth();
  const router = useRouter();
  const isPremium = userData?.subscriptionStatus === 'premium';

  const handleMockClick = () => {
    if (isPremium) {
      
      alert("Starting Full JAMB Simulation...");
    } else {
      router.push("/dashboard/upgrade");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Practice Centre</h1>
          <p className="text-slate-500 mt-2">Select a subject or take a full mock exam.</p>
        </div>
        {!isPremium && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-2 rounded-full flex items-center gap-2">
            <Lock size={14} />
            <span>Free Mode: Access Limited to 2010-2015</span>
          </div>
        )}
      </div>

     
      <div 
        onClick={handleMockClick}
        className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 cursor-pointer group shadow-xl transition-all hover:scale-[1.01]"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-yellow-500 text-slate-900 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                Premium
              </span>
              <span className="text-slate-300 text-sm flex items-center gap-1">
                <Timer size={14} /> 2 Hours
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Simulate Full JAMB Exam</h2>
            <p className="text-slate-300 max-w-xl">
              Take all 4 subjects at once under real timed conditions. 
              The ultimate test of your speed and accuracy.
            </p>
          </div>
          
          <button className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold flex items-center gap-2 group-hover:bg-emerald-400 transition-colors">
            {isPremium ? "Start Mock Exam" : "Unlock Mock Exam"}
            {isPremium ? <Zap size={18} /> : <Lock size={18} />}
          </button>
        </div>

        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 bg-emerald-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
      </div>

      {/* Subject Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BookOpen size={20} className="text-slate-400"/> Subject Practice
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <Link 
              key={sub.id} 
              href={`/dashboard/practice/${sub.id}`} 
              className="group bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl hover:border-emerald-500 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-xl ${sub.color}`}>
                  {sub.icon}
                </div>
                {isPremium ? (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <Crown size={10} /> FULL ACCESS
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                    LIMITED
                  </span>
                )}
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {sub.name}
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  Topic-by-topic or random selection.
                </p>
                
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">40 Questions</span>
                  <span className="text-emerald-600 font-bold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    Start <Zap size={14} />
                  </span>
                </div>
              </div>

              {/* Hover Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}