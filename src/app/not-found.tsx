import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="text-center px-4">
        <div
          className="text-9xl font-black select-none mb-4"
          style={{ color: "hsl(221 83% 53% / 0.15)" }}
        >
          404
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
