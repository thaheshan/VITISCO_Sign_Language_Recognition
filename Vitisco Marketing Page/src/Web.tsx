import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Video, Award } from "lucide-react";

const VitiscoLanding = () => {
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

  return (
    <div className="bg-gray-200">
      {/* Hero Section */}
      <header className="bg-gray-200 sticky top-0 z-50 shadow-lg py-1">
        <div className="px-4 lg:px-8 flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-4">
            <img
              src="/Images/vitisco logo PNG.png"
              alt="vitisco"
              className="w-12 md:w-16 lg:w-20"
            />
            <h1 className="text-lg md:text-2xl font-bold text-[#B2B5E7]-100 tracking-wider italic">
              VITISCO
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-x-16">
            <h1 className="text-sm font-bold text-gray-600">
              SITE LANGUAGE: ENGLISH
            </h1>
          </div>
        </div>
      </header>

      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <img
                src="\Images\vitisco logo PNG.png"
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
              <button className="bg-purple-800 text-white text-2xl px-[30px] py-[20px] rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105">
                Let's Begin!
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Alternating Sections */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        {/* First Section - Image Right */}
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
                visual learning experience. Our platform is designed
                specifically for the deaf community, ensuring that every lesson
                is presented in a clear, intuitive way that matches how you
                naturally learn and communicate.
              </p>
              <p className="text-gray-600 mb-8 text-[20px]">
                With our innovative approach, you'll learn through interactive
                videos, real-time feedback, and practical exercises that
                simulate real-world conversations.
              </p>
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg">
                Explore Lessons
              </button>
            </div>
            <div className="order-1 md:order-5 transform hover:scale-105 transition-transform duration-300">
              <img
                src="/Images/sgn.jpg"
                alt="Student learning sign language"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Decorative Separator */}
        <div className="my-32 relative">
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-full shadow-lg relative -mt-6">
              <svg
                className="w-12 h-12 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Second Section - Image Left */}
        <div className="px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <img
                src="/Images/community.jpeg"
                alt="Community interaction"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
            </div>
            <div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-1 w-24 mb-6"></div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Join Our Vibrant Community
              </h2>
              <p className="text-gray-600 mb-4 text-[20px]">
                Learning a language is more than just lessons – it's about
                connection.{" "}
                <span className="text-purple-800 font-bold">VITISCO</span>{" "}
                brings together a diverse community of learners, native signers,
                and educators who share your passion for sign language and deaf
                culture.
              </p>
              <p className="text-gray-600 mb-8 text-[20px]">
                Participate in group sessions, join discussion forums, and
                practice with peers in a supportive environment.
              </p>
              <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg">
                Join Community
              </button>
            </div>
          </div>
        </div>

        {/* Another Decorative Separator */}
        <div className="my-32 relative">
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-full shadow-lg relative -mt-6">
              <svg
                className="w-12 h-12 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Third Section - Image Right */}
        <div className="w-full px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-1 w-24 mb-6"></div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Track Your Progress
              </h2>
              <p className="text-gray-600 mb-4 text-[20px]">
                Stay motivated with our comprehensive progress tracking system.
                Watch as your skills grow through interactive assessments,
                achievement badges, and detailed performance analytics.
              </p>
              <p className="text-gray-600 mb-8 text-[20px]">
                Our adaptive learning technology personalizes your experience,
                ensuring you're always challenged at the right level.
              </p>
              <button className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-all transform hover:scale-105 shadow-lg">
                View Progress System
              </button>
            </div>
            <div className="order-1 md:order-2 transform hover:scale-105 transition-transform duration-300">
              <img
                src="/Images/dashboard.jpg"
                alt="Progress tracking dashboard"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Final Decorative Separator */}
        <div className="my-32 relative">
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent"></div>
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-full shadow-lg relative -mt-6">
              <svg
                className="w-12 h-12 text-teal-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="w-full px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <img
                src="/Images/vr.jpg"
                alt="Progress tracking dashboard"
                className="rounded-2xl shadow-2xl w-full max-w-md mx-auto"
              />
            </div>
            <div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-1 w-24 mb-6"></div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Virtual Room
              </h2>
              <p className="text-gray-600 mb-4 text-[20px]">
                Connect, collaborate, and thrive with our dynamic Room Match
                feature. Pair up with learners worldwide in real-time for
                interactive practice sessions, tailored to your skill level and
                interests. Whether you're seeking friendly competition or
                teamwork, find the perfect partner to enhance your learning
                journey. Earn milestone badges for successful collaborations and
                track your progress as you grow together in a supportive,
                inclusive community. Start matching, stay engaged, and achieve
                fluency faster!
              </p>
              <p className="text-gray-600 mb-8 text-[20px]">
                Many competitions One winner! Lets choose{" "}
                <span className="text-purple-800 font-bold">VITISCO...</span>
              </p>
              <button className="bg-green-400 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg">
                View LeaderBoard
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0E0D2A] py-[250px]">
        <div className="flex justify-center space-x-16 cursor-pointer">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <img
              src="\Images\vitisco logo PNG.png"
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
            <br />
            <button className="bg-white px-[30px] py-[20px] tracking-[5px] font-bold italic hover:bg-gray-700 shadow-lg hover:text-white">
              PURCHASE
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 bg-gray-200 mt-12">
        <div className="px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-800 mb-8 md:mb-16">
            Why Choose{" "}
            <span className="text-purple-800 tracking-widest italic">
              VITISCO
            </span>
            ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 
                                       transform hover:-translate-y-1 ${feature.bgColor}`}
              >
                <CardHeader>
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <CardTitle className="text-center text-lg md:text-xl font-semibold text-gray-800">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 text-sm md:text-base">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative Wave Separator */}
      <div className="relative h-24 bg-gray-200">
        <div
          className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-r from-indigo-900 to-purple-900"
          style={{
            clipPath: "polygon(0 100%, 100% 100%, 100% 40%, 0 100%)",
          }}
        ></div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-20">
        <div className="w-full px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Ready to Start Your Journey With VITISCO?
          </h2>
          <p className="mb-10 text-[20px] text-indigo-100 text-center">
            Join thousands of learners in our growing community
          </p>
          <div className="flex justify-center space-x-16 cursor-pointer">
            <div>
              <p className="text-2xl font-bold">Developers</p>
              <br />
              <p className="text-[18px] text-gray-300 mb-3 hover:text-white">
                Suresh Thaheshan
              </p>
              <p className="text-[18px] text-gray-300 mb-3 hover:text-white">
                Zuhar Ahamed
              </p>
              <p className="text-[18px] text-gray-300 mb-3 hover:text-white">
                Ayman Jaleel
              </p>
              <p className="text-[18px] text-gray-300 mb-3 hover:text-white">
                Mohamed Shazni
              </p>
              <p className="text-[18px] text-gray-300 mb-3 hover:text-white">
                Rifaideen Shilma
              </p>
              <p className="text-[18px] text-gray-300 hover:text-white">
                Muaaza Mazeer
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">Apps</p>
              <br />
              <p className="text-[18px] text-gray-300 mb-3">
                VITISCO for Android
              </p>
              <p className="text-[18px] text-gray-300">VITISCO for iOS</p>
            </div>
            <div>
              <p className="text-2xl font-bold">Help & Supports</p>
              <br />
              <p className="text-[18px] text-gray-300">VITISCO FAQs</p>
            </div>
            <div>
              <p className="text-2xl font-bold">Privacy & Terms</p>
              <br />
              <p className="text-[18px] text-gray-300 mb-3">Privacy</p>
              <p className="text-[18px] text-gray-300">Terms</p>
            </div>
            <div>
              <p className="text-2xl font-bold">Products</p>
              <br />
              <p className="text-[18px] text-gray-300 mb-3">VITISCO</p>
              <p className="text-[18px] text-gray-300">VITISCO PRO</p>
            </div>
            <div>
              <p className="text-2xl font-bold">Social</p>
              <br />
              <p className="text-[18px] text-gray-300 mb-3">Instagram</p>
              <p className="text-[18px] text-gray-300 mb-3">Facebook</p>
              <p className="text-[18px] text-gray-300">LinkedIn</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VitiscoLanding;
