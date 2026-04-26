
import React from 'react';
import { Target, Heart, ShieldCheck, Cpu } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <main className="max-w-4xl mx-auto px-6 py-24 space-y-24">
        <section className="text-center space-y-6">
          <div className="text-blue-500 font-bold uppercase tracking-widest text-sm">Our Story</div>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">Empowering Media Accountability.</h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            AudiTech was founded in 2024 to solve a critical bottleneck in Pakistan's media landscape: 
            the manual, error-prone process of broadcast monitoring and compliance.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-white">The Mission</h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              We aim to provide media houses with the most sophisticated AI tools to maintain 
              high standards of broadcasting. By automating the "boring" work of logging, we free up 
              teams to focus on quality content production while ensuring legal peace of mind.
            </p>
          </div>
          <div className="bg-slate-800 rounded-[3rem] overflow-hidden border border-slate-700 shadow-2xl">            <img 
    src="/assets/mission.jpg"
    alt="Mission"
    className="w-full h-full object-contain"
  />

  {/* optional overlay for style */}
 
</div>
        </div>

        <section className="bg-slate-800/40 p-8 md:p-12 rounded-[2.5rem] space-y-8 border border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Cpu className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-white">Powered by Gemini 3 Pro</h2>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            Our platform uses the latest in multimodal AI to analyze video frames and audio simultaneously. 
            This allows AudiTech to understand context, detecting when a certain phrase is used in a 
            news context versus a violation context.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900/80 rounded-2xl shadow-sm border border-slate-700">
               <p className="text-2xl font-black text-blue-500">99%</p>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">STT Accuracy</p>
            </div>
            <div className="p-6 bg-slate-900/80 rounded-2xl shadow-sm border border-slate-700">
               <p className="text-2xl font-black text-blue-500">Real-time</p>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Analysis Speed</p>
            </div>
            <div className="p-6 bg-slate-900/80 rounded-2xl shadow-sm border border-slate-700">
               <p className="text-2xl font-black text-blue-500">24/7</p>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Uptime</p>
            </div>
          </div>
        </section>

        <section className="text-center space-y-16">
           <h2 className="text-4xl font-black text-white">Core Values</h2>
           <div className="grid sm:grid-cols-3 gap-12">
              <div className="space-y-4">
                 <div className="w-14 h-14 bg-pink-900/30 text-pink-500 rounded-2xl flex items-center justify-center mx-auto border border-pink-500/20">
                    <Heart className="w-7 h-7" />
                 </div>
                 <h3 className="text-xl font-bold text-white">Trust</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">Building bridges between media houses and national regulators.</p>
              </div>
              <div className="space-y-4">
                 <div className="w-14 h-14 bg-blue-900/30 text-blue-500 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20">
                    <ShieldCheck className="w-7 h-7" />
                 </div>
                 <h3 className="text-xl font-bold text-white">Safety</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">Filtering out hate speech and harmful content at the source.</p>
              </div>
              <div className="space-y-4">
                 <div className="w-14 h-14 bg-slate-700/30 text-slate-300 rounded-2xl flex items-center justify-center mx-auto border border-slate-500/20">
                    <Target className="w-7 h-7" />
                 </div>
                 <h3 className="text-xl font-bold text-white">Precision</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">Unmatched detail in reporting, auditing, and content logging.</p>
              </div>
           </div>
        </section>

        <footer className="text-center pt-16 border-t border-slate-800">
          <p className="text-slate-400 font-medium">Interested in joining our mission?</p>
          <a href="mailto:careers@auditech.pk" className="text-blue-500 font-bold hover:text-blue-400 mt-2 inline-block transition-colors text-lg">careers@auditech.pk</a>
        </footer>
      </main>
    </div>
  );
};

export default AboutPage;
