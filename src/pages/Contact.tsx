 import { useState } from "react";
 import { Link } from "react-router-dom";
 import Header from "@/components/Header";
 import Footer from "@/components/Footer";
 import Cart from "@/components/Cart";
 import { Mail, Phone, MessageCircle, Send, Loader2 } from "lucide-react";
 import { toast } from "sonner";
 
 const Contact = () => {
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [message, setMessage] = useState("");
   const [loading, setLoading] = useState(false);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!name.trim() || !email.trim() || !message.trim()) {
       toast.error("Please fill in all fields");
       return;
     }
 
     setLoading(true);
     
     // For now, open mailto link as a fallback
     const mailtoLink = `mailto:support@relookstores.com?subject=Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}%0A%0AFrom: ${encodeURIComponent(email)}`;
     window.open(mailtoLink, '_blank');
     
     toast.success("Opening your email client...");
     setLoading(false);
     
     // Clear form
     setName("");
     setEmail("");
     setMessage("");
   };
 
   const openWhatsApp = (phone: string) => {
     const cleanPhone = phone.replace(/\s/g, '').replace('+', '');
     window.open(`https://wa.me/${cleanPhone}`, '_blank');
   };
 
   return (
     <div className="min-h-screen bg-background">
       <Header />
       <Cart />
       
       <main className="pt-28 md:pt-32 pb-16 md:pb-24">
         <div className="container-wide">
           {/* Breadcrumb */}
           <nav className="mb-8">
             <ol className="flex items-center gap-2 text-sm text-muted-foreground">
               <li><Link to="/" className="hover:text-foreground">Home</Link></li>
               <li>/</li>
               <li className="text-foreground">Contact Us</li>
             </ol>
           </nav>
 
           <div className="max-w-4xl mx-auto">
             <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Get in Touch</h1>
             <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
               Have questions about your order or need help finding the perfect sneakers? 
               We're here to help! Reach out through any of the channels below.
             </p>
 
             <div className="grid md:grid-cols-2 gap-12">
               {/* Contact Info */}
               <div className="space-y-8">
                 <div>
                   <h2 className="text-xl font-bold mb-6">Contact Information</h2>
                   
                   {/* WhatsApp */}
                   <div className="space-y-4">
                     <h3 className="font-medium flex items-center gap-2">
                       <MessageCircle className="w-5 h-5 text-accent" />
                       WhatsApp (Fastest Response)
                     </h3>
                     <div className="space-y-3 pl-7">
                       <button
                         onClick={() => openWhatsApp('+2348135249526')}
                         className="flex items-center gap-3 text-foreground hover:text-accent transition-colors group"
                       >
                         <span className="font-medium">+234 813 524 9526</span>
                         <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full group-hover:bg-accent group-hover:text-primary-foreground transition-colors">
                           Click to chat
                         </span>
                       </button>
                       <button
                         onClick={() => openWhatsApp('+2348147134884')}
                         className="flex items-center gap-3 text-foreground hover:text-accent transition-colors group"
                       >
                         <span className="font-medium">+234 814 713 4884</span>
                         <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full group-hover:bg-accent group-hover:text-primary-foreground transition-colors">
                           Click to chat
                         </span>
                       </button>
                     </div>
                   </div>
                 </div>
 
                 {/* Phone */}
                 <div className="space-y-4">
                   <h3 className="font-medium flex items-center gap-2">
                     <Phone className="w-5 h-5 text-accent" />
                     Phone
                   </h3>
                   <div className="space-y-2 pl-7">
                     <a href="tel:+2348135249526" className="block text-foreground hover:text-accent transition-colors">
                       +234 813 524 9526
                     </a>
                     <a href="tel:+2348147134884" className="block text-foreground hover:text-accent transition-colors">
                       +234 814 713 4884
                     </a>
                   </div>
                 </div>
 
                 {/* Email */}
                 <div className="space-y-4">
                   <h3 className="font-medium flex items-center gap-2">
                     <Mail className="w-5 h-5 text-accent" />
                     Email
                   </h3>
                   <div className="pl-7">
                     <a href="mailto:support@relookstores.com" className="text-foreground hover:text-accent transition-colors">
                       support@relookstores.com
                     </a>
                   </div>
                 </div>
 
                 {/* Hours */}
                 <div className="bg-secondary rounded-xl p-6">
                   <h3 className="font-medium mb-3">Business Hours</h3>
                   <div className="space-y-2 text-sm text-muted-foreground">
                     <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                     <p>Saturday: 10:00 AM - 4:00 PM</p>
                     <p>Sunday: Closed</p>
                   </div>
                 </div>
               </div>
 
               {/* Contact Form */}
               <div className="bg-secondary rounded-2xl p-6 md:p-8">
                 <h2 className="text-xl font-bold mb-6">Send us a Message</h2>
                 <form onSubmit={handleSubmit} className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium mb-2">Name</label>
                     <input
                       type="text"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                       placeholder="Your name"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-2">Email</label>
                     <input
                       type="email"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                       placeholder="you@example.com"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium mb-2">Message</label>
                     <textarea
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       rows={5}
                       className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background resize-none"
                       placeholder="How can we help you?"
                     />
                   </div>
                   <button
                     type="submit"
                     disabled={loading}
                     className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                   >
                     {loading ? (
                       <Loader2 className="w-4 h-4 animate-spin" />
                     ) : (
                       <Send className="w-4 h-4" />
                     )}
                     Send Message
                   </button>
                 </form>
               </div>
             </div>
           </div>
         </div>
       </main>
 
       <Footer />
     </div>
   );
 };
 
 export default Contact;