import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';
export default function Footer() {
  return (
    <footer className="border-t mt-16 px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between gap-8">
        <div className="max-w-md">
          <img src={assets.logo} alt="KIMPERI" className="w-32 mb-4" />
          <p className="text-sm text-slate-500">
            A React & AWS serverless e-commerce portfolio by Badr El Jouhari. Built to explore cloud
            architecture through a complete shopping journey.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-3 text-sm">
          <Link to="/collection">Collection</Link>
          <Link to="/about">About the project</Link>
          <a href="https://github.com/Kimperi/ecom">Source & documentation</a>
        </nav>
      </div>
    </footer>
  );
}
