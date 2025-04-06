import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const CallToActionSection = () => {
  const { user } = useAuth();

  return (
    <div className="bg-primary-700">
      <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          <span className="block">Start preserving your memories today</span>
        </h2>
        <p className="mt-4 text-lg leading-6 text-primary-200">
          Sign up for free and begin capturing the moments that matter most to you.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          {!user ? (
            <>
              <Link href="/auth">
                <Button
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-primary-50"
                >
                  Get started
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-primary-800 text-white border-primary-500 hover:bg-primary-900"
                >
                  Learn more
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/memories/add">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-primary-50"
              >
                Add a new memory
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallToActionSection;
