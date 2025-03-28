import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import dealsApi from "@/api/dealsApi";
import { Deal } from "@/types";
import { DealCard } from "@/components/Admin/Deals/DealCard";
import { Button } from "@/components/ui/button";
import CreateDealModal from "@/components/Admin/Deals/CreateDealModal";
import { AdminLayout } from "@/layouts/app-layout";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PlusCircle, Search, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Deals() {
  const [filters, setFilters] = useState({
    search: "",
    type: "all", // Changed from empty string to default value "all"
    active: "all", // Changed from empty string to default value "all"
    sortBy: "start_date",
    sortOrder: "desc",
  });

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);

  // Query deals data
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["deals", filters],
    queryFn: () => dealsApi.getDeals(filters),
  });

  // Handle editing a deal
  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
  };

  // Handle confirming deletion of a deal
  const handleDeleteDeal = async () => {
    if (!deletingDeal) return;

    try {
      await dealsApi.deleteDeal(deletingDeal.id);
      setDeletingDeal(null);
      refetch();
    } catch (error) {
      console.error("Failed to delete deal:", error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ErrorBoundary>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Deals & Promotions</h1>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create Deal
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter and search through all your deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search deals..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              <Select 
                value={filters.type} 
                onValueChange={(value) => handleFilterChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Deal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                  <SelectItem value="cart">Cart</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.active} 
                onValueChange={(value) => handleFilterChange("active", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="future">Future</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={`${filters.sortBy}-${filters.sortOrder}`} 
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split("-");
                  handleFilterChange("sortBy", sortBy);
                  handleFilterChange("sortOrder", sortOrder);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start_date-desc">Start Date (Newest)</SelectItem>
                  <SelectItem value="start_date-asc">Start Date (Oldest)</SelectItem>
                  <SelectItem value="end_date-desc">End Date (Newest)</SelectItem>
                  <SelectItem value="end_date-asc">End Date (Oldest)</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="discount_amount-desc">Discount (High-Low)</SelectItem>
                  <SelectItem value="discount_amount-asc">Discount (Low-High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="grid" className="mb-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="grid" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Grid
              </TabsTrigger>
              <TabsTrigger value="table" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Table
              </TabsTrigger>
            </TabsList>
            
            <div className="text-sm text-muted-foreground">
              {data?.total ? `${data?.total} deals found` : "No deals found"}
            </div>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading deals...</span>
              </div>
            ) : isError ? (
              <div className="text-center text-destructive p-4">
                There was an error loading deals.
              </div>
            ) : (
              <>
                <TabsContent value="grid" className="mt-0">
                  {data && data.deals && data.deals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.deals.map((deal: Deal) => (
                        <DealCard 
                          key={deal.id} 
                          deal={deal} 
                          onEdit={handleEditDeal}
                          onDelete={(id) => setDeletingDeal(data.deals.find(d => d.id === id) || null)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-10 border rounded-lg bg-muted/40">
                      <p className="text-lg font-medium">No deals found</p>
                      <p className="text-muted-foreground">Try adjusting your filters or create a new deal</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="table" className="mt-0">
                  <div className="rounded-md border">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="h-10 px-4 text-left font-medium">Name</th>
                          <th className="h-10 px-4 text-left font-medium">Type</th>
                          <th className="h-10 px-4 text-left font-medium">Discount</th>
                          <th className="h-10 px-4 text-left font-medium">Start Date</th>
                          <th className="h-10 px-4 text-left font-medium">End Date</th>
                          <th className="h-10 px-4 text-left font-medium">Status</th>
                          <th className="h-10 px-4 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data && data.deals && data.deals.length > 0 ? (
                          data.deals.map((deal: Deal) => {
                            const isActive = deal.active && new Date(deal.end_date) > new Date();
                            const isPast = new Date(deal.end_date) < new Date();
                            const isFuture = new Date(deal.start_date) > new Date();
                            
                            return (
                              <tr key={deal.id} className="border-b">
                                <td className="p-2 px-4 align-middle">{deal.name}</td>
                                <td className="p-2 px-4 align-middle capitalize">{deal.deal_type}</td>
                                <td className="p-2 px-4 align-middle">
                                  {deal.discount_type === 'percentage' 
                                    ? `${deal.discount_amount}%` 
                                    : `$${deal.discount_amount.toFixed(2)}`}
                                </td>
                                <td className="p-2 px-4 align-middle">{new Date(deal.start_date).toLocaleDateString()}</td>
                                <td className="p-2 px-4 align-middle">{new Date(deal.end_date).toLocaleDateString()}</td>
                                <td className="p-2 px-4 align-middle">
                                  <span className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium",
                                    isActive && "bg-green-100 text-green-800",
                                    isPast && "bg-gray-100 text-gray-800",
                                    isFuture && "bg-blue-100 text-blue-800"
                                  )}>
                                    {isActive ? "Active" : isPast ? "Expired" : "Upcoming"}
                                  </span>
                                </td>
                                <td className="p-2 px-4 align-middle">
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleEditDeal(deal)}
                                    >
                                      Edit
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => setDeletingDeal(deal)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="h-24 text-center">
                              No deals found. Adjust your filters or create a new deal.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>

        {/* Pagination */}
        {data && data.pagination && data.pagination.last_page > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (data.pagination.current_page > 1) {
                      setFilters(prev => ({...prev, page: prev.page ? prev.page - 1 : 1}));
                    }
                  }}
                  className={data.pagination.current_page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({length: data.pagination.last_page}, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setFilters(prev => ({...prev, page}));
                    }}
                    isActive={page === data.pagination.current_page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (data.pagination.current_page < data.pagination.last_page) {
                      setFilters(prev => ({...prev, page: (prev.page || 1) + 1}));
                    }
                  }}
                  className={data.pagination.current_page === data.pagination.last_page ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
      
      {/* Create Deal Modal */}
      {isCreateModalOpen && (
        <CreateDealModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
        />
      )}

      {/* Edit Deal Modal (assume we have an EditDealModal component) */}
      {editingDeal && (
        <CreateDealModal
          isOpen={!!editingDeal}
          onClose={() => setEditingDeal(null)}
          onSuccess={() => {
            setEditingDeal(null);
            refetch();
          }}
          deal={editingDeal}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingDeal} onOpenChange={(open) => !open && setDeletingDeal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the deal "{deletingDeal?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDeal}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ErrorBoundary>
  );
}

// Add AdminLayout wrapper
Deals.layout = (page: any) => <AdminLayout children={page} />;