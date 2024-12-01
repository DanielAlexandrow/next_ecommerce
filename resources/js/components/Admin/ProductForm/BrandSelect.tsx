import * as React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Brand } from "@/types";

export function BrandSelect({ productBrand, setProductBrand }) {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");
	const [allBrands, setAllBrands] = useState<Brand[]>([]);

	useEffect(() => {
		axios.get('/brands/getallbrands').then((response) => {
			setAllBrands(response.data);
		});
	}, []);

	useEffect(() => {
		if (productBrand) {
			setValue(productBrand.name);
		}
	}, [productBrand]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between"
				>
					{value
						? allBrands.find((brand) => brand.name === value)?.name
						: "Select brand..."}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder="Search brand..." />
					<CommandList>
						<CommandEmpty>No brand found.</CommandEmpty>
						<CommandGroup>
							{allBrands.map((brand) => (
								<CommandItem
									key={brand.id}
									value={brand.name}
									onSelect={(currentValue) => {
										setProductBrand(brand);
										setValue(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === brand.name ? "opacity-100" : "opacity-0"
										)}
									/>
									{brand.name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

export default BrandSelect;
