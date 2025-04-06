import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMemorySchema, InsertMemory, Memory, Category } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";

interface MemoryFormProps {
  memoryId?: number;
}

const formSchema = insertMemorySchema.extend({
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const MemoryForm = ({ memoryId }: MemoryFormProps) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Fetch categories for the dropdown
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // If editing, fetch the memory data
  const { data: existingMemory, isLoading: isMemoryLoading } = useQuery<Memory>({
    queryKey: ["/api/memories", memoryId],
    enabled: !!memoryId,
  });

  // Set up form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: existingMemory?.title || "",
      content: existingMemory?.content || "",
      categoryId: existingMemory?.categoryId || undefined,
      visibility: existingMemory?.visibility || "private",
      imageUrl: existingMemory?.imageUrl || "",
    },
    values: existingMemory
      ? {
          title: existingMemory.title,
          content: existingMemory.content,
          categoryId: existingMemory.categoryId,
          visibility: existingMemory.visibility,
          imageUrl: existingMemory.imageUrl || "",
        }
      : undefined,
  });

  // Create memory mutation
  const createMemoryMutation = useMutation({
    mutationFn: async (data: InsertMemory) => {
      console.log("Making API request to create memory:", data);
      // The server will set the userId based on the authenticated user's session
      // We don't need to send userId as the server will extract it from req.user
      const { userId, ...memoryData } = data;
      const res = await apiRequest("POST", "/api/memories", memoryData);
      return await res.json();
    },
    onSuccess: (data) => {
      console.log("Memory created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/memories/public"] });
      toast({
        title: "Memory Created",
        description: "Your memory has been saved successfully.",
      });
      setTimeout(() => {
        console.log("Navigating to memories page after creation");
        navigate("/memories");
      }, 500); // Short delay to ensure toast is visible
    },
    onError: (error: Error) => {
      console.error("Memory creation failed:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      console.log("Memory creation request settled");
      setIsSubmitting(false);
    },
  });

  // Update memory mutation
  const updateMemoryMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      console.log("Making API request to update memory:", data);
      // Remove userId if it exists in the data
      // The server will use the authenticated user from the session
      const { userId, ...memoryData } = data as any;
      const res = await apiRequest("PUT", `/api/memories/${memoryId}`, memoryData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/memories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/memories", memoryId] });
      queryClient.invalidateQueries({ queryKey: ["/api/memories/public"] });
      toast({
        title: "Memory Updated",
        description: "Your memory has been updated successfully.",
      });
      setTimeout(() => {
        navigate("/memories");
      }, 500); // Short delay to ensure toast is visible
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    console.log("Form submitted with data:", data);
    
    // Check for form validation errors
    if (Object.keys(form.formState.errors).length > 0) {
      console.error("Form has validation errors:", form.formState.errors);
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      console.error("User is not authenticated");
      toast({
        title: "Error",
        description: "You must be logged in to save a memory",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    if (memoryId) {
      console.log("Updating memory with ID:", memoryId);
      updateMemoryMutation.mutate(data);
    } else {
      console.log("Creating new memory");
      // The server will get userId from the session
      createMemoryMutation.mutate(data as any);
    }
  };

  if ((memoryId && isMemoryLoading) || isCategoriesLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Give your memory a title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your memory..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter an image URL to illustrate your memory"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (optional)</FormLabel>
              <Select
                onValueChange={(value) => value === 'none' ? field.onChange(null) : field.onChange(Number(value))}
                value={field.value?.toString() || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Visibility</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="private" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Private - Only you can see this memory
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="public" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Public - Anyone can see this memory
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/memories")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {memoryId ? "Updating..." : "Saving..."}
              </>
            ) : memoryId ? (
              "Update Memory"
            ) : (
              "Save Memory"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MemoryForm;
