import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AddPlantModal from './AddPlantModal';

const Dashboard = ({ onLogout }) => {
    const { t } = useLanguage();

    const [plants, setPlants] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [plantToDelete, setPlantToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [carbonReduction, setCarbonReduction] = useState(0.00);

    const topSavers = [
        { name: 'Khaled Tarek', carbonSaved: 78.3, profilePhoto: '/khaled.jpg' },
        { name: 'Youssef Adel', carbonSaved: 42.5, profilePhoto: '/youssef.jpg' },
        { name: 'Mahmoud Attia', carbonSaved: 31.2, profilePhoto: '/mahmoud.png' },
    ];
    const defaultAvatar = '/default-avatar.png';

    const fetchCarbonStats = useCallback(async () => {
        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('user'));

        if (!token || !currentUser?.id) return;

        try {
            const statsResponse = await fetch(
                `http://localhost:8080/api/plants/user/${currentUser.id}/carbon-stats`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                setCarbonReduction(stats.carbonReduction || 0.00);
            }
        } catch (err) {
            console.error('Failed to fetch carbon stats:', err);
        }
    }, []);

    const fetchPlants = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('http://localhost:8080/api/plants/my-plants', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setPlants(data);
            }
        } catch (err) {
            console.error('Failed to fetch plants:', err);
        }
    }, []);

    useEffect(() => {
        fetchPlants();
        fetchCarbonStats();
    }, [fetchPlants, fetchCarbonStats]);

    const deletePlant = useCallback(async (id) => {
        setDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/plants/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                setPlants(prev => prev.filter(p => p.id !== id));
                fetchCarbonStats();
            } else {
                console.error('Failed to delete plant, status:', response.status);
            }
        } catch (err) {
            console.error('Failed to delete plant:', err);
        } finally {
            setDeleting(false);
            setPlantToDelete(null);
        }
    }, [fetchCarbonStats]);

    const atmosphereLevel = useMemo(() => {
        if (carbonReduction >= 50) return 'green';
        if (carbonReduction >= 20) return 'yellow';
        return 'red';
    }, [carbonReduction]);

    const atmosphereLabel = useMemo(() => {
        if (atmosphereLevel === 'green') return t('atmosphereGood') || 'Good';
        if (atmosphereLevel === 'yellow') return t('atmosphereModerate') || 'Moderate';
        return t('atmospherePoor') || 'Poor';
    }, [atmosphereLevel, t]);

    const atmosphereTextColor = {
        green: 'text-green-400',
        yellow: 'text-yellow-400',
        red: 'text-red-400',
    }[atmosphereLevel];

    return (
        <div className="min-h-screen bg-transparent">
            <div className="fixed inset-0 bg-gray-50/5 -z-10 pointer-events-none"></div>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-16 text-left">

                <div className="px-4 sm:px-0 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg text-white flex items-center justify-between transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:shadow-green-500/20 hover:shadow-2xl">
                        <div>
                            <h3 className="text-lg font-medium text-green-100">{t('carbonReduction')}</h3>
                            <p className="mt-2 text-3xl font-bold">{carbonReduction.toFixed(2)} kg CO<sub>2</sub></p>
                        </div>
                        <div className="p-3 bg-green-500/20 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg text-white flex items-center justify-between transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:shadow-2xl hover:shadow-white/10">
                        <div>
                            <h3 className="text-lg font-medium text-green-100">{t('homeAtmosphere')}</h3>
                            <p className={`mt-2 text-3xl font-bold ${atmosphereTextColor}`}>{atmosphereLabel}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2 bg-gray-950 rounded-xl px-3 py-3.5 border-2 border-gray-700 shadow-lg">
                            <div className={`w-7 h-7 rounded-full transition-all duration-300 ${atmosphereLevel === 'red' ? 'bg-red-500 shadow-[0_0_16px_5px_rgba(239,68,68,0.85)]' : 'bg-red-500/15'}`} />
                            <div className={`w-7 h-7 rounded-full transition-all duration-300 ${atmosphereLevel === 'yellow' ? 'bg-yellow-400 shadow-[0_0_16px_5px_rgba(250,204,21,0.85)]' : 'bg-yellow-400/15'}`} />
                            <div className={`w-7 h-7 rounded-full transition-all duration-300 ${atmosphereLevel === 'green' ? 'bg-green-500 shadow-[0_0_16px_5px_rgba(34,197,94,0.85)]' : 'bg-green-500/15'}`} />
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-0 mb-8">
                    <div className="text-center mb-10">
                        <span className="inline-block text-4xl mb-4">🏆</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                            {t('topSaversTitle')}
                        </h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            {t('topSaversSubtitle')}
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-end justify-center gap-6 max-w-4xl mx-auto">

                        <div className="order-2 md:order-1 w-full md:w-1/3 group">
                            <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:shadow-2xl hover:shadow-gray-400/10 hover:scale-105 text-center h-full">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-800 font-bold text-lg shadow-lg">
                                    2
                                </div>
                                <div className="mt-4 mb-3">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-300/20 flex items-center justify-center mb-3 overflow-hidden">
                                        <img src={topSavers[1].profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topSavers[1].name}`} alt={topSavers[1].name} className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-gray-200 transition-colors">{topSavers[1].name}</h3>
                                </div>
                                <div className="text-3xl font-extrabold text-gray-300 mb-1">{topSavers[1].carbonSaved}</div>
                                <div className="text-sm text-gray-500">{t('kgCO2Saved')}</div>
                            </div>
                        </div>

                        <div className="order-1 md:order-2 w-full md:w-1/3 group">
                            <div className="relative p-8 rounded-2xl bg-linear-to-b from-yellow-500/10 to-white/5 border border-yellow-500/30 backdrop-blur-sm transition-all duration-300 hover:from-yellow-500/20 hover:to-white/10 hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-105 text-center h-full">
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-xl shadow-lg shadow-yellow-500/40">
                                    1
                                </div>
                                <div className="mt-4 mb-3">
                                    <div className="w-14 h-14 mx-auto rounded-full bg-yellow-400/20 ring-2 ring-yellow-400/30 overflow-hidden mb-2 mt-2">
                                        <img src={topSavers[0].profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topSavers[0].name}`} alt={topSavers[0].name} className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-100 transition-colors">{topSavers[0].name}</h3>
                                </div>
                                <div className="text-4xl font-extrabold bg-linear-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent mb-1">{topSavers[0].carbonSaved}</div>
                                <div className="text-sm text-gray-400">{t('kgCO2Saved')}</div>
                            </div>
                        </div>

                        <div className="order-3 w-full md:w-1/3 group">
                            <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:shadow-2xl hover:shadow-orange-400/10 hover:scale-105 text-center h-full">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-orange-900 font-bold text-lg shadow-lg">
                                    3
                                </div>
                                <div className="mt-4 mb-3">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-orange-400/20 flex items-center justify-center mb-3 overflow-hidden">
                                        <img src={topSavers[2].profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topSavers[2].name}`} alt={topSavers[2].name} className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-orange-200 transition-colors">{topSavers[2].name}</h3>
                                </div>
                                <div className="text-3xl font-extrabold text-orange-300 mb-1">{topSavers[2].carbonSaved}</div>
                                <div className="text-sm text-gray-500">{t('kgCO2Saved')}</div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="px-4 py-6 sm:px-0 flex justify-between items-center text-white">
                    <div>
                        <h1 className="text-3xl font-bold">{t('myPlants')}</h1>
                        <p className="mt-1 text-sm text-green-100">{t('managePlants')}</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            {t('addPlant')}
                        </button>
                    </div>
                </div>

                <div className="px-4 sm:px-0 mt-6">
                    {plants.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                            {plants.map((plant) => (
                                <div key={plant.id} className="bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden shadow rounded-xl hover:shadow-lg transition-shadow duration-200 flex flex-col group">
                                    <div className="w-full h-44 bg-white/5 relative overflow-hidden flex-shrink-0">
                                        <img
                                            src={plant.photo || '/default-plant.png'}
                                            alt={plant.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                                    </div>
                                    <div className="px-5 py-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-lg font-semibold text-white truncate pr-2">
                                                {plant.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <div className="p-1.5 bg-green-500/20 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                    </svg>
                                                </div>
                                                <button
                                                    onClick={() => setPlantToDelete(plant)}
                                                    className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-full transition-colors duration-200 group/del"
                                                    title="Delete plant"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400 group-hover/del:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        {plant.plantType && (
                                            <p className="mt-1 text-sm text-green-300/80 font-medium">
                                                {(t('plantTypeNames') && typeof t('plantTypeNames') === 'object' && t('plantTypeNames')[plant.plantType.name]) || plant.plantType.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/5 backdrop-blur-md rounded-xl border-2 border-dashed border-white/20">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-white">{t('emptyStateTitle')}</h3>
                            <p className="mt-1 text-sm text-gray-300">{t('emptyStateSubtitle')}</p>
                        </div>
                    )}
                </div>
            </main>

            <AddPlantModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onPlantAdded={() => {
                    fetchPlants();
                    fetchCarbonStats();
                }}
            />

            {plantToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => !deleting && setPlantToDelete(null)}
                    />
                    <div className="relative bg-gray-900 border border-white/20 rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
                        <div className="mx-auto mb-4 w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Delete Plant</h3>
                        <p className="text-sm text-gray-400 mb-6">
                            Are you sure you want to delete <span className="text-white font-medium">{plantToDelete.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPlantToDelete(null)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors duration-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deletePlant(plantToDelete.id)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                ) : null}
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;