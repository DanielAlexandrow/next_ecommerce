import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Deal } from "@/types";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface DealCardProps {
    deal: Deal;
    onEdit: (deal: Deal) => void;
    onDelete: (dealId: number) => void;
}

export function DealCard({ deal, onEdit, onDelete }: DealCardProps) {
    const isActive = deal.active && new Date(deal.end_date) > new Date();
    const isPast = new Date(deal.end_date) < new Date();
    const isFuture = new Date(deal.start_date) > new Date();
    
    // Format discount for display
    const formatDiscount = () => {
        if (deal.discount_type === 'percentage') {
            return `${deal.discount_amount}%`;
        } else {
            return `$${deal.discount_amount.toFixed(2)}`;
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{deal.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                            <Badge 
                                variant={isActive ? "default" : isPast ? "outline" : "secondary"}
                            >
                                {isActive ? "Active" : isPast ? "Expired" : "Upcoming"}
                            </Badge>
                            <Badge variant="outline">
                                {deal.deal_type.charAt(0).toUpperCase() + deal.deal_type.slice(1)} Deal
                            </Badge>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(deal)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Deal
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => onDelete(deal.id)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Deal
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground mb-2">
                    {deal.description || "No description provided"}
                </p>
                <div className="flex gap-2 items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(deal.start_date)} - {formatDate(deal.end_date)}</span>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 pt-2 pb-2">
                <div className="flex justify-between items-center w-full">
                    <span className="text-sm font-medium">Discount: {formatDiscount()}</span>
                    {deal.deal_type === 'product' && (
                        <span className="text-xs text-muted-foreground">{deal.products?.length || 0} products</span>
                    )}
                    {deal.deal_type === 'category' && (
                        <span className="text-xs text-muted-foreground">{deal.categories?.length || 0} categories</span>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}