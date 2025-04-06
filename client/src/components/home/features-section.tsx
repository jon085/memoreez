import { Camera, Lock, FolderTree, Calendar } from "lucide-react";

const FeatureSection = () => {
  const features = [
    {
      name: "Rich Media Experience",
      description:
        "Upload photos, videos, and audio to enhance your memories. Add context with detailed descriptions and emotional tags.",
      icon: Camera,
    },
    {
      name: "Privacy Controls",
      description:
        "Choose who can view your memories. Keep your personal moments private or share them with friends and family.",
      icon: Lock,
    },
    {
      name: "Custom Categories",
      description:
        "Organize your memories with custom categories. Create a structure that makes sense for your life journey.",
      icon: FolderTree,
    },
    {
      name: "Timeline View",
      description:
        "Explore your memories chronologically. See how your story unfolds through time with our interactive timeline.",
      icon: Calendar,
    },
  ];

  return (
    <div className="py-12 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">
            Features
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A better way to preserve memories
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our platform provides all the tools you need to capture your life's
            journey.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    {feature.name}
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
