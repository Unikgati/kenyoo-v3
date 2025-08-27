import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Location, LocationCategory } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ConfirmationModal';
import LocationForm from '../components/LocationForm';

const LocationsScreen: React.FC = () => {
    const navigate = useNavigate();
    const { locations, deleteLocation, sales } = useData();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [locationToDelete, setLocationToDelete] = useState<string | null>(null);

    const locationPerformance = useMemo(() => {
        const salesByLocation: Record<string, number> = {};
        sales.forEach(sale => {
            salesByLocation[sale.location] = (salesByLocation[sale.location] || 0) + 1;
        });

        const maxTransactions = Math.max(0, ...Object.values(salesByLocation));

        return locations.map(location => {
            const transactions = salesByLocation[location.name] || 0;
            const score = maxTransactions > 0 ? (transactions / maxTransactions) * 100 : 0;
            return {
                ...location,
                transactions,
                score,
            };
        }).sort((a, b) => b.transactions - a.transactions);
    }, [locations, sales]);

    const openFormModal = (location: Location | null) => {
        setEditingLocation(location);
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setIsFormModalOpen(false);
        setEditingLocation(null);
    };

    const handleDeleteClick = (locationId: string) => {
        setLocationToDelete(locationId);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setLocationToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const handleConfirmDelete = () => {
        if (locationToDelete) {
            deleteLocation(locationToDelete);
        }
        closeConfirmModal();
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Manage Locations</CardTitle>
                    <Button onClick={() => openFormModal(null)}>Add Location</Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-secondary">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Location Name</th>
                                    <th scope="col" className="px-6 py-3">Category</th>
                                    <th scope="col" className="px-6 py-3">Activity Score</th>
                                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locationPerformance.length > 0 ? (
                                    locationPerformance.map((location) => (
                                        <tr key={location.id} className="border-b border-border">
                                            <td className="px-6 py-4 font-medium">{location.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    location.category === LocationCategory.DAILY_ROTATION 
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                                                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                                }`}>
                                                    {location.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
                                                    <div className="w-full max-w-[200px] bg-secondary rounded-full h-2.5">
                                                        <div
                                                            className="bg-accent h-2.5 rounded-full"
                                                            style={{ width: `${location.score}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-medium text-foreground/80 sm:min-w-[70px]">{location.transactions} transactions</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigate(`/locations/${location.id}`)}
                                                        title="View Dashboard"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                            <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                                                            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openFormModal(location)}
                                                        title="Edit Location"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                                        </svg>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteClick(location.id)}
                                                        title="Delete Location"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                                        </svg>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-foreground/60">
                                            No locations found. Get started by adding a new location.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Modal isOpen={isFormModalOpen} onClose={closeFormModal} title={editingLocation ? 'Edit Location' : 'Add Location'}>
                <LocationForm location={editingLocation} onSave={closeFormModal} />
            </Modal>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={closeConfirmModal}
                onConfirm={handleConfirmDelete}
                title="Delete Location"
                message="Are you sure you want to delete this location? This action cannot be undone."
            />
        </>
    );
};

export default LocationsScreen;