import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Memory, User, Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Edit, Trash2, ArrowLeft, Eye, EyeOff } from "lucide-react";

const MemoryDetailsPage = () => {
  const { id } = useParams();
  const memoryId = parseInt(id as string);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch memory
  const {
    data: memory,
    isLoading: isLoadingMemory,
    error,
  } = useQuery<Memory>({
    queryKey: ["/api/memories", memoryId],
  });

  // Fetch memory owner
  const { data: memoryOwner, isLoading: isLoadingOwner } = useQuery<User>({
    queryKey: ["/api/users", memory?.userId],
    enabled: !!memory,
  });

  // Fetch category
  const { data: category } = useQuery<Category>({
    queryKey: ["/api/categories", memory?.categoryId],
    enabled: !!memory?.categoryId,
  });

  // Delete memory mutation
  const deleteMemoryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/memories/${memoryId}`);
    },
    onSuccess: () => {
      toast({
        title: "Memory Deleted",
        description: "Your memory has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/memories/public"] });
      navigate("/memories");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Format dates
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "";
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  // Check if user can edit this memory
  const canEdit = user && memory && user.id === memory.userId;

  // Handle loading error
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Memory Not Found
                </h2>
                <p className="text-gray-500 mb-6">
                  The memory you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Button onClick={() => navigate("/memories")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Memories
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoadingMemory || isLoadingOwner) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Memory Not Found
                </h2>
                <p className="text-gray-500 mb-6">
                  The memory you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Button onClick={() => navigate("/memories")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Memories
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/memories")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Memories
          </Button>
        </div>

        <Card className="overflow-hidden">
          {memory.imageUrl && (
            <div className="h-60 sm:h-80 md:h-96 w-full">
              <img
                src={memory.imageUrl}
                alt={memory.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{memory.title}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {category && (
                  <Badge variant="secondary" className="bg-primary-100 text-primary-600">
                    {category.name}
                  </Badge>
                )}
                <Badge 
                  variant="outline" 
                  className={`flex items-center ${
                    memory.visibility === "private" 
                      ? "bg-gray-100" 
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {memory.visibility === "private" ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Private
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Public
                    </>
                  )}
                </Badge>
              </div>
            </div>

            {canEdit && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/memories/edit/${memory.id}`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your memory.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMemoryMutation.mutate()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleteMemoryMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-2">
            <div className="prose max-w-none">
              {memory.content.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t">
            <div className="flex items-center">
              {memoryOwner && (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={memoryOwner.profilePicture || ""}
                      alt={memoryOwner.username}
                    />
                    <AvatarFallback>
                      {memoryOwner.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {memoryOwner.username}
                    </p>
                    <div className="text-sm text-gray-500">
                      {memoryOwner.firstName} {memoryOwner.lastName}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span> {formatDate(memory.createdAt)}
              </div>
              {memory.updatedAt && 
                memory.updatedAt.toString() !== memory.createdAt?.toString() && (
                <div>
                  <span className="font-medium">Updated:</span> {formatDate(memory.updatedAt)}
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default MemoryDetailsPage;
