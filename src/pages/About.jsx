import { assets } from '../assets/assets';

export default function About() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-14">
      <p className="text-sm tracking-widest uppercase text-slate-500">Behind the project</p>
      <h1 className="text-4xl prata-regular mt-3 mb-8">An e-commerce journey, built on AWS</h1>
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <img src={assets.about_img} alt="Clothing collection" className="rounded-xl" />
        <div className="space-y-5 text-slate-600 leading-relaxed">
          <p>
            KIMPERI is an academic portfolio project by Badr El Jouhari, developed during an
            introductory internship at Keltech in July–August 2025.
          </p>
          <p>
            The original application connected a React storefront to a serverless AWS backend:
            Cognito for identity, API Gateway and Lambda for application logic, DynamoDB for
            products and reviews, and SES for order notifications.
          </p>
          <p>
            This version preserves the shopping experience as a local demonstration. The original
            AWS resources have been retired to control costs.
          </p>
          <a
            href="https://github.com/Kimperi/ecom"
            className="inline-block text-slate-900 underline"
          >
            Read the code and architecture on GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
