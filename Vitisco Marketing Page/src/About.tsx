const About = () => {
  return (
    <>
      <section>
        <div className="text-center text-[50px] py-10 italic font-bold">
            We Are The Developers!
        </div>
      </section>

      <section className="py-20 w-[1500px] mx-auto ">
        {/* First Section - Image Right */}
        <div className="w-full px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 ">
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-1 w-24 mb-6"></div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Zuhar Ahamed
              </h2>
              <p className="text-gray-600 mb-4 text-[20px]">
                Full Name: Cader Ali Zuhar Ahamed.
              </p>
              <p className="text-gray-600 mb-8 text-[20px]">IIT ID: 20232323</p>
            </div>
            <div className="order-1 md:order-5 transform hover:scale-105 transition-transform duration-300">
              <img
                src="/Images/zhr.jpg"
                alt="Student learning sign language"
                className="rounded-2xl shadow-2xl w-[600px] h-[600px]"
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
                src="/Images/me.jpg"
                alt="Community interaction"
                className="rounded-2xl shadow-2xl w-[600px]"
              />
            </div>
            <div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-1 w-24 mb-6"></div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Mohamed Shazni
              </h2>
              <p className="text-gray-600 mb-4 text-[20px]">
                Full Name: Mohamed Faslan Mohamed Shazni
              </p>
              <p className="text-gray-600 mb-8 text-[20px]">
                IIT ID: 20232600
              </p>
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
                Ayman Jaleel
              </h2>
              <p className="text-gray-600 mb-4 text-[20px]">
                Full Name: Sajaal Ayman Jaleel
              </p>
              <p className="text-gray-600 mb-8 text-[20px]">
                IIT ID: 20232150
              </p>
            </div>
            <div className="order-1 md:order-2 transform hover:scale-105 transition-transform duration-300">
              <img
                src="/Images/aymn.jpg"
                alt="Progress tracking dashboard"
                className="rounded-2xl shadow-2xl w-[600px]"
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
                className="rounded-2xl shadow-2xl w-[600px] mx-auto"
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
    </>
  );
};

export default About;
