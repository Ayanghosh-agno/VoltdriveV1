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
    setOpenModalCount(prev => {
      const newCount = prev + 1;
      console.log('🔍 Modal opened, count:', prev, '→', newCount, 'isAnyModalOpen:', newCount > 0);
      return newCount;
    });
  };

  const closeModal = () => {
    setOpenModalCount(prev => {
      const newCount = Math.max(0, prev - 1);
      console.log('🔍 Modal closed, count:', prev, '→', newCount, 'isAnyModalOpen:', newCount > 0);
      return newCount;
    });
  };

  const isAnyModalOpen = openModalCount > 0;

  console.log('🔍 ModalContext render - openModalCount:', openModalCount, 'isAnyModalOpen:', isAnyModalOpen);

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