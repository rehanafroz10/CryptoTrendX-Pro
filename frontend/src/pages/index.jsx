import Link from 'next/link';
import { 
  Sparkles, ShieldCheck, Brain, Cpu, 
  ArrowRight, BarChart2
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Note: Navbar _app.jsx se global handling ke through include ho chuka hai. 
          Dual Navbar se bachne ke liye yahan se extra <Navbar /> tag hata diya gaya hai. */}

      {/* MAIN HOME DASHBOARD CONTENT */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 space-y-16">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Next-Gen AI Crypto Intelligence
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Cryptocurrency & <span className="text-indigo-500">AI Trends</span> In One Platform
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed">
            Real-time market analytics, machine learning predictions, and sentiment tracking tools to simplify digital asset decisions.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/market-data/coins"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 text-sm"
            >
              Explore Live Market <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl transition-all text-sm"
            >
              Create Free Account
            </Link>
          </div>
        </section>

        {/* EXPLANATION SECTION */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 md:p-12 space-y-8 shadow-2xl backdrop-blur-sm">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-indigo-400" /> Cryptocurrency Kya Hota Hai?
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Cryptocurrency ek <strong>Digital ya Virtual Currency</strong> hai jo cryptographic security dwara protected hoti hai. Yeh traditional currency ki tarah physical form mein nahi hoti, balki poori tarah se internet par computerized records ke roop mein exist karti hai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 bg-indigo-950 text-indigo-400 rounded-xl flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="font-bold text-white text-lg">Decentralization</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Yeh kisi Central Bank ya Sarkar ke control mein nahi hoti. Iska network <strong>Blockchain Technology</strong> par distributed computer network ke zariye chalta hai.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 bg-indigo-950 text-indigo-400 rounded-xl flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="font-bold text-white text-lg">Cryptography Security</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Transactions ko safe rakhne ke liye advanced mathematical algorithms ka upayog kiya jata hai, jisse ise double-spend karna impossible hota hai.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 bg-indigo-950 text-indigo-400 rounded-xl flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="font-bold text-white text-lg">AI & Machine Learning</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Crypto market highly volatile hota hai. CryptoTrendX AI Machine Learning models dwara trend prediction easy banata hai.
              </p>
            </div>
          </div>
        </section>

        {/* KEY FEATURES SECTION */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Platform Key Features</h2>
            <p className="text-slate-400 text-xs">Aapko CryptoTrendX mein kya-kya features milenge</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="p-3 bg-indigo-950 text-indigo-400 rounded-xl w-fit">
                <Brain className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-base">ML Trend Prediction</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Historical data aur technical indicators ke aadhar par next movement ka accurate AI direction score.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="p-3 bg-indigo-950 text-indigo-400 rounded-xl w-fit">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-base">What-IF Calculator</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Buying price aur expected target price dal kar instantaneous return on investment (ROI) calculate karein.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="p-3 bg-indigo-950 text-indigo-400 rounded-xl w-fit">
                <BarChart2 className="w-6 h-6 text-cyan-400" />
              </div>
              <h4 className="font-bold text-white text-base">Correlation Matrix</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Top crypto assets ke aapas me price dependency & relationship ko visually calculate karein.
              </p>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-6 text-center text-xs text-slate-500">
        © 2026 CryptoTrendX Pro. Real-time Crypto Analytics & Machine Learning Predictions.
      </footer>

    </div>
  );
}