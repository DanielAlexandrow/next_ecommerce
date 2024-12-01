import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import MapboxGL from 'mapbox-gl';

const coordinateSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional(),
});

type CoordinateFormData = z.infer<typeof coordinateSchema>;

const CoordinateForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<CoordinateFormData>({
        resolver: zodResolver(coordinateSchema),
    });

    const [map, setMap] = useState<MapboxGL.Map | null>(null);
    const [marker, setMarker] = useState<MapboxGL.Marker | null>(null);
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number }>({ latitude: 0, longitude: 0 });

    React.useEffect(() => {
        MapboxGL.accessToken = 'YOUR_MAPBOX_API_KEY'; // Replace with your actual Mapbox API key

        const initializeMap = () => {
            const mapInstance = new MapboxGL.Map({
                container: 'map', // container ID
                style: 'mapbox://styles/mapbox/streets-v11', // style URL
                center: [0, 0], // starting position [lng, lat]
                zoom: 2, // starting zoom
            });

            mapInstance.on('click', (e) => {
                const { lng, lat } = e.lngLat;
                setCoordinates({ latitude: lat, longitude: lng });
                if (marker) {
                    marker.setLngLat([lng, lat]);
                } else {
                    const newMarker = new MapboxGL.Marker()
                        .setLngLat([lng, lat])
                        .addTo(mapInstance);
                    setMarker(newMarker);
                }
            });

            setMap(mapInstance);
        };

        initializeMap();

        return () => {
            if (map) map.remove();
        };
    }, []);

    const onSubmit = async (data: CoordinateFormData) => {
        try {
            const response = await axios.post('/api/coordinates', {
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                address: data.address,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Adjust token retrieval as needed
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.success) {
                alert('Coordinates saved successfully');
            } else {
                alert(`Error: ${response.data.message}`);
            }
        } catch (error: any) {
            console.error(error);
            alert('Failed to save coordinates');
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-xl mb-4">Save Your Coordinates</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
                <div className="mb-4">
                    <Input
                        type="text"
                        placeholder="Address"
                        {...register('address')}
                    />
                    {errors.address && <p className="text-red-500">{errors.address.message}</p>}
                </div>
                <div className="mb-4">
                    <div id="map" style={{ width: '100%', height: '400px' }}></div>
                </div>
                <div className="mb-4">
                    <Input
                        type="number"
                        placeholder="Latitude"
                        value={coordinates.latitude}
                        readOnly
                        {...register('latitude', { valueAsNumber: true })}
                    />
                    {errors.latitude && <p className="text-red-500">{errors.latitude.message}</p>}
                </div>
                <div className="mb-4">
                    <Input
                        type="number"
                        placeholder="Longitude"
                        value={coordinates.longitude}
                        readOnly
                        {...register('longitude', { valueAsNumber: true })}
                    />
                    {errors.longitude && <p className="text-red-500">{errors.longitude.message}</p>}
                </div>
                <Button type="submit">Save Coordinates</Button>
            </form>
        </div>
    );
};

export default CoordinateForm; 