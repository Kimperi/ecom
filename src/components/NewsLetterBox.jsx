import { Link } from 'react-router-dom';
export default function NewsLetterBox() {
  return (
    <section className="max-w-4xl mx-auto text-center px-6 py-12 bg-slate-50 rounded-xl">
      <p className="text-sm uppercase tracking-widest text-slate-500">Explore the implementation</p>
      <h2 className="text-2xl prata-regular mt-3">More than a storefront</h2>
      <p className="text-slate-600 mt-4">
        Discover the architecture, the AWS services and the engineering decisions behind this
        project.
      </p>
      <Link to="/about" className="inline-block underline mt-5 font-semibold">
        About the project
      </Link>
    </section>
  );
}
