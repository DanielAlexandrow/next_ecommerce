import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import mapboxgl from 'mapbox-gl';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Define Zod validation schema
const coordinateSchema = z.object({
    address: z.string().nonempty('Address is required'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

type CoordinateForm = z.infer<typeof coordinateSchema>;

const DriverCoordinatesPage = () => {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<CoordinateForm>({
        resolver: zodResolver(coordinateSchema),
    });

    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);

    useEffect(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

        const initializeMap = () => {
            const mapInstance = new mapboxgl.Map({
                container: 'map', // container ID
                style: 'mapbox://styles/mapbox/streets-v11', // style URL
                center: [0, 0], // starting position [lng, lat]
                zoom: 2, // starting zoom
            });

            mapInstance.on('click', (e) => {
                const { lng, lat } = e.lngLat;

                if (marker) {
                    marker.setLngLat([lng, lat]);
                } else {
                    const newMarker = new mapboxgl.Marker()
                        .setLngLat([lng, lat])
                        .addTo(mapInstance);
                    setMarker(newMarker);
                }

                setValue('latitude', lat);
                setValue('longitude', lng);
            });

            setMap(mapInstance);
        };

        if (!map) initializeMap();

        // Cleanup on unmount
        return () => map?.remove();
    }, [map, marker, setValue]);

    useEffect(() => {
        // Load existing coordinates when component mounts
        const loadExistingCoordinates = async () => {
            try {
                const response = await axios.get('/driver/coordinates/current');
                if (response.data) {
                    setValue('latitude', response.data.latitude);
                    setValue('longitude', response.data.longitude);

                    if (map) {
                        const newMarker = new mapboxgl.Marker()
                            .setLngLat([response.data.longitude, response.data.latitude])
                            .addTo(map);
                        setMarker(newMarker);
                        map.flyTo({
                            center: [response.data.longitude, response.data.latitude],
                            zoom: 14
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to load coordinates');
            }
        };

        loadExistingCoordinates();
    }, [map]);

    const onSubmit = async (data: CoordinateForm) => {
        if (!data.latitude || !data.longitude) {
            toast.error('Please select a location on the map.');
            return;
        }

        try {
            const response = await axios.post('/driver/coordinates', {
                latitude: data.latitude,
                longitude: data.longitude,
            });

            toast.success(response.data.message);
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.errors) {
                Object.values(error.response.data.errors).forEach((err: any) => {
                    toast.error(err[0]);
                });
            } else {
                toast.error('An unexpected error occurred.');
            }
        }
    };

    // Address to Coordinates using Mapbox Geocoding API
    const handleAddressSelect = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const address = e.currentTarget.address.value;

        try {
            const response = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(address) + '.json', {
                params: {
                    access_token: import.meta.env.VITE_MAPBOX_API_KEY,
                    limit: 1,
                },
            });

            if (response.data.features.length === 0) {
                toast.error('Address not found.');
                return;
            }

            const [lng, lat] = response.data.features[0].center;

            if (map && marker) {
                marker.setLngLat([lng, lat]);
                map.flyTo({ center: [lng, lat], zoom: 14 });
            } else if (map) {
                const newMarker = new mapboxgl.Marker()
                    .setLngLat([lng, lat])
                    .addTo(map);
                setMarker(newMarker);
                map.flyTo({ center: [lng, lat], zoom: 14 });
            }

            setValue('latitude', lat);
            setValue('longitude', lng);
        } catch (error) {
            toast.error('Failed to fetch coordinates for the address.');
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Save Your Coordinates</h1>

            <form onSubmit={handleAddressSelect} className="mb-4 flex space-x-2">
                <Input
                    type="text"
                    placeholder="Enter your address"
                    {...register('address')}
                />
                <Button type="submit">Find Location</Button>
            </form>
            {errors.address && <p className="text-red-500">{errors.address.message}</p>}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div id="map" className="w-full h-64 mb-4"></div>
                <div className="flex space-x-2">
                    <Input
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        {...register('latitude', { valueAsNumber: true })}
                        readOnly
                    />
                    <Input
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        {...register('longitude', { valueAsNumber: true })}
                        readOnly
                    />
                </div>
                {errors.latitude && <p className="text-red-500">{errors.latitude.message}</p>}
                {errors.longitude && <p className="text-red-500">{errors.longitude.message}</p>}
                <Button type="submit" className="mt-4">Save Coordinates</Button>
            </form>
        </div>
    );
};

export default DriverCoordinatesPage;