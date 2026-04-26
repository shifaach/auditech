
import React, {useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import emailjs from 'emailjs-com';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    subject: 'Product Demo Request',
    message: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    emailjs.send(
      'service_0497usl',
      'template_qy7acw5',
      formData,
      'Jd-LUQi_8mQ9USlNX'
    )
    .then(() => {
      alert("Message sent successfully ✅");
      setFormData({
        name: '',
        company: '',
        email: '',
        subject: 'Product Demo Request',
        message: ''
      });
    })
    .catch((error) => {
      console.log(error);
      alert("Failed ❌");
    });
  };

  return (
    <div className="animate-in fade-in duration-700">
      <main className="max-w-7xl mx-auto px-6 py-24">
      <header className="grid lg:grid-cols-2 gap-12 items-center mb-16">

  {/* LEFT TEXT */}
  <div className="max-w-3xl">
    <div className="text-blue-500 font-bold uppercase tracking-widest text-sm mb-4">Support & Inquiries</div>

    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
      Connect with Our <br />
      <span className="text-blue-600">Experts.</span>
    </h1>

    <p className="text-xl text-slate-400 leading-relaxed">
      Need assistance with PEMRA compliance or a personalized walkthrough of the AudiTech platform? 
      Our technical support team is available 24/7 for media house emergencies.
    </p>
  </div>

  {/* RIGHT IMAGE */}
  <div className="flex justify-center">
  <img 
    src="/assets/podcast.jpg"
    alt="Contact"
    className="w-72 md:w-96 lg:ml-8 rounded-2xl shadow-2xl shadow-blue-900/20 border border-slate-700"
  />
</div>

</header>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-slate-800/40 p-8 rounded-[2rem] border border-slate-700/50 space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/20 text-blue-500 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email Us</p>
                  <p className="text-white font-bold">shifafahim021@gmail.com</p>
                  <p className="text-sm text-slate-400">Response within 2 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-600/20 text-indigo-500 rounded-xl flex items-center justify-center shrink-0 border border-indigo-500/20">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Call Us</p>
                  <p className="text-white font-bold">+92 (0) 12 345 6789</p>
                  <p className="text-sm text-slate-400">Mon-Fri, 9am - 6pm PKT</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-600/20 text-amber-500 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Headquarters</p>
                  <p className="text-white font-bold">Lahore, Punjab</p>
                  <p className="text-sm text-slate-400">Pakistan</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-green-500 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Compliance Hotline</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  For critical regulatory failures or urgent PEMRA reporting issues, please use our 24/7 dedicated line available to Enterprise clients.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/20 p-8 md:p-12 rounded-[2.5rem] border border-slate-700/30">
              <div className="flex items-center gap-3 mb-10">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-white">Send a Message</h2>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 ml-1">Full Name</label>
                    <input 
  name="name"
  value={formData.name}
  onChange={handleChange}
  type="text"
                      placeholder="e.g. Ahmed Ali"
                      className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 ml-1">Media House / Company</label>
                    <input 
  name="company"
  value={formData.company}
  onChange={handleChange}
                      type="text" 
                      placeholder="e.g. Express News"
                      className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">Work Email</label>
                  <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                    type="email" 
                    placeholder="ahmed@company.pk"
                    className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">Subject</label>
                  <select 
  name="subject"
  value={formData.subject}
  onChange={handleChange}
  className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
>
                      <option>Product Demo Request</option>
                    <option>Compliance Consultation</option>
                    <option>Technical Support</option>
                    <option>Billing & Enterprise</option>
                    <option>General Inquiry</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 ml-1">Message</label>
                  <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                    rows={5}
                    placeholder="Tell us how we can help your media operations..."
                    className="w-full px-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 resize-none"
                  ></textarea>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-3 active:scale-[0.98]">
                  Send Message <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
