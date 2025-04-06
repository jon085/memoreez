import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Memory, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Search } from "lucide-react";
import MemoryCard from "@/components/memories/memory-card";

const MemoriesPage = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [activeTab, setActiveTab] = useState("personal");

  // Fetch user's memories
  const {
    data: userMemories,
    isLoading: isLoadingUserMemories,
  } = useQuery<Memory[]>({
    queryKey: ["/api/memories"],
    enabled: !!user,
  });

  // Fetch public memories
  const {
    data: publicMemories,
    isLoading: isLoadingPublicMemories,
  } = useQuery<Memory[]>({
    queryKey: ["/api/memories/public"],
  });

  // Fetch categories for filtering
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: !!user,
  });

  // Filter memories based on search term and selected category
  const filterMemories = (memories: Memory[] | undefined) => {
    if (!memories) return [];
    
    return memories.filter((memory) => {
      const matchesSearch = searchTerm === "" || 
        memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memory.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "" || 
        memory.categoryId?.toString() === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  const filteredUserMemories = filterMemories(userMemories);
  const filteredPublicMemories = filterMemories(publicMemories);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Memories</h1>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === "personal" 
                ? "Explore and manage your personal memories" 
                : "Discover memories shared by the community"}
            </p>
          </div>
          {user && (
            <div className="mt-4 md:mt-0">
              <Button onClick={() => navigate("/memories/add")}>
                <Plus className="h-5 w-5 mr-2" />
                Add New Memory
              </Button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="personal">My Memories</TabsTrigger>
              <TabsTrigger value="public">Public Memories</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <TabsContent value="personal" className="mt-0">
          {isLoadingUserMemories ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !user ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to view your memories</h3>
              <p className="text-gray-500 mb-4">
                You need to sign in to access your personal memories.
              </p>
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            </div>
          ) : filteredUserMemories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No memories found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory
                  ? "No memories match your current filters. Try adjusting your search criteria."
                  : "You haven't created any memories yet. Start capturing your special moments now!"}
              </p>
              <Link href="/memories/add">
                <Button>Create Your First Memory</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUserMemories.map((memory) => (
                <Link key={memory.id} href={`/memories/${memory.id}`}>
                  <a className="cursor-pointer h-full">
                    <MemoryCard memory={memory} />
                  </a>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public" className="mt-0">
          {isLoadingPublicMemories ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPublicMemories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No public memories found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory
                  ? "No public memories match your current filters. Try adjusting your search criteria."
                  : "There are no public memories to display yet. Be the first to share a memory!"}
              </p>
              {user && (
                <Link href="/memories/add">
                  <Button>Share a Memory</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublicMemories.map((memory) => (
                <Link key={memory.id} href={`/memories/${memory.id}`}>
                  <a className="cursor-pointer h-full">
                    <MemoryCard memory={memory} />
                  </a>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </div>
    </div>
  );
};

export default MemoriesPage;
