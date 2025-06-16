import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronRight, HelpCircle, Wifi, WifiOff, Bluetooth, MapPin, Fuel, Shield, Smartphone, Car, Menu } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import ContactSupportModal from './ContactSupportModal';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ComponentType<any>;
}

const FAQModal: React.FC<FAQModalProps> = ({ isOpen, onClose }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showContactSupport, setShowContactSupport] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const { openModal, closeModal } = useModal();

  // Handle modal state for navigation bar
  useEffect(() => {
    if (isOpen) {
      openModal();
    } else {
      closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  const faqData: FAQItem[] = [
    // Hardware & Device Setup
    {
      id: 'hw-01',
      question: 'How do I set up my VoltRide Module for the first time?',
      answer: 'First, plug the OBD-II reader into your car\'s OBD-II port (usually located under the dashboard). Then turn on the VoltRide Module. The bright LED at the center will glow indicating the device is loading. When connected to the OBD-II reader via Bluetooth, the LED changes to Blue. Once GPS lock is achieved, it changes to Green, meaning it\'s ready to read and transmit data.',
      category: 'hardware',
      icon: Car
    },
    {
      id: 'hw-02',
      question: 'What do the LED indicators on my VoltRide Module mean?',
      answer: 'The VoltRide Module has several LED indicators:\n\n• Dim red LED blinking every 1 second = Connected to network\n• Dim red LED blinking very slowly = Internet connectivity issues\n• Bright center LED glowing = Device is loading\n• Blue center LED = Connected to OBD-II reader via Bluetooth\n• Green center LED = GPS lock achieved, ready to transmit data',
      category: 'hardware',
      icon: Wifi
    },
    {
      id: 'hw-03',
      question: 'My VoltRide Module won\'t connect to the OBD-II reader. What should I do?',
      answer: 'If the VoltRide Module cannot connect to the OBD-II reader, try this troubleshooting sequence:\n\n1. Turn off both the VoltRide Module and remove the OBD-II reader\n2. First, plug the OBD-II reader back into your car\n3. Then turn on the VoltRide Module\n4. Wait for the LED sequence: Loading (bright) → Bluetooth connected (blue) → GPS lock (green)',
      category: 'hardware',
      icon: Bluetooth
    },
    {
      id: 'hw-04',
      question: 'Why is my VoltRide Module\'s red LED blinking slowly?',
      answer: 'A slowly blinking dim red LED indicates internet connectivity issues. Check your mobile network coverage or ensure your device has proper cellular connectivity. The module needs internet access to transmit driving data to the VoltRide servers.',
      category: 'hardware',
      icon: WifiOff
    },
    
    // App & Features
    {
      id: 'app-01',
      question: 'How is my driving score calculated?',
      answer: 'Your driving score (0-100) is calculated using four main components:\n\n• Safety (35%): Speed compliance, harsh events, consistency\n• Efficiency (25%): Fuel consumption vs vehicle specifications\n• Smoothness (25%): Acceleration and braking patterns\n• Environmental (15%): Idling time and emissions\n\nThe score uses real-time data from your vehicle\'s OBD-II system and GPS tracking.',
      category: 'app',
      icon: Shield
    },
    {
      id: 'app-02',
      question: 'What data does VoltRide collect from my vehicle?',
      answer: 'VoltRide collects the following data through the OBD-II interface:\n\n• Speed, RPM, and throttle position\n• Engine load and fuel consumption\n• GPS location and route information\n• Acceleration and braking patterns\n• Engine diagnostics and performance metrics\n\nAll data is encrypted and used solely for driving analysis and improvement recommendations.',
      category: 'app',
      icon: Car
    },
    {
      id: 'app-03',
      question: 'How accurate is the fuel efficiency calculation?',
      answer: 'VoltRide calculates fuel efficiency using real-time OBD-II data from your vehicle\'s engine control unit. This provides highly accurate readings compared to your vehicle\'s claimed mileage. The system accounts for driving conditions, traffic, and your specific driving patterns to give you precise fuel consumption data.',
      category: 'app',
      icon: Fuel
    },
    {
      id: 'app-04',
      question: 'Can I use VoltRide with any car?',
      answer: 'VoltRide works with any vehicle manufactured after 1996 that has an OBD-II port. This includes most cars, SUVs, and light trucks. The system supports both petrol and diesel vehicles. Electric vehicles with OBD-II ports are also supported, though some metrics may vary.',
      category: 'app',
      icon: Car
    },
    
    // Account & Privacy
    {
      id: 'acc-01',
      question: 'Is my driving data secure and private?',
      answer: 'Yes, your privacy is our top priority. All driving data is encrypted during transmission and storage. We never share your personal driving data with third parties without your explicit consent. You can control data sharing preferences in the Privacy & Security settings.',
      category: 'account',
      icon: Shield
    },
    {
      id: 'acc-02',
      question: 'Can I export my driving data?',
      answer: 'Yes, you can export all your driving data at any time. Go to Settings > Privacy & Security > Export My Data. This will generate a comprehensive JSON file containing all your trips, scores, and analytics data.',
      category: 'account',
      icon: Smartphone
    },
    {
      id: 'acc-03',
      question: 'How do I delete my account and data?',
      answer: 'To delete your account, go to Settings > Privacy & Security > Delete Account. This will permanently remove all your data, including trip history, scores, and personal information. This action cannot be undone.',
      category: 'account',
      icon: Shield
    },
    
    // Troubleshooting
    {
      id: 'ts-01',
      question: 'Why am I not seeing any trip data in the app?',
      answer: 'If you\'re not seeing trip data, check the following:\n\n1. Ensure your VoltRide Module is properly connected (green LED)\n2. Verify the OBD-II reader is plugged into your car\n3. Check that you have internet connectivity (steady red LED blinking)\n4. Make sure you\'ve driven for at least 5 minutes\n5. Refresh the app or log out and log back in',
      category: 'troubleshooting',
      icon: HelpCircle
    },
    {
      id: 'ts-02',
      question: 'My GPS location seems inaccurate. How can I fix this?',
      answer: 'GPS accuracy depends on several factors:\n\n• Ensure the VoltRide Module has a clear view of the sky\n• Wait for the green LED (GPS lock achieved)\n• Avoid parking in underground garages or areas with poor satellite reception\n• The system typically achieves GPS lock within 2-3 minutes of startup',
      category: 'troubleshooting',
      icon: MapPin
    },
    {
      id: 'ts-03',
      question: 'The app shows I\'m offline. What should I do?',
      answer: 'If the app shows you\'re offline:\n\n1. Check your phone\'s internet connection\n2. Verify the VoltRide Module\'s red LED is blinking steadily (network connected)\n3. Try refreshing the app\n4. If the issue persists, contact support with your device\'s case number',
      category: 'troubleshooting',
      icon: WifiOff
    }
  ];

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'hardware', label: 'Hardware & Setup', icon: Car },
    { id: 'app', label: 'App & Features', icon: Smartphone },
    { id: 'account', label: 'Account & Privacy', icon: Shield },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: WifiOff }
  ];

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowMobileCategories(false);
  };

  const getCurrentCategoryLabel = () => {
    const category = categories.find(cat => cat.id === selectedCategory);
    return category ? category.label : 'All Questions';
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">FAQ</h3>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Find answers to common questions about VoltRide</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Mobile Category Selector */}
          <div className="lg:hidden border-b border-gray-200 p-4">
            <button
              onClick={() => setShowMobileCategories(!showMobileCategories)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <Menu className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">{getCurrentCategoryLabel()}</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${showMobileCategories ? 'rotate-180' : ''}`} />
            </button>
            
            {showMobileCategories && (
              <div className="mt-2 space-y-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm font-medium">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Desktop Categories Sidebar */}
            <div className="hidden lg:block w-80 border-r border-gray-200 p-4 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
              <div className="space-y-1">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FAQ Content */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <div className="space-y-3 sm:space-y-4">
                {filteredFAQs.map((faq) => {
                  const isExpanded = expandedItems.includes(faq.id);
                  const IconComponent = faq.icon;
                  
                  return (
                    <div key={faq.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleExpanded(faq.id)}
                        className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                          <span className="font-medium text-gray-900 text-sm sm:text-base leading-tight">{faq.question}</span>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          )}
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                          <div className="pl-6 sm:pl-8 text-gray-600 text-sm sm:text-base whitespace-pre-line leading-relaxed">
                            {faq.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <HelpCircle className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No questions found</h4>
                  <p className="text-sm sm:text-base text-gray-600">Try selecting a different category or contact support for help.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                Can't find what you're looking for?{' '}
                <button 
                  onClick={() => setShowContactSupport(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Contact Support
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support Modal */}
      <ContactSupportModal
        isOpen={showContactSupport}
        onClose={() => setShowContactSupport(false)}
      />
    </>
  );
};

export default FAQModal;