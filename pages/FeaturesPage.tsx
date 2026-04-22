
import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Search, FileText, Mic, CheckCircle } from 'lucide-react';

const FeaturesPage: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <header className="max-w-3xl mb-24">
          <div className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-4">The Platform</div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
            Next-Generation <br />
            Monitoring Tech.
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
            AudiTech leverages Gemini 3 Pro reasoning to provide unprecedented accuracy in broadcast logging, 
            moving beyond simple storage to intelligent content awareness.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          {/* Feature 1 */}
          <div className="space-y-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
              <Mic className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-bold text-white">Bilingual STT Mastery</h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              Our system handles the complexity of Pakistani broadcasts, where Urdu and English are often mixed. 
              Powered by advanced neural networks, we provide word-accurate transcripts that capture nuances in both languages.
            </p>
            <ul className="space-y-3">
              {['Code-switching detection', 'Urdu script support', 'Speaker identification', 'Contextual correction'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-500 font-bold">
                  <CheckCircle className="w-4 h-4 text-blue-500" /> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="space-y-6">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
              <Cpu className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-bold text-white">Smart Content Flagging</h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              Automated moderation that understands PEMRA's "Code of Conduct". Detect vulgarity, hate speech, and 
              inappropriate language in real-time with high confidence scores.
            </p>
            <ul className="space-y-3">
              {['Abusive language detection', 'Hate speech monitoring', 'Visual compliance analysis', 'Severity indexing'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-500 font-bold">
                  <CheckCircle className="w-4 h-4 text-indigo-500" /> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="space-y-6">
            <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
              <Search className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-bold text-white">Deep Archive Search</h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              Don't just log it—find it. Search thousands of hours of content using keywords, tags, or semantic meaning. 
              Find exactly what was said, by whom, and when.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="space-y-6">
            <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-500/20">
              <FileText className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-bold text-white">Automated Chapters</h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              AI automatically breaks long broadcasts into logical chapters with timestamps, making navigation 
              and review 10x faster for compliance officers.
            </p>
          </div>
        </div>

        <section className="mt-40 p-12 md:p-20 bg-blue-600 rounded-[3rem] text-center space-y-10 shadow-2xl shadow-blue-500/30">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">Ready to automate your logs?</h2>
          <p className="text-blue-100 max-w-2xl mx-auto text-xl leading-relaxed font-medium">
            Join the leading media houses in Pakistan using AudiTech to streamline their regulatory workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/login" className="bg-white text-blue-600 px-12 py-5 rounded-2xl font-black text-xl hover:bg-blue-50 transition-all active:scale-95 shadow-2xl shadow-blue-900/30">
              Sign Up for Free
            </Link>
            <button className="bg-blue-700/50 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-blue-800 transition-all border border-blue-400/30 active:scale-95">
              Book a Demo
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FeaturesPage;
