import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Heart, 
  Camera, 
  Phone, 
  MessageCircle, 
  MapPin, 
  ChefHat, 
  Clock, 
  Star, 
  Cake, 
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
  Moon,
  Sun,
  Award,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

// --- DATA ---

const CAKE_CATEGORIES = [
  { id: 'birthday', title: 'Birthday Cakes', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800', description: 'Make your special day sweeter with our custom creations.' },
  { id: 'wedding', title: 'Wedding Cakes', image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=800', description: 'Elegant, multi-tier masterpieces for your forever.' },
  { id: 'bento', title: 'Bento Cakes', image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&q=80&w=800', description: 'Mini treats, maximum joy for small celebrations.' },
  { id: 'cupcakes', title: 'Cupcakes', image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&q=80&w=800', description: 'Bite-sized joy in every swirl of frosting.' },
  { id: 'brownies', title: 'Brownies', image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&q=80&w=800', description: 'Rich, fudgy, and decadent Belgian chocolate.' },
  { id: 'dessert-boxes', title: 'Dessert Boxes', image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&q=80&w=800', description: 'The perfect choice for gifting and sharing.' },
];

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800',
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', text: 'The most delicious eggless cake I have ever had! The mango tiramisu was out of this world.', rating: 5 },
  { name: 'Anjali Desai', text: 'Popilicious never fails to amaze. The custom design for my daughter\'s birthday was perfect.', rating: 5 },
  { name: 'Rahul Mehta', text: 'Found my go-to baker in Surat. The quality of ingredients really stands out.', rating: 5 },
];

const FAQS = [
  { q: 'How to place an order?', a: 'You can place an order by clicking the WhatsApp button or DMing us on Camera.' },
  { q: 'How many days prior should I book?', a: 'For custom cakes, we recommend booking at least 3-5 days in advance.' },
  { q: 'Do you customize cakes?', a: 'Yes! We specialize in handcrafted, customized designs tailored to your theme.' },
  { q: 'Is delivery available?', a: 'We offer delivery within Surat city. Contact us for specific area availability.' },
];

// --- COMPONENTS ---

const Navbar = ({ isDark, setIsDark }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass py-3 shadow-md' : 'py-6 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-heading font-bold text-gradient"
        >
          Popilicious
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {['Home', 'About', 'Cakes', 'Gallery', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold hover:text-primary transition-colors">
              {item}
            </a>
          ))}
          <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-primary/10 transition-colors">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="btn-primary">Order Now</button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <button onClick={() => setIsDark(!isDark)} className="p-2">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl overflow-hidden glass"
          >
            <div className="p-8 flex flex-col gap-6 items-center">
              {['Home', 'About', 'Cakes', 'Gallery', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-xl font-semibold py-4 border-b border-gray-100 w-full text-center">
                  {item}
                </a>
              ))}
              <button className="btn-primary w-full mt-4">Order Now</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-bg-light/80" />
        <img 
          src="https://images.unsplash.com/photo-1562233237-1065544ad777?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover opacity-30"
          alt="Bakery background"
        />
      </motion.div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-script text-3xl text-primary-dark block mb-4"
        >
          Freshly Baked Every Day
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-8xl font-bold mb-6 text-gradient leading-tight"
        >
          Handcrafted Cakes <br /> Made With Love
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-2xl text-text-muted mb-10 max-w-2xl mx-auto"
        >
          Custom Cakes • Dessert Tables • Celebration Specials
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col md:flex-row gap-6 justify-center items-center"
        >
          <button className="btn-primary text-lg px-10">Explore Cakes</button>
          <button className="btn-outline text-lg px-10">Contact Baker</button>
        </motion.div>
      </div>

      <motion.div 
        style={{ y: y2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-primary-dark animate-bounce"
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <img 
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800" 
            className="rounded-3xl shadow-2xl z-10 relative w-full h-[500px] object-cover"
            alt="Baker working"
          />
          <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-primary/20 rounded-3xl -z-10" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Our Sweet Story</h2>
          <p className="text-xl text-text-muted mb-6 font-serif italic">
            "Baking isn't just about recipes; it's about sharing a piece of your heart."
          </p>
          <p className="text-lg text-text-muted mb-10 leading-relaxed">
            Welcome to Popilicious Cake! Founded by Sweety Shah, our journey started with a simple passion for creating eggless delights that look as good as they taste. Every cake we bake is a labor of love, using only the finest ingredients to ensure your celebrations are truly memorable.
          </p>

          <div className="grid grid-cols-3 gap-8">
            {[
              { label: 'Happy Customers', value: '500+' },
              { label: 'Custom Orders', value: '1.2k' },
              { label: 'Freshly Baked', value: '100%' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs uppercase tracking-wider text-text-muted font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const SignatureCakes = () => {
  return (
    <section id="cakes" className="bg-secondary/30 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Signature Creations</h2>
          <p className="text-text-muted text-lg">Explore our most-loved categories of treats.</p>
        </div>

        <div className="flex overflow-x-auto pb-10 gap-8 no-scrollbar snap-x items-stretch">
          {CAKE_CATEGORIES.map((cake, i) => (
            <motion.div 
              key={cake.id}
              whileHover={{ y: -10 }}
              className="min-w-[320px] md:min-w-[380px] cake-card snap-center flex-shrink-0 min-h-[550px]"
            >
              <div className="image-container">
                <img src={cake.image} alt={cake.title} />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <h3 className="text-2xl font-bold mb-3">{cake.title}</h3>
                <p className="text-text-muted mb-6 flex-grow">{cake.description}</p>
                <button className="text-primary font-bold flex items-center gap-2 hover:translate-x-2 transition-transform">
                  View More <Sparkles size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Gallery = () => {
  const [selectedImg, setSelectedImg] = useState(null);

  return (
    <section id="gallery" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Camera Vibes</h2>
          <p className="text-text-muted text-lg">Follow us @popilicious_cake for daily updates.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {GALLERY_IMAGES.map((img, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="relative aspect-square cursor-pointer overflow-hidden rounded-2xl group shadow-lg"
              onClick={() => setSelectedImg(img)}
            >
              <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                <Camera className="text-white" size={40} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center p-6"
            onClick={() => setSelectedImg(null)}
          >
            <motion.img 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              src={selectedImg} 
              className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
            />
            <button className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full" onClick={() => setSelectedImg(null)}>
              <X size={40} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const WhyChooseUs = () => {
  const features = [
    { icon: <Award size={32} />, title: 'Premium Ingredients', desc: 'We use only high-quality butter, Belgian chocolate, and fresh fruits.' },
    { icon: <ChefHat size={32} />, title: 'Handmade with Love', desc: 'Every decoration is carefully crafted by hand to ensure perfection.' },
    { icon: <Clock size={32} />, title: 'Freshly Baked', desc: 'No preservatives. Our cakes are baked to order for peak freshness.' },
    { icon: <Heart size={32} />, title: '100% Eggless', desc: 'Specializing in eggless treats that melt in your mouth every time.' },
  ];

  return (
    <section className="bg-primary/10 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="feature-card"
            >
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-8 text-primary">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
              <p className="text-text-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  return (
    <section id="reviews" className="py-24 relative overflow-hidden bg-white">
      <div className="max-w-4xl mx-auto text-center px-6">
        <Heart className="text-primary-dark mx-auto mb-8" size={60} />
        <h2 className="text-4xl md:text-5xl font-bold mb-16">Customer Love</h2>
        
        <div className="flex overflow-x-auto gap-8 no-scrollbar snap-x">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card snap-center">
              <p className="text-2xl md:text-3xl font-serif italic mb-10 leading-relaxed">"{t.text}"</p>
              <div className="flex justify-center gap-1 text-accent mb-4">
                {[...Array(t.rating)].map((_, i) => <Star key={i} fill="currentColor" size={20} />)}
              </div>
              <div className="font-bold text-xl">— {t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-24 bg-bg-light">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked</h2>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full p-6 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl font-semibold">{faq.q}</span>
                <ChevronDown className={`transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="p-6 pt-0 text-text-muted text-lg border-t border-gray-50">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-[3rem] p-10 md:p-20 shadow-soft flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/2">
            <h2 className="text-5xl font-bold mb-8 leading-tight">Let's Make Your <br /> Day Popilicious!</h2>
            <p className="text-text-muted text-xl mb-12">
              Have a custom request or want to inquire about availability? We'd love to hear from you and create something special.
            </p>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <MapPin size={28} />
                </div>
                <div>
                  <div className="font-bold text-lg">Our Location</div>
                  <div className="text-text-muted">Surat, Gujarat, India</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Camera size={28} />
                </div>
                <div>
                  <div className="font-bold text-lg">Camera</div>
                  <div className="text-text-muted">@popilicious_cake</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 mt-16">
              <button className="btn-primary flex items-center justify-center gap-3 py-4 text-lg">
                <MessageCircle size={24} /> WhatsApp Us
              </button>
              <button className="btn-outline flex items-center justify-center gap-3 py-4 text-lg">
                <Camera size={24} /> Camera DM
              </button>
            </div>
          </div>

          <div className="lg:w-1/2">
             <div className="bg-bg-light p-10 rounded-[2rem] border border-primary/10">
               <h3 className="text-3xl font-bold mb-8 text-center">Quick Inquiry</h3>
               <form className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <input type="text" placeholder="Your Name" className="w-full p-5 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-primary outline-none text-lg shadow-sm" />
                   <input type="email" placeholder="Your Email" className="w-full p-5 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-primary outline-none text-lg shadow-sm" />
                 </div>
                 <textarea placeholder="Tell us about your event (Date, Theme, Servings...)" rows="5" className="w-full p-5 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-primary outline-none text-lg shadow-sm" />
                 <button className="btn-primary w-full py-5 text-xl shadow-lg">Send Message</button>
               </form>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-24 px-6 bg-white border-t border-gray-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="text-4xl font-heading font-bold text-gradient">Popilicious</div>
        
        <div className="flex flex-wrap justify-center gap-10 text-sm font-semibold uppercase tracking-widest text-text-muted">
          {['About', 'Cakes', 'Gallery', 'Contact'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-primary transition-colors">{item}</a>
          ))}
        </div>

        <div className="flex gap-6">
          {[Camera, MessageCircle].map((Icon, i) => (
            <div key={i} className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-text-main hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm">
              <Icon size={24} />
            </div>
          ))}
        </div>
      </div>
      <div className="text-center mt-24 text-text-muted font-medium">
        © {new Date().getFullYear()} Popilicious Cake. Handcrafted with ❤️ in Surat.
      </div>
    </footer>
  );
};

const App = () => {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  return (
    <div className={`${isDark ? 'dark' : ''} selection:bg-primary selection:text-white antialiased`}>
      <AnimatePresence>
        {loading && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] bg-white flex flex-col items-center justify-center"
          >
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-primary mb-8"
            >
              <Cake size={100} />
            </motion.div>
            <h2 className="text-4xl font-heading text-gradient">Preparing Something Sweet...</h2>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar isDark={isDark} setIsDark={setIsDark} />
      <Hero />
      <About />
      <SignatureCakes />
      <WhyChooseUs />
      <Gallery />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
};

export default App;
