import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsLetterBox from "../components/NewsLetterBox";

const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen px-4 sm:px-10 md:px-20 pb-10 animate-fade-in">
      {/* Hero Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center ">
          <p className="text-2xl text-gray-600 mt-6 max-w-3xl mx-auto leading-relaxed">
            Welcome to <span className="font-bold text-gray-900">KIMPERI</span>{" "}
            – Where Fashion Meets Innovation!
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Image Section */}
          <div className="relative">
            <div className="relative z-20">
              <img
                className="w-full h-auto max-w-lg mx-auto rounded-2xl shadow-2xl"
                src={assets.about_img}
                alt="About KIMPERI"
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">Our Story</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-800">KIMPERI</span> was
                born out of a passion for innovation and a desire to
                revolutionize fashion. We believe that everyone deserves access
                to quality, stylish clothing that makes them feel confident and
                empowered.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Since our inception, we've worked tirelessly to curate a diverse
                selection of the latest trends, ensuring our customers always
                have access to the best in style and quality.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-gray-900">Our Mission</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our mission at{" "}
                <span className="font-semibold text-gray-800">KIMPERI</span> is
                to empower customers with choice, convenience, and confidence.
                We believe fashion should be accessible, enjoyable, and a true
                reflection of individuality.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-gray-900">Our Vision</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                To become the leading destination for fashion enthusiasts who
                seek quality, style, and innovation. We envision a world where
                everyone can express their unique personality through fashion.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="text-center mb-16">
          <Title text1={"WHY"} text2={"CHOOSE US"} />
          <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
            We're committed to providing you with the best shopping experience
            possible
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Quality Assurance
            </h3>
            <p className="text-gray-600 leading-relaxed">
              We meticulously select and vet each product to ensure it meets our
              high standards. Your satisfaction and trust are our top
              priorities.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Convenience
            </h3>
            <p className="text-gray-600 leading-relaxed">
              With our user-friendly interface and hassle-free checkout,
              shopping is a breeze. Enjoy fast delivery and easy returns.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Exceptional Service
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Our team of dedicated professionals is here to assist you at every
              step. We value your feedback and are always ready to help.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do at KIMPERI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-600">I</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-sm text-gray-600">Always pushing boundaries</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-600">Q</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality</h3>
              <p className="text-sm text-gray-600">
                Never compromising on standards
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-600">T</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Trust</h3>
              <p className="text-sm text-gray-600">
                Building lasting relationships
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-gray-600">E</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-sm text-gray-600">Striving for perfection</p>
            </div>
          </div>
        </div>
      </div>
      <NewsLetterBox />
    </div>
  );
};

export default About;
