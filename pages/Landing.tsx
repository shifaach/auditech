
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, BarChart3, Globe, Lock, Cpu, ChevronRight } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/30 text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-500/20 mb-8">
          <Zap className="w-4 h-4" />
          AI-Powered Compliance Monitoring for Pakistan Media
        </div>
        <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-8 leading-[1.1]">
          Modern Media Logging <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            for PEMRA Compliance
          </span>
        </h1>
        <p className="max-w-3xl mx-auto text-xl text-slate-400 mb-12 leading-relaxed">
          Replace manual logging with real-time AI transcription, automated compliance flagging, 
          and searchable archives. Specifically designed for Urdu and English broadcast content.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link to="/login" className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
            Get Started <ShieldCheck className="w-5 h-5" />
          </Link>
          <Link to="/features" className="w-full sm:w-auto bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-700 transition-all border border-slate-700 flex items-center justify-center gap-2">
            Explore Features <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features Grid Preview */}
      <section className="bg-slate-950/50 py-24 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Core Capabilities</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Everything you need to maintain regulatory compliance in one platform.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Globe />, title: 'Bilingual Transcription', desc: 'State-of-the-art Urdu and English STT for accurate broadcast logging.' },
              { icon: <Cpu />, title: 'Automated Flagging', desc: 'AI-driven detection of vulgarity, abuse, and inappropriate language.' },
              { icon: <Zap />, title: 'Instant Summaries', desc: 'Generate concise content digests for quick compliance reviews.' },
              { icon: <BarChart3 />, title: 'Auditable Reports', desc: 'Export full logs and compliance reports for PEMRA submissions.' },
              { icon: <Lock />, title: 'Secure Storage', desc: 'Encrypted cloud storage for all your audio and video broadcast archives.' },
              { icon: <ShieldCheck />, title: 'Role-Based Access', desc: 'Granular permissions for Admins, Compliance Officers, and Users.' },
            ].map((f, i) => (
              <div key={i} className="p-8 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all group hover:bg-slate-900">
                <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/features" className="text-blue-400 font-bold hover:text-blue-300 flex items-center justify-center gap-2 transition-colors">
              See all features in detail <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
