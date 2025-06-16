import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  isAnyModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [openModalCount, setOpenModalCount] = useState(0);

  const openModal = () => {
    setOpenModalCount(prev => prev + 1);
  };

  const closeModal = () => {
    setOpenModalCount(prev => Math.max(0, prev - 1));
  };

  const isAnyModalOpen = openModalCount > 0;

  return (
    <ModalContext.Provider value={{ isAnyModalOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};