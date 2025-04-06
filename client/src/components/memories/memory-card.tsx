import { Memory, User, Category } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemoryCardProps {
  memory: Memory;
}

const MemoryCard = ({ memory }: MemoryCardProps) => {
  // Fetch the category data
  const { data: category } = useQuery<Category>({
    queryKey: ["/api/categories", memory.categoryId],
    enabled: !!memory.categoryId,
  });

  // Fetch the user data
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", memory.userId],
  });

  // Calculate estimated read time (very simple algorithm: 1 min per 200 words)
  const wordCount = memory.content.trim().split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Format the date
  const formattedDate = memory.createdAt
    ? format(new Date(memory.createdAt), "MMM d, yyyy")
    : "";

  return (
    <Card className="flex flex-col rounded-lg shadow-lg overflow-hidden h-full bg-white hover:shadow-xl transition-shadow duration-300">
      <div className="flex-shrink-0 h-48 relative">
        {memory.imageUrl ? (
          <img
            className="h-full w-full object-cover"
            src={memory.imageUrl}
            alt={memory.title}
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {memory.visibility === "private" && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-white/80">Private</Badge>
          </div>
        )}
      </div>
      <CardContent className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex-1">
          {category && (
            <div className="text-sm font-medium text-primary mb-2">
              <Badge variant="secondary" className="bg-primary-100 text-primary-600 hover:bg-primary-200">
                {category.name}
              </Badge>
            </div>
          )}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{memory.title}</h3>
          <p className="mt-1 text-base text-gray-500 line-clamp-3">
            {memory.content}
          </p>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-4 px-6">
        {user && (
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user.profilePicture || ""}
                alt={user.username}
              />
              <AvatarFallback>
                {user.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user.username}
              </p>
              <div className="flex space-x-1 text-sm text-gray-500">
                <time dateTime={memory.createdAt?.toString()}>{formattedDate}</time>
                <span aria-hidden="true">&middot;</span>
                <span>{readTime} min read</span>
              </div>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default MemoryCard;
