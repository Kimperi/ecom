import React from "react";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import NewsLetterBox from "../components/NewsLetterBox";

const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen px-4 sm:px-10 md:px-20 pb-10 animate-fade-in">
      <div className="text-2xl text-center border-t pt-8 md:pt-20">
        <Title text1={"ABOUT"} text2={"US"} />
        <p className="text-gray-500 text-base mt-2">
          Welcome to Forever – Where Fashion Meets Innovation!
        </p>
      </div>
      <div className="my-10 flex flex-col md:flex-row gap-10 md:gap-16 items-center">
        <img
          className="w-full max-w-xs md:max-w-[450px] object-cover rounded-lg shadow-lg"
          src={assets.about_img}
          alt="About Forever"
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600 text-center md:text-left">
          <p>
            <span className="text-lg font-semibold text-gray-800">Forever</span>{" "}
            was born out of a passion for innovation and a desire to
            revolutionize fashion.
          </p>
          <p>
            Since our inception, we've worked tirelessly to curate a diverse
            selection of the latest trends, ensuring our customers always have
            access to the best in style and quality.
          </p>
          <b className="text-gray-800 text-lg mt-2">Our Mission</b>
          <p>
            Our mission at Forever is to empower customers with choice,
            convenience, and confidence. We believe fashion should be
            accessible, enjoyable, and a true reflection of individuality.
          </p>
        </div>
      </div>
      <hr className="my-10 border-gray-200" />
      <div className="text-xl py-4 text-center">
        <Title text1={"WHY"} text2={"CHOOSE US"} />
      </div>
      <div className="flex flex-col md:flex-row gap-6 text-sm mb-20">
        <div className="w-full md:w-1/3 bg-white border px-8 md:px-10 py-8 sm:py-16 flex flex-col gap-5 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <b className="text-lg text-gray-800">Quality Assurance</b>
          <p className="text-gray-600">
            We meticulously select and vet each product to ensure it meets our
            high standards. Your satisfaction and trust are our top priorities.
          </p>
        </div>
        <div className="w-full md:w-1/3 bg-white border px-8 md:px-10 py-8 sm:py-16 flex flex-col gap-5 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <b className="text-lg text-gray-800">Convenience</b>
          <p className="text-gray-600">
            With our user-friendly interface and hassle-free checkout, shopping
            is a breeze. Enjoy fast delivery and easy returns.
          </p>
        </div>
        <div className="w-full md:w-1/3 bg-white border px-8 md:px-10 py-8 sm:py-16 flex flex-col gap-5 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
          <b className="text-lg text-gray-800">Exceptional Customer Service</b>
          <p className="text-gray-600">
            Our team of dedicated professionals is here to assist you at every
            step. We value your feedback and are always ready to help.
          </p>
        </div>
      </div>
      <NewsLetterBox />
    </div>
  );
};

export default About;
