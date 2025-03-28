import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import dealsApi from "@/api/dealsApi";
import { toast } from "react-hot-toast";
import { DatePicker } from "@/components/ui/date-picker";
import SearchableSelect from "@/components/ui/searchable-select";
import { Deal } from "@/types";
import { useDealEntityOptions, EntityOption } from "@/hooks/useDealEntityOptions";

interface EditDealModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    deal: Deal;
}

const EditDealModal = ({ open, onClose, onSuccess, deal }: EditDealModalProps) => {
    const { productOptions, categoryOptions, brandOptions, isLoading: optionsLoading } = useDealEntityOptions();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: deal.name,
        description: deal.description || "",
        discount_amount: deal.discount_amount.toString(),
        discount_type: deal.discount_type,
        start_date: deal.start_date,
        end_date: deal.end_date,
        active: deal.active,
        deal_type: deal.deal_type,
        conditions: deal.conditions || {},
        product_ids: deal.products?.map(p => p.id) || [],
        category_ids: deal.categories?.map(c => c.id) || [],
        brand_ids: deal.brands?.map(b => b.id) || [],
        subproduct_ids: deal.subproducts?.map(s => s.id) || []
    });

    useEffect(() => {
        setFormData({
            name: deal.name,
            description: deal.description || "",
            discount_amount: deal.discount_amount.toString(),
            discount_type: deal.discount_type,
            start_date: deal.start_date,
            end_date: deal.end_date,
            active: deal.active,
            deal_type: deal.deal_type,
            conditions: deal.conditions || {},
            product_ids: deal.products?.map(p => p.id) || [],
            category_ids: deal.categories?.map(c => c.id) || [],
            brand_ids: deal.brands?.map(b => b.id) || [],
            subproduct_ids: deal.subproducts?.map(s => s.id) || []
        });
    }, [deal]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        try {
            // Convert discount_amount to number before sending to API
            const apiData = {
                ...formData,
                discount_amount: parseFloat(formData.discount_amount)
            };
            await dealsApi.updateDeal(deal.id, apiData);
            toast.success('Deal updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update deal');
            console.error('Update deal error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Deal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label>Name</label>
                        <Input
                            required
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="Deal name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label>Description</label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Deal description"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label>Discount Type</label>
                            <Select
                                value={formData.discount_type}
                                onValueChange={(value) => handleInputChange("discount_type", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label>Discount Amount</label>
                            <Input
                                required
                                type="number"
                                min="0"
                                step={formData.discount_type === "percentage" ? "1" : "0.01"}
                                value={formData.discount_amount}
                                onChange={(e) => handleInputChange("discount_amount", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label>Start Date</label>
                            <DatePicker
                                date={formData.start_date ? new Date(formData.start_date) : undefined}
                                onSelect={(date) => handleInputChange("start_date", date?.toISOString())}
                            />
                        </div>

                        <div className="space-y-2">
                            <label>End Date</label>
                            <DatePicker
                                date={formData.end_date ? new Date(formData.end_date) : undefined}
                                onSelect={(date) => handleInputChange("end_date", date?.toISOString())}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label>Deal Type</label>
                        <Select
                            value={formData.deal_type}
                            onValueChange={(value) => handleInputChange("deal_type", value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="category">Category</SelectItem>
                                <SelectItem value="brand">Brand</SelectItem>
                                <SelectItem value="cart">Cart</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.deal_type === "product" && (
                        <div className="space-y-2">
                            <label>Products</label>
                            <SearchableSelect
                                isMulti
                                options={productOptions}
                                isLoading={optionsLoading}
                                value={formData.product_ids}
                                onChange={(value) => handleInputChange("product_ids", value)}
                                placeholder="Select products..."
                            />
                        </div>
                    )}

                    {formData.deal_type === "category" && (
                        <div className="space-y-2">
                            <label>Categories</label>
                            <SearchableSelect
                                isMulti
                                options={categoryOptions}
                                isLoading={optionsLoading}
                                value={formData.category_ids}
                                onChange={(value) => handleInputChange("category_ids", value)}
                                placeholder="Select categories..."
                            />
                        </div>
                    )}

                    {formData.deal_type === "brand" && (
                        <div className="space-y-2">
                            <label>Brands</label>
                            <SearchableSelect
                                isMulti
                                options={brandOptions}
                                isLoading={optionsLoading}
                                value={formData.brand_ids}
                                onChange={(value) => handleInputChange("brand_ids", value)}
                                placeholder="Select brands..."
                            />
                        </div>
                    )}

                    {formData.deal_type === "cart" && (
                        <div className="space-y-2">
                            <label>Minimum Purchase Amount</label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.conditions.minimum_amount || ""}
                                onChange={(e) => handleInputChange("conditions", {
                                    ...formData.conditions,
                                    minimum_amount: e.target.value
                                })}
                                placeholder="Enter minimum amount..."
                            />
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={formData.active}
                            onCheckedChange={(checked) => handleInputChange("active", checked)}
                        />
                        <label>Active</label>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={onClose} type="button">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditDealModal;