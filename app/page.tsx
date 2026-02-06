import Link from 'next/link';
import { ArrowRight, CheckCircle, Lock, Zap, Star } from 'lucide-react'; 

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-emerald-600 tracking-tight">PARACH</span>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Login</Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-full hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wide mb-6 border border-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          JAMB 2026 Ready
        </div>
        
        {/* Main Headline with Green Gradient */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
          Master JAMB CBT <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            Without the Anxiety.
          </span>
        </h1>
        
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Access thousands of past questions, timed mock exams, and instant results. 
          Join students from Abuja and across Nigeria acing their exams.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register" className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-200 transition-all transform hover:-translate-y-1">
            Start Practice <ArrowRight size={18} />
          </Link>
          <Link href="/demo" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 hover:border-emerald-200 transition-all">
            View Demo
          </Link>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to score 300+</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1: Analytics (Large Span) */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition relative overflow-hidden group">
              <div className="relative z-10">
                <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">Real-Time Speed Analytics</h3>
                <p className="text-slate-500">We track how fast you answer questions compared to the official JAMB timer.</p>
              </div>
              {/* Decorative Green Blob */}
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full group-hover:scale-110 transition duration-500"></div>
            </div>

            {/* Feature 2: Premium (Dark Green Card) */}
            <div className="p-8 rounded-3xl bg-emerald-900 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-300 mb-4 backdrop-blur-sm">
                  <Lock size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Premium Solutions</h3>
                <p className="text-emerald-100/80">Unlock detailed step-by-step explanations for Math, Physics & Chem.</p>
              </div>
              {/* Subtle texture effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition"></div>
            </div>

            {/* Feature 3: Topics (Light Green) */}
            <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition">
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-4 shadow-sm border border-emerald-100">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">Topic Filtering</h3>
              <p className="text-slate-500">Don't just practice random questions. Filter by "Calculus" or "Oral English".</p>
            </div>
             
             {/* Feature 4: Trusted By (Changed from Purple to Gold/Amber to match Success) */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
               <div className="flex items-center gap-3 mb-2">
                 <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                    <Star size={20} fill="currentColor" />
                 </div>
                 <h3 className="text-xl font-bold text-amber-900">Trusted by So Effective Tutors</h3>
               </div>
               <p className="text-amber-800/80">Backed by Abuja's leading home tutoring agency and scholarship experts.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}