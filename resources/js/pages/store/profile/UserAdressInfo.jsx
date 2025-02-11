import AddressInfo from "@/components/Store/AdressInfos/AdressInfos";
import { StoreLayout } from "@/layouts/store-layout";
import { addressSchema } from "@/lib/adressInfosSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePage } from "@inertiajs/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import ProfileTabs from "./ProfileTabs";
import axios from "axios";
import { toast } from "react-toastify";
import { handleFormError } from "@/lib/utils";
import { profileApi } from "@/api/profileApi";


export default function UserAdressInfo() {
	const pageProps: any = usePage().props;
	const [address, setAddress] = useState(pageProps.address);
	console.log(address);

	const defaultValues = {
		name: address?.name,
		email: address?.email,
		postcode: address?.postcode,
		city: address?.city,
		country: address?.country,
		street: address?.street,
	};

	const form = useForm({
		resolver: zodResolver(addressSchema),
		defaultValues,
	});

	const handleSubmit = async (data: any) => {
		try {
			const message = await profileApi.updateAddress(data);
			toast.success(message);
		} catch (error) {
			handleFormError(error, form);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<ProfileTabs selected="AdressInfo" />
			<div className="max-w-2xl mx-auto mt-8">
				<div className="bg-card rounded-lg shadow-sm p-6">
					<AddressInfo onSubmit={handleSubmit} form={form} checkOut={false} />
				</div>
			</div>
		</div>
	);
}

UserAdressInfo.layout = (page: any) => <StoreLayout children={page} />;
