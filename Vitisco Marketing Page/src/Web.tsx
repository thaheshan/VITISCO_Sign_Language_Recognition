import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Video, Award } from "lucide-react";

const VitiscoLanding = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);
  const particleContainerRef = useRef<HTMLDivElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const lastParticleTime = useRef(0);
  const particleInterval = 50;

  const features = [
    {
      icon: <Video className="w-8 h-8 text-indigo-500" />,
      title: "Visual Sign Language Learning",
      description:
        "Interactive video lessons with clear, high-quality sign language demonstrations and visual cues",
      bgColor: "bg-indigo-50",
    },
    {
      icon: <BookOpen className="w-8 h-8 text-teal-500" />,
      title: "Comprehensive Curriculum",
      description:
        "Structured lessons covering basic to advanced concepts in multiple sign languages",
      bgColor: "bg-teal-50",
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: "Community Support",
      description:
        "Connect with other learners and native signers in our inclusive learning community",
      bgColor: "bg-purple-50",
    },
    {
      icon: <Award className="w-8 h-8 text-rose-500" />,
      title: "Progress Tracking",
      description:
        "Track your learning journey with achievement badges and progress indicators",
      bgColor: "bg-rose-50",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (videoSectionRef.current) {
        const videoSectionHeight = videoSectionRef.current.offsetHeight;
        setScrolled(window.scrollY > videoSectionHeight);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="bg-gray-200 hidden-cursor">
      {/* Custom Cursor Elements */}
      <div
        className="custom-cursor"
        style={{
          position: "fixed",
          left: cursorPosition.x,
          top: cursorPosition.y,
          pointerEvents: "none",
          zIndex: 9999,
          transform: "translate(-50%, -50%)",
        }}
      >
        <img
          src="../Images/logo2.png"
          alt="cursor"
          className="w-24 h-24 transition-transform duration-100 ease-out"
        />
      </div>
      <div ref={particleContainerRef} className="particle-container" />

      {/* Updated Header Navigation */}
      <header
        className={`fixed w-full top-0 z-50 py-1 transition-all duration-300 ${
          scrolled ? "bg-white shadow-lg" : "bg-transparent backdrop-blur-sm"
        }`}
      >
        <div className="px-4 lg:px-8 flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-4">
            <img
              src="/Images/vitisco logo PNG.png"
              alt="vitisco"
              className={`w-12 md:w-16 lg:w-20 transition-all duration-300 ${
                scrolled ? "filter-none" : "filter-none"
              }`}
            />
            <h1
              className={`text-lg md:text-2xl font-bold tracking-wider italic ${
                scrolled ? "text-purple-800" : "text-white"
              }`}
            >
              VITISCO
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-x-16">
            <h1
              className={`text-sm font-bold ${
                scrolled ? "text-gray-600" : "text-white"
              }`}
            >
              About
            </h1>
            <h1
              className={`text-sm font-bold ${
                scrolled ? "text-gray-600" : "text-white"
              }`}
            >
              Contact Us
            </h1>
            <h1
              className={`text-sm font-bold ${
                scrolled ? "text-gray-600" : "text-white"
              }`}
            >
              Features
            </h1>
            <h1
              className={`text-sm font-bold ${
                scrolled ? "text-gray-600" : "text-white"
              }`}
            >
              Get Started!
            </h1>
            <h1
              className={`text-sm font-bold ${
                scrolled ? "text-gray-600" : "text-white"
              }`}
            >
              SITE LANGUAGE: ENGLISH
            </h1>
          </div>
        </div>
      </header>

      {/* Video Section */}
      {/* Video Section */}
      <section className="relative bg-black py-16" ref={videoSectionRef}>
        <div className="px-4">
          <div className="w-full h-[75vh] overflow-hidden relative">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              poster="/Images/video-poster.jpg"
            >
              <source src="../Images/0121.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="mt-8 text-center relative z-10">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 px-4">
              Watch How VITISCO Transforms Sign Language Learning
            </h3>
            <div className="flex flex-col md:flex-row justify-center gap-4 px-4">
              <button className="bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg">
                Take Video Tour
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-purple-900 transition-all shadow-lg">
                See Success Stories
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Original Hero Section Enhanced */}
      <section className="py-20 max-w-7xl mx-auto px-4 mt-16">
        <div className="px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <img
                src="/Images/vitisco logo PNG.png"
                alt="Community interaction"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
            </div>
            <div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-1 w-24 mb-6"></div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                <span className="text-purple-800">VITISCO!</span> The Best
                Platform To Learn{" "}
                <span className="text-purple-800">Sign Languages...</span>
              </h2>
              <p className="text-gray-600 mb-4 text-2xl">
                The free, fun and effective way to learn a sign language
              </p>
              <p className="text-gray-600 mb-8 text-2xl">
                With more and more interactive sessions and multiple tasks.{" "}
                <span className="text-purple-800 font-bold">
                  Collect your badges and rewards Now Onwards!!
                </span>
              </p>
              <button className="bg-purple-800 text-white text-2xl px-[30px] py-[20px] rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 shadow-xl">
                Let's Begin!
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Alternating Content Sections */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        {/* First Section */}
        <div className="w-full px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-1 w-24 mb-6"></div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Learn Sign Language Naturally
              </h2>
              <p className="text-gray-600 mb-4 text-[20px]">
                <span className="text-purple-800 font-bold">VITISCO</span>{" "}
                revolutionizes sign language education through an immersive
                visual learning experience.
              </p>
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg">
                Explore Lessons
              </button>
            </div>
            <div className="order-1 md:order-2 transform hover:scale-105 transition-transform duration-300">
              <img
                src="/Images/sgn.jpg"
                alt="Student learning"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Second Section */}
        <div className="my-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <img
                src="/Images/community.jpeg"
                alt="Community"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
            </div>
            <div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-1 w-24 mb-6"></div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Join Our Vibrant Community
              </h2>
              <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg">
                Join Community
              </button>
            </div>
          </div>
        </div>

        {/* Third Section */}
        <div className="w-full px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-1 w-24 mb-6"></div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Track Your Progress
              </h2>
              <button className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-all transform hover:scale-105 shadow-lg">
                View Progress
              </button>
            </div>
            <div className="order-1 md:order-2 transform hover:scale-105 transition-transform duration-300">
              <img
                src="/Images/dashboard.jpg"
                alt="Dashboard"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
            </div>
          </div>
        </div>

        {/* VR Section */}
        <div className="my-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <img
                src="/Images/vr.jpg"
                alt="VR"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
            </div>
            <div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-1 w-24 mb-6"></div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Virtual Room
              </h2>
              <button className="bg-green-400 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg">
                View LeaderBoard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pro Section */}
      <section className="bg-[#0E0D2A] py-[250px]">
        <div className="flex justify-center space-x-16 cursor-pointer">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <img
              src="/Images/vitisco logo PNG.png"
              alt="Pro"
              className="w-[600px] h-[500px]"
            />
          </div>
          <div className="text-center mt-[150px]">
            <p className="text-white font-bold text-[30px] italic tracking-[10px]">
              POWER UP WITH
            </p>
            <p className="text-white font-bold text-[70px] italic tracking-[10px]">
              VITISCO PRO
            </p>
            <button className="bg-white px-[30px] py-[20px] tracking-[5px] font-bold italic hover:bg-gray-700 shadow-lg hover:text-white">
              PURCHASE
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 bg-gray-200 mt-12">
        <div className="px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
            Why Choose <span className="text-purple-800 italic">VITISCO</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${feature.bgColor}`}
              >
                <CardHeader>
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <CardTitle className="text-center text-xl font-semibold text-gray-800">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Developers Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
            Meet Our <span className="text-purple-800">Visionary Team</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {/* Developer 1 */}
            <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
              <img
                src="../Images/thaheshan.jpeg"
                alt="Suresh Thaheshan"
                className="w-32 h-32 rounded-full object-cover shadow-lg mb-4 border-4 border-purple-200"
              />
              <h3 className="text-xl font-bold text-gray-800">
                Suresh Thaheshan
              </h3>
              <p className="text-sm text-purple-600 font-medium">Founder</p>
            </div>

            {/* Developer 2 */}
            <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
              <img
                src="../Images/zuhar.jpeg"
                alt="Zuhar Ahamed"
                className="w-32 h-32 rounded-full object-cover shadow-lg mb-4 border-4 border-purple-200"
              />
              <h3 className="text-xl font-bold text-gray-800">Zuhar Ahamed</h3>
              <p className="text-sm text-purple-600 font-medium">Founder</p>
            </div>

            {/* Developer 3 */}
            <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
              <img
                src="../Images/Aymandas.jpg"
                alt="Ayman Jaleel"
                className="w-32 h-32 rounded-full object-cover shadow-lg mb-4 border-4 border-purple-200"
              />
              <h3 className="text-xl font-bold text-gray-800">Ayman Jaleel</h3>
              <p className="text-sm text-purple-600 font-medium">Founder</p>
            </div>

            {/* Developer 4 */}
            <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
              <img
                src="../Images/Shazni-2.jpeg"
                alt="Mohamed Shazni"
                className="w-32 h-32 rounded-full object-cover shadow-lg mb-4 border-4 border-purple-200"
              />
              <h3 className="text-xl font-bold text-gray-800">
                Mohamed Shazni
              </h3>
              <p className="text-sm text-purple-600 font-medium">Founder</p>
            </div>

            {/* Developer 5 */}
            <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
              <img
                src="../Images/Shilma.jpeg"
                alt="Rifaideen Shilma"
                className="w-32 h-32 rounded-full object-cover shadow-lg mb-4 border-4 border-purple-200"
              />
              <h3 className="text-xl font-bold text-gray-800">
                Rifaideen Shilma
              </h3>
              <p className="text-sm text-purple-600 font-medium">Founder </p>
            </div>

            {/* Developer 6 */}
            <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-300">
              <img
                src="../Images/Maaza.jpeg"
                alt="Muaaza Mazeer"
                className="w-32 h-32 rounded-full object-cover shadow-lg mb-4 border-4 border-purple-200"
              />
              <h3 className="text-xl font-bold text-gray-800">Muaaza Mazeer</h3>
              <p className="text-sm text-purple-600 font-medium">Founder</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our diverse team of sign language enthusiasts and tech experts is
              committed to making sign language learning accessible to everyone
              worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Ready to Start Your Journey With VITISCO?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mt-12">
            <div>
              <p className="text-xl font-bold mb-4">Developers</p>
              <p className="text-gray-300 hover:text-white">Suresh Thaheshan</p>
              <p className="text-gray-300 hover:text-white">Zuhar Ahamed</p>
              <p className="text-gray-300 hover:text-white">Ayman Jaleel</p>
              <p className="text-gray-300 hover:text-white">Mohamed Shazni</p>
              <p className="text-gray-300 hover:text-white">Rifaideen Shilma</p>
              <p className="text-gray-300 hover:text-white">Muaaza Mazeer</p>
            </div>
            <div>
              <p className="text-xl font-bold mb-4">Apps</p>
              <p className="text-gray-300">Android</p>
              <p className="text-gray-300">iOS</p>
            </div>
            <div>
              <p className="text-xl font-bold mb-4">Support</p>
              <p className="text-gray-300">FAQs</p>
              <p className="text-gray-300">Contact</p>
            </div>
            <div>
              <p className="text-xl font-bold mb-4">Legal</p>
              <p className="text-gray-300">Privacy</p>
              <p className="text-gray-300">Terms</p>
            </div>
            <div>
              <p className="text-xl font-bold mb-4">Products</p>
              <p className="text-gray-300">VITISCO</p>
              <p className="text-gray-300">PRO</p>
            </div>
            <div>
              <p className="text-xl font-bold mb-4">Social</p>
              <p className="text-gray-300">Instagram</p>
              <p className="text-gray-300">Facebook</p>
              <p className="text-gray-300">LinkedIn</p>
            </div>
          </div>
          <div className="mt-16 text-center text-gray-300">
            © 2024 VITISCO. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VitiscoLanding;
