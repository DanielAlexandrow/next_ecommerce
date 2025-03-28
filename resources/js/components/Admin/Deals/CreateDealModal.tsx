import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import dealsApi from "@/api/dealsApi";
import { toast } from "react-hot-toast";
import { DatePicker } from "@/components/ui/date-picker";
import SearchableSelect from "@/components/ui/searchable-select";
import { useDealEntityOptions, EntityOption } from "@/hooks/useDealEntityOptions";
import { Label } from "@/components/ui/label";

interface SelectOption {
    label: string;
    value: number;
}

interface DealConditions {
    minimum_amount?: string;
    required_items?: number;
    [key: string]: any;
}

interface DealFormData {
    name: string;
    description: string;
    discount_amount: string;
    discount_type: 'percentage' | 'fixed';
    start_date: string;
    end_date: string;
    active: boolean;
    deal_type: 'product' | 'category' | 'brand' | 'cart';
    conditions: DealConditions;
    product_ids: SelectOption[];
    category_ids: SelectOption[];
    brand_ids: SelectOption[];
    subproduct_ids: SelectOption[];
}

interface CreateDealModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateDealModal = ({ open, onClose, onSuccess }: CreateDealModalProps) => {
    const { productOptions, categoryOptions, brandOptions, isLoading: optionsLoading } = useDealEntityOptions();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<DealFormData>({
        name: "",
        description: "",
        discount_amount: "",
        discount_type: "percentage",
        start_date: "",
        end_date: "",
        active: true,
        deal_type: "product",
        conditions: {},
        product_ids: [],
        category_ids: [],
        brand_ids: [],
        subproduct_ids: []
    });

    const handleSubmit = async () => {
        try {
            await dealsApi.createDeal({
                ...formData,
                discount_amount: Number(formData.discount_amount),
                conditions: {
                    ...formData.conditions,
                    minimum_amount: formData.conditions.minimum_amount ? Number(formData.conditions.minimum_amount) : undefined
                }
            });
            toast.success("Deal created successfully");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Failed to create deal");
        }
    };

    const handleInputChange = (field: string, value: any) => {
        // For SearchableSelect components, convert value array to option array
        if (field.endsWith('_ids')) {
            const options = Array.isArray(value) ? value.map(v => ({
                label: v.label,
                value: Number(v.value)
            })) : [];
            setFormData(prev => ({
                ...prev,
                [field]: options
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Transform option arrays back to number arrays for SearchableSelect
    const getOptionValues = (options: SelectOption[]) => {
        return options.map(opt => opt.value);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Deal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="deal-name">Name</Label>
                        <Input
                            id="deal-name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="Deal name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deal-description">Description</Label>
                        <Textarea
                            id="deal-description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Deal description"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <DatePicker
                                date={formData.start_date ? new Date(formData.start_date) : undefined}
                                onSelect={(date) => handleInputChange("start_date", date?.toISOString())}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <DatePicker
                                date={formData.end_date ? new Date(formData.end_date) : undefined}
                                onSelect={(date) => handleInputChange("end_date", date?.toISOString())}
                            />
                        </div>
                    </div>

                    {/* Deal type selection */}
                    <div className="space-y-2">
                        <Label htmlFor="deal-type">Deal Type</Label>
                        <Select
                            value={formData.deal_type}
                            onValueChange={(value) => handleInputChange("deal_type", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select deal type">
                                    {formData.deal_type.charAt(0).toUpperCase() + formData.deal_type.slice(1)}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="category">Category</SelectItem>
                                <SelectItem value="brand">Brand</SelectItem>
                                <SelectItem value="cart">Cart</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Entity selection based on deal type */}
                    {formData.deal_type === "product" && (
                        <div className="space-y-2">
                            <Label>Products</Label>
                            <SearchableSelect
                                isMulti
                                options={productOptions}
                                isLoading={optionsLoading}
                                value={getOptionValues(formData.product_ids)}
                                onChange={(value) => handleInputChange("product_ids", value)}
                                placeholder="Select products..."
                            />
                        </div>
                    )}
                    {formData.deal_type === "category" && (
                        <div className="space-y-2">
                            <Label>Categories</Label>
                            <SearchableSelect
                                isMulti
                                options={categoryOptions}
                                isLoading={optionsLoading}
                                value={getOptionValues(formData.category_ids)}
                                onChange={(value) => handleInputChange("category_ids", value)}
                                placeholder="Select categories..."
                            />
                        </div>
                    )}
                    {formData.deal_type === "brand" && (
                        <div className="space-y-2">
                            <Label>Brands</Label>
                            <SearchableSelect
                                isMulti
                                options={brandOptions}
                                isLoading={optionsLoading}
                                value={getOptionValues(formData.brand_ids)}
                                onChange={(value) => handleInputChange("brand_ids", value)}
                                placeholder="Select brands..."
                            />
                        </div>
                    )}
                    {formData.deal_type === "cart" && (
                        <div className="space-y-2">
                            <Label>Minimum Amount</Label>
                            <Input
                                type="number"
                                value={formData.conditions.minimum_amount}
                                onChange={(e) =>
                                    handleInputChange("conditions", {
                                        ...formData.conditions,
                                        minimum_amount: e.target.value,
                                    })
                                }
                                placeholder="Minimum cart amount"
                            />
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={formData.active}
                            onCheckedChange={(checked) =>
                                handleInputChange("active", checked)
                            }
                        />
                        <Label>Active</Label>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>Create Deal</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateDealModal;