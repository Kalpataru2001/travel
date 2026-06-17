// src/components/PackingList.tsx
import { useEffect, useState } from 'react';
import { generateDefaultPackingList } from '../utils/packing';
import type { FullTripItinerary, PackingItem } from '../types/travel';

interface PackingListProps {
  tripData: FullTripItinerary;
  onUpdateTripData: (updated: FullTripItinerary) => void;
  currentTemp?: number;
  currentCondition?: string;
}

export default function PackingList({
  tripData,
  onUpdateTripData,
  currentTemp,
  currentCondition,
}: PackingListProps) {
  const [newInputs, setNewInputs] = useState<Record<string, string>>({
    Essentials: '',
    Clothing: '',
    Toiletries: '',
    Gear: '',
  });

  // Automatically initialize packing list if not present
  useEffect(() => {
    if (!tripData.packingList) {
      const defaultList = generateDefaultPackingList(tripData, currentTemp, currentCondition);
      onUpdateTripData({
        ...tripData,
        packingList: defaultList,
      });
    }
  }, [tripData, currentTemp, currentCondition, onUpdateTripData]);

  if (!tripData.packingList) {
    return null;
  }

  const list = tripData.packingList;
  const packedCount = list.filter((item) => item.packed).length;
  const totalCount = list.length;
  const percent = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const handleToggleItem = (itemId: string) => {
    const updated = list.map((item) =>
      item.id === itemId ? { ...item, packed: !item.packed } : item
    );
    onUpdateTripData({ ...tripData, packingList: updated });
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = list.filter((item) => item.id !== itemId);
    onUpdateTripData({ ...tripData, packingList: updated });
  };

  const handleAddItem = (e: React.FormEvent, category: PackingItem['category']) => {
    e.preventDefault();
    const itemText = newInputs[category];
    if (!itemText || !itemText.trim()) return;

    const newItem: PackingItem = {
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      item: itemText.trim(),
      category,
      packed: false,
      isCustom: true,
    };

    onUpdateTripData({
      ...tripData,
      packingList: [...list, newItem],
    });

    setNewInputs({ ...newInputs, [category]: '' });
  };

  const handleResetChecklist = () => {
    const updated = list.map((item) => ({ ...item, packed: false }));
    onUpdateTripData({ ...tripData, packingList: updated });
  };

  const handleRegenerateChecklist = () => {
    if (window.confirm('Are you sure you want to regenerate the checklist? This will clear custom items and packed states.')) {
      const defaultList = generateDefaultPackingList(tripData, currentTemp, currentCondition);
      onUpdateTripData({
        ...tripData,
        packingList: defaultList,
      });
    }
  };

  const categories: { name: PackingItem['category']; icon: string }[] = [
    { name: 'Essentials', icon: '💳' },
    { name: 'Clothing', icon: '👕' },
    { name: 'Toiletries', icon: '🧼' },
    { name: 'Gear', icon: '🔌' },
  ];

  return (
    <div className="packing-list-section">
      <div className="packing-list-header">
        <div>
          <h2 className="packing-list-title">🎒 Trip Packing Checklist</h2>
          <p className="packing-list-subtitle">
            Smart checklist customized for your {tripData.metadata.durationInDays}-day {tripData.metadata.travelStyle.toLowerCase()} trip
            {currentTemp !== undefined ? ` (weather adapted to ${currentTemp}°C, ${currentCondition?.toLowerCase()})` : ''}
          </p>
        </div>
        <div className="packing-actions">
          <button className="btn-secondary btn-sm" onClick={handleResetChecklist}>
            🔄 Reset
          </button>
          <button className="btn-secondary btn-sm" onClick={handleRegenerateChecklist}>
            ⚡ Regenerate
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="packing-progress-container">
        <div className="packing-progress-info">
          <span>{percent === 100 ? '🎉 Ready to go!' : 'Packing Progress'}</span>
          <span className="packing-progress-stats">
            {packedCount} / {totalCount} items ({percent}%)
          </span>
        </div>
        <div className="packing-progress-bar">
          <div
            className="packing-progress-bar-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="packing-grid">
        {categories.map(({ name, icon }) => {
          const categoryItems = list.filter((item) => item.category === name);

          return (
            <div key={name} className="packing-column">
              <div className="packing-column-header">
                <span className="packing-column-icon">{icon}</span>
                <span className="packing-column-title">{name}</span>
                <span className="packing-column-badge">{categoryItems.length}</span>
              </div>

              <div className="packing-items-list">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={`packing-item-row ${item.packed ? 'item-packed' : ''}`}
                  >
                    <label className="packing-checkbox-label">
                      <input
                        type="checkbox"
                        checked={item.packed}
                        onChange={() => handleToggleItem(item.id)}
                        className="packing-checkbox-input"
                      />
                      <span className="packing-item-text">{item.item}</span>
                    </label>
                    <button
                      className="packing-item-delete"
                      onClick={() => handleDeleteItem(item.id)}
                      title="Delete item"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {categoryItems.length === 0 && (
                  <div className="packing-empty-state">No items added yet</div>
                )}
              </div>

              {/* Add Custom Item Form */}
              <form
                onSubmit={(e) => handleAddItem(e, name)}
                className="packing-add-form"
              >
                <input
                  type="text"
                  placeholder={`Add ${name.toLowerCase()}...`}
                  value={newInputs[name]}
                  onChange={(e) =>
                    setNewInputs({ ...newInputs, [name]: e.target.value })
                  }
                  className="packing-add-input"
                />
                <button type="submit" className="packing-add-btn">
                  +
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
