import { Link } from "react-router";
import { Home, Search } from "lucide-react";
import { Button } from "../components/ui/button";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-orange-500 mb-4">404</h1>
          <h2 className="text-3xl font-bold mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link to="/menu">
            <Button size="lg" variant="outline" className="border-orange-300">
              <Search className="w-5 h-5 mr-2" />
              Browse Menu
            </Button>
          </Link>
        </div>

        <div className="mt-12">
          <img
            src="https://images.unsplash.com/photo-1652463843090-9204717dbc6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpY2lvdXMlMjBmb29kJTIwdGFibGV8ZW58MXx8fHwxNzczOTg1NTgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Food"
            className="mx-auto rounded-lg shadow-lg w-full max-w-md opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
