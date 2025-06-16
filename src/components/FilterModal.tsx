import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useModal } from '../context/ModalContext';

interface FilterModalProps {
  isOpen: boolean;
  options: { value: string; label: string }[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  options,
  selectedFilter,
  onFilterChange,
  onClose
}) => {
  const { openModal, closeModal } = useModal();

  // Handle modal state for navigation bar
  useEffect(() => {
    if (isOpen) {
      openModal();
    } else {
      closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filter Trips</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onFilterChange(option.value);
                onClose();
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                selectedFilter === option.value
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterModal;