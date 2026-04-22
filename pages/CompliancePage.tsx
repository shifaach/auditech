
import React from 'react';
import { AlertTriangle, Scale, CheckCircle, Info, FileSearch } from 'lucide-react';

const CompliancePage: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500">
      <main className="max-w-5xl mx-auto px-6 py-20">
        <header className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-900/30 text-blue-400 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border border-blue-500/20">
            Regulatory Standard
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
            Built for <span className="text-blue-600">PEMRA</span> Guidelines.
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Ensuring broadcast content remains within the boundaries of Pakistan's electronic media laws 
            through automated, persistent monitoring.
          </p>
        </header>

        <div className="space-y-8 lg:space-y-12">
          <section className="bg-slate-800/40 p-8 md:p-10 rounded-[2rem] border border-slate-700/50 flex flex-col md:flex-row gap-10 items-start hover:border-red-500/30 transition-colors">
            <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-2xl flex shrink-0 items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Automatic Content Moderation</h2>
              <p className="text-slate-400 leading-relaxed">
                AudiTech scans every second of broadcast for violations of the "Electronic Media Code of Conduct 2015". 
                Our AI is specifically trained to recognize abusive language, incitement, and inappropriate visual content 
                that could trigger regulatory warnings.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {['Abuse Detection', 'Hate Speech', 'Vulgarity Monitoring', 'Incitement Tracking'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-500" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-slate-800/40 p-8 md:p-10 rounded-[2rem] border border-slate-700/50 flex flex-col md:flex-row gap-10 items-start hover:border-blue-500/30 transition-colors">
            <div className="w-16 h-16 bg-blue-900/30 text-blue-500 rounded-2xl flex shrink-0 items-center justify-center border border-blue-500/20">
              <FileSearch className="w-8 h-8" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Unmatched Audit Trail</h2>
              <p className="text-slate-400 leading-relaxed">
                Media houses are required to maintain logs for 90 days. AudiTech provides a cryptographically 
                secure audit trail of every broadcast, including searchable transcripts and violation flags 
                ready for immediate submission to PEMRA.
              </p>
            </div>
          </section>

          <section className="bg-blue-600 p-8 md:p-10 rounded-[2rem] text-white flex flex-col md:flex-row gap-10 items-start shadow-xl shadow-blue-900/20">
            <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex shrink-0 items-center justify-center border border-white/20">
              <Scale className="w-8 h-8" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Standard Alignment</h2>
              <p className="text-blue-100 leading-relaxed">
                Our reporting structures are designed in consultation with compliance experts to match the 
                requirements of the Authority. Export reports that show your commitment to responsible 
                journalism and media standards.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-20 p-8 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex items-start gap-4">
          <Info className="w-6 h-6 text-blue-500 shrink-0" />
          <p className="text-sm text-slate-400 italic leading-relaxed">
            Disclaimer: AudiTech is an AI assistance tool designed to help human compliance officers. 
            Final regulatory review should always be performed by qualified legal personnel in alignment with national laws.
          </p>
        </div>
      </main>
    </div>
  );
};

export default CompliancePage;
