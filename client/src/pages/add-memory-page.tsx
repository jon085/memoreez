import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Memory } from "@shared/schema";
import MemoryForm from "@/components/memories/memory-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

const AddMemoryPage = () => {
  const { id } = useParams();
  const memoryId = id ? parseInt(id) : undefined;
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Fetch memory if editing
  const { data: memory, isLoading } = useQuery<Memory>({
    queryKey: ["/api/memories", memoryId],
    enabled: !!memoryId,
  });

  // Check authorization for editing
  useEffect(() => {
    if (memoryId && memory && user && memory.userId !== user.id && user.role !== "admin") {
      navigate("/memories");
    }
  }, [memoryId, memory, user, navigate]);

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate("/memories")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Memories
          </Button>
        </div>

        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-gray-900">
              {memoryId ? "Edit Memory" : "Create New Memory"}
            </h1>
            <p className="text-gray-500">
              {memoryId
                ? "Update your memory details below."
                : "Capture your special moment with as much detail as you'd like."}
            </p>
          </CardHeader>
          <CardContent>
            {memoryId && isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <MemoryForm memoryId={memoryId} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddMemoryPage;
