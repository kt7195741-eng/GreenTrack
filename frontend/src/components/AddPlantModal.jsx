import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const AddPlantModal = ({ isOpen, onClose, onPlantAdded }) => {
    const { t, language } = useLanguage();
    const backdropRef = useRef(null);
    const comboRef = useRef(null);
    const inputRef = useRef(null);

    const [plantName, setPlantName] = useState('');
    const [species, setSpecies] = useState('');
    const [wateringFrequency, setWateringFrequency] = useState('');
    const [plantPhoto, setPlantPhoto] = useState(null);
    const fileInputRef = useRef(null);
    const [plantTypes, setPlantTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Combobox state
    const [typeQuery, setTypeQuery] = useState('');
    const [selectedType, setSelectedType] = useState(null); // { id, name } or null
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Fetch plant types when the modal opens
    useEffect(() => {
        if (!isOpen) return;

        const fetchPlantTypes = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('https://greentrack-i2d7.onrender.com/api/plant-types', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Failed to load plant types (${response.status}): ${text}`);
                }
                const data = await response.json();
                setPlantTypes(data);
            } catch (err) {
                setError(err.message || 'Could not load plant types.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlantTypes();
        // Reset form fields every time the modal opens
        setPlantName('');
        setSpecies('');
        setWateringFrequency('');
        setPlantPhoto(null);
        setTypeQuery('');
        setSelectedType(null);
        setIsDropdownOpen(false);
    }, [isOpen]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (comboRef.current && !comboRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Translate a plant type name using the dictionary map
    const tPlantType = (name) => {
        const map = t('plantTypeNames');
        if (map && typeof map === 'object' && map[name]) return map[name];
        return name;
    };

    // Filtered options (sorted A→Z by translated name)
    const filtered = plantTypes
        .filter((pt) => pt.name.toLowerCase().includes(typeQuery.toLowerCase()))
        .sort((a, b) => tPlantType(a.name).localeCompare(tPlantType(b.name)));
    const exactMatch = plantTypes.some(
        (pt) => pt.name.toLowerCase() === typeQuery.trim().toLowerCase()
    );
    const showAddNew = typeQuery.trim().length > 0 && !exactMatch;

    // Total items in the dropdown list (filtered + possibly "add new")
    const totalItems = filtered.length + (showAddNew ? 1 : 0);

    const selectExisting = (pt) => {
        setSelectedType(pt);
        setTypeQuery(tPlantType(pt.name));
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
    };

    const selectCustom = () => {
        setSelectedType({ id: null, name: typeQuery.trim() });
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError(t('photoTooLarge') || 'Photo must be under 2 MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPlantPhoto(reader.result);
                setError(''); // clear error if successful
            };
            reader.readAsDataURL(file);
        }
    };

    const handleKeyDown = (e) => {
        if (!isDropdownOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsDropdownOpen(true);
                e.preventDefault();
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
                selectExisting(filtered[highlightedIndex]);
            } else if (showAddNew && highlightedIndex === filtered.length) {
                selectCustom();
            } else if (showAddNew) {
                selectCustom();
            }
        } else if (e.key === 'Escape') {
            setIsDropdownOpen(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedType) {
            setError(t('selectPlantType'));
            return;
        }

        setSaving(true);
        setError('');

        try {
            let plantTypeId = selectedType.id;
            const token = localStorage.getItem('token');

            // If custom type, create it on the backend first
            if (plantTypeId === null) {
                const createRes = await fetch('https://greentrack-i2d7.onrender.com/api/plant-types', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ name: selectedType.name }),
                });
                if (!createRes.ok) {
                    const msg = await createRes.text();
                    throw new Error(msg || 'Failed to create custom plant type');
                }
                const newType = await createRes.json();
                plantTypeId = newType.id;
            }

            const currentUser = JSON.parse(localStorage.getItem('user'));

            // Send the request to save the plant
            const response = await fetch('https://greentrack-i2d7.onrender.com/api/plants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    name: plantName,
                    species: species.trim() || null,
                    wateringFrequency: wateringFrequency ? String(wateringFrequency) : null,
                    plantType: { id: Number(plantTypeId) }, // <-- FIXED: Spring Boot requires this nested object format!
                    photo: plantPhoto,
                    user: { id: currentUser?.id },
                    status: 'ACTIVE',
                }),
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg || 'Failed to save plant');
            }

            onPlantAdded(); // This triggers Dashboard.jsx to refresh the list!
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === backdropRef.current) onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
        >
            <div className="relative w-full max-w-md mx-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-white animate-[fadeInUp_0.25s_ease-out]">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold">{t('addPlantTitle')}</h2>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 w-full bg-linear-to-r from-red-600 via-red-500 to-red-900 text-white text-sm font-semibold text-center px-4 py-3 rounded-lg shadow-lg shadow-red-900/30">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Plant Photo Upload */}
                    <div className="flex flex-col items-center mb-4">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-dashed border-gray-500 hover:border-green-400 transition-colors group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg bg-white/5"
                            >
                                {plantPhoto ? (
                                    <img src={plantPhoto} alt="Plant Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-green-400 transition-colors p-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-1 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{t('uploadPhoto')}</span>
                                </div>
                            </button>

                            {/* Remove Photo Button */}
                            {plantPhoto && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPlantPhoto(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-transform hover:scale-110 z-10"
                                    title="Remove photo"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                        />
                    </div>

                    {/* Plant Name */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">{t('plantName')}</label>
                        <input
                            type="text"
                            required
                            value={plantName}
                            onChange={(e) => setPlantName(e.target.value)}
                            placeholder={t('plantNamePlaceholder')}
                            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-gray-600 focus:border-green-400 focus:outline-none text-white transition-colors placeholder-gray-500"
                        />
                    </div>

                    {/* Species */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">{t('species', 'Species (Optional)')}</label>
                        <input
                            type="text"
                            value={species}
                            onChange={(e) => setSpecies(e.target.value)}
                            placeholder="e.g. Ficus elastica"
                            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-gray-600 focus:border-green-400 focus:outline-none text-white transition-colors placeholder-gray-500"
                        />
                    </div>

                    {/* Watering Frequency */}
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">{t('wateringFrequency', 'Watering Frequency (in days)')}</label>
                        <input
                            type="number"
                            min="1"
                            value={wateringFrequency}
                            onChange={(e) => setWateringFrequency(e.target.value)}
                            placeholder="e.g. 7"
                            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-gray-600 focus:border-green-400 focus:outline-none text-white transition-colors placeholder-gray-500"
                        />
                    </div>

                    {/* Plant Type — searchable combobox */}
                    <div ref={comboRef} className="relative">
                        <label className="block text-sm text-gray-300 mb-1">{t('plantType')}</label>
                        {loading ? (
                            <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                                <svg className="animate-spin h-4 w-4 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Loading…
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={typeQuery}
                                        onChange={(e) => {
                                            setTypeQuery(e.target.value);
                                            setSelectedType(null);
                                            setIsDropdownOpen(true);
                                            setHighlightedIndex(-1);
                                        }}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={t('typeOrSelectPlantType')}
                                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-gray-600 focus:border-green-400 focus:outline-none text-white transition-colors placeholder-gray-500 pr-10"
                                    />
                                    {/* Dropdown chevron */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsDropdownOpen(!isDropdownOpen);
                                            inputRef.current?.focus();
                                        }}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                                        tabIndex={-1}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Dropdown list */}
                                {isDropdownOpen && (
                                    <div className="absolute z-60 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg bg-gray-900/95 backdrop-blur-md border border-white/15 shadow-xl">
                                        {filtered.length === 0 && !showAddNew && (
                                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                {t('noTypesFound')}
                                            </div>
                                        )}

                                        {filtered.map((pt, idx) => (
                                            <button
                                                key={pt.id}
                                                type="button"
                                                onClick={() => selectExisting(pt)}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${highlightedIndex === idx
                                                    ? 'bg-green-500/20 text-white'
                                                    : 'text-gray-200 hover:bg-white/10'
                                                    } ${selectedType?.id === pt.id ? 'text-green-400 font-medium' : ''}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500/60 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                </svg>
                                                {tPlantType(pt.name)}
                                            </button>
                                        ))}

                                        {showAddNew && (
                                            <>
                                                {filtered.length > 0 && (
                                                    <div className="border-t border-white/10" />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={selectCustom}
                                                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${highlightedIndex === filtered.length
                                                        ? 'bg-green-500/20 text-white'
                                                        : 'text-green-300 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    {t('addCustomType')} "<span className="font-semibold">{typeQuery.trim()}</span>"
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg border border-gray-500 text-gray-300 hover:bg-white/10 transition-colors text-sm font-medium"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={saving || loading}
                            className="px-5 py-2.5 rounded-lg bg-linear-to-r from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium shadow-lg shadow-green-900/40 transition-all"
                        >
                            {saving ? t('saving') : t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPlantModal;