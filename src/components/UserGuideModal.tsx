import React, { useState } from 'react';
import { X, BookOpen, Car, Smartphone, Settings, BarChart3, Shield, Zap, CheckCircle, AlertTriangle, Wifi, Bluetooth, MapPin } from 'lucide-react';
import ContactSupportModal from './ContactSupportModal';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GuideSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
}

const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('getting-started');
  const [showContactSupport, setShowContactSupport] = useState(false);

  const guideSections: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Car,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Welcome to VoltRide!</h4>
            <p className="text-gray-600 mb-4">
              VoltRide is your intelligent driving companion that helps you improve fuel efficiency, 
              enhance safety, and reduce environmental impact through real-time vehicle analytics.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-3">What You'll Need:</h5>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>A vehicle with an OBD-II port (cars manufactured after 1996)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>VoltRide Module (hardware device)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>OBD-II reader (connects to your car)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Smartphone with VoltRide app</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h6 className="font-medium text-blue-800 mb-2">Quick Start Checklist:</h6>
            <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
              <li>Install OBD-II reader in your car</li>
              <li>Turn on VoltRide Module</li>
              <li>Wait for green LED (GPS lock)</li>
              <li>Start driving and view your data!</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'hardware-setup',
      title: 'Hardware Setup',
      icon: Zap,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Setting Up Your VoltRide Module</h4>
            <p className="text-gray-600 mb-4">
              Follow these steps to properly set up your VoltRide hardware for optimal performance.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-3">Step-by-Step Setup:</h5>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">1</div>
                <div>
                  <h6 className="font-medium text-gray-900">Install OBD-II Reader</h6>
                  <p className="text-gray-600 text-sm">Locate your car's OBD-II port (usually under the dashboard near the steering wheel) and plug in the OBD-II reader firmly.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">2</div>
                <div>
                  <h6 className="font-medium text-gray-900">Power On VoltRide Module</h6>
                  <p className="text-gray-600 text-sm">Turn on your VoltRide Module. You'll see a bright LED at the center indicating the device is loading.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">3</div>
                <div>
                  <h6 className="font-medium text-gray-900">Wait for Bluetooth Connection</h6>
                  <p className="text-gray-600 text-sm">The center LED will change to <span className="text-blue-600 font-medium">Blue</span> when successfully connected to the OBD-II reader via Bluetooth.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">4</div>
                <div>
                  <h6 className="font-medium text-gray-900">GPS Lock Achievement</h6>
                  <p className="text-gray-600 text-sm">The LED will turn <span className="text-green-600 font-medium">Green</span> once GPS lock is achieved. Your device is now ready to read and transmit data!</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-3">LED Status Indicators:</h5>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Wifi className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-medium text-gray-900">Dim Red LED (1 sec intervals)</div>
                  <div className="text-sm text-gray-600">Connected to network - Normal operation</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="font-medium text-gray-900">Dim Red LED (Slow blinking)</div>
                  <div className="text-sm text-gray-600">Internet connectivity issues</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="font-medium text-gray-900">Bright Center LED</div>
                  <div className="text-sm text-gray-600">Device is loading/starting up</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Bluetooth className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium text-gray-900">Blue Center LED</div>
                  <div className="text-sm text-gray-600">Connected to OBD-II reader via Bluetooth</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium text-gray-900">Green Center LED</div>
                  <div className="text-sm text-gray-600">GPS lock achieved - Ready to transmit data</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h6 className="font-medium text-amber-800 mb-2">Troubleshooting Connection Issues:</h6>
            <p className="text-amber-700 text-sm mb-2">If the VoltRide Module cannot connect to the OBD-II reader:</p>
            <ol className="list-decimal list-inside space-y-1 text-amber-700 text-sm">
              <li>Turn off both devices</li>
              <li>Plug the OBD-II reader into your car first</li>
              <li>Then turn on the VoltRide Module</li>
              <li>Wait for the LED sequence: Bright → Blue → Green</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'app-features',
      title: 'App Features',
      icon: Smartphone,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Understanding Your VoltRide App</h4>
            <p className="text-gray-600 mb-4">
              The VoltRide app provides comprehensive insights into your driving patterns, 
              fuel efficiency, and safety metrics.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-3">Main Dashboard:</h5>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <BarChart3 className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h6 className="font-medium text-gray-900">Driving Score</h6>
                  <p className="text-gray-600 text-sm">Your overall driving performance (0-100) based on safety, efficiency, smoothness, and environmental impact.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Car className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h6 className="font-medium text-gray-900">Fuel Efficiency</h6>
                  <p className="text-gray-600 text-sm">Real-time fuel consumption data compared to your vehicle's specifications.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <h6 className="font-medium text-gray-900">Safety Rating</h6>
                  <p className="text-gray-600 text-sm">Assessment based on speed compliance, harsh events, and driving consistency.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-3">Trip Analysis:</h5>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Detailed trip breakdowns with route maps</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Real-time OBD-II data visualization (Speed, RPM, Engine Load)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>AI-powered driving insights and recommendations</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Environmental impact tracking (CO2 emissions, fuel costs)</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-3">Score Breakdown:</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h6 className="font-medium text-red-800">Safety (35%)</h6>
                <p className="text-red-600 text-xs">Speed compliance, harsh events</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h6 className="font-medium text-blue-800">Efficiency (25%)</h6>
                <p className="text-blue-600 text-xs">Fuel consumption optimization</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h6 className="font-medium text-green-800">Smoothness (25%)</h6>
                <p className="text-green-600 text-xs">Acceleration/braking patterns</p>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <h6 className="font-medium text-purple-800">Environmental (15%)</h6>
                <p className="text-purple-600 text-xs">Idling time, emissions</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'settings-customization',
      title: 'Settings & Customization',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Customizing Your VoltRide Experience</h4>
            <p className="text-gray-600 mb-4">
              Personalize your VoltRide settings to match your vehicle specifications and preferences.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-3">Vehicle Settings:</h5>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h6 className="font-medium text-gray-900">Fuel Type & Cost</h6>
                <p className="text-gray-600 text-sm">Set your vehicle's fuel type (Petrol/Diesel/Electric) and local fuel cost for accurate expense calculations.</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h6 className="font-medium text-gray-900">Performance Thresholds</h6>
                <p className="text-gray-600 text-sm">Configure speed limits, acceleration thresholds, and RPM limits based on your driving preferences.</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h6 className="font-medium text-gray-900">Average Mileage</h6>
                <p className="text-gray-600 text-sm">Enter your vehicle's claimed mileage for accurate efficiency comparisons.</p>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-3">Notification Preferences:</h5>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Trip Summary - Get notified after each trip</span>
              </li>
              <li className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Safety Alerts - Receive alerts for driving events</span>
              </li>
              <li className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>Fuel Efficiency Tips - Get personalized fuel saving tips</span>
              </li>
              <li className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span>Weekly Report - Weekly driving performance summary</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-3">Privacy Controls:</h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h6 className="font-medium text-gray-900">Data Sharing</h6>
                  <p className="text-gray-600 text-sm">Allow anonymous data sharing for research</p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h6 className="font-medium text-gray-900">Location History</h6>
                  <p className="text-gray-600 text-sm">Store trip locations for analysis</p>
                </div>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'data-privacy',
      title: 'Data & Privacy',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Your Data & Privacy</h4>
            <p className="text-gray-600 mb-4">
              VoltRide is committed to protecting your privacy and ensuring your data is secure.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-3">What Data We Collect:</h5>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Car className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h6 className="font-medium text-gray-900">Vehicle Data</h6>
                  <p className="text-gray-600 text-sm">Speed, RPM, fuel consumption, engine diagnostics from your vehicle's OBD-II system</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h6 className="font-medium text-gray-900">Location Data</h6>
                  <p className="text-gray-600 text-sm">GPS coordinates for route tracking and trip analysis (only when driving)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <BarChart3 className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <h6 className="font-medium text-gray-900">Usage Analytics</h6>
                  <p className="text-gray-600 text-sm">App usage patterns to improve user experience (anonymized)</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-3">How We Protect Your Data:</h5>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>End-to-end encryption for all data transmission</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Secure cloud storage with industry-standard protection</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>No sharing of personal data with third parties without consent</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <span>Regular security audits and compliance checks</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-gray-900 mb-3">Your Rights:</h5>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h6 className="font-medium text-blue-800">Data Export</h6>
                <p className="text-blue-600 text-sm">Download all your data in a portable format anytime</p>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h6 className="font-medium text-green-800">Data Control</h6>
                <p className="text-green-600 text-sm">Manage what data is collected and how it's used</p>
              </div>
              
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h6 className="font-medium text-red-800">Account Deletion</h6>
                <p className="text-red-600 text-sm">Permanently delete your account and all associated data</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h6 className="font-medium text-gray-900 mb-2">Questions about your data?</h6>
            <p className="text-gray-600 text-sm">
              Contact our privacy team at privacy@voltride.com or use the Contact Support feature 
              in the app for any questions about how your data is handled.
            </p>
          </div>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  const activeContent = guideSections.find(section => section.id === activeSection);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">VoltRide User Guide</h3>
                <p className="text-sm text-gray-600">Complete guide to using VoltRide effectively</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Navigation Sidebar */}
            <div className="w-80 border-r border-gray-200 p-4 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Guide Sections</h4>
              <div className="space-y-1">
                {guideSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{section.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeContent && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <activeContent.icon className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-900">{activeContent.title}</h2>
                  </div>
                  {activeContent.content}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Need more help? Contact our support team for personalized assistance.
              </div>
              <button 
                onClick={() => setShowContactSupport(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Contact Support
              </button>
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

export default UserGuideModal;