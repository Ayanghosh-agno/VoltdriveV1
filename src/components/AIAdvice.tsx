import React from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

interface AIAdviceProps {
  tripData: {
    score: number;
    events: {
      harshAcceleration: number;
      harshBraking: number;
      overRevving: number;
      idling: number;
      overSpeeding: number;
    };
    fuelUsed: number;
    distance: number;
    avgSpeed: number;
    mileage?: string; // Added mileage support
    insights?: SalesforceInsight[];
  };
}
interface SalesforceInsight {
  type: 'positive' | 'warning' | 'tip'; // These are the types from Salesforce JSON
  description: string;
}

const AIAdvice: React.FC<AIAdviceProps> = ({ tripData }) => {

  const AIAdvice = () => {
    const advice = [];
    tripData.insights.forEach(sfInsight => {
      switch (sfInsight.type) {
        case 'positive':
            advice.push({
                    type: 'success',
                    icon: CheckCircle,
                    title: '',
                    description: sfInsight.description,
                    color: 'text-green-600 bg-green-50 border-green-200'
                  });
        case 'warning':
            advice.push({
                    type: 'warning',
                    icon: TrendingUp,
                    title: '',
                    description: sfInsight.description,
                    color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
                  });
        case 'tip':
          advice.push({
                    type: 'tip',
                    icon: Lightbulb,
                    title: '',
                    description: sfInsight.description,
                    color: 'text-blue-600 bg-blue-50 border-blue-200'
                  });
        default:
          advice.push({
                    type: 'tip',
                    icon: Lightbulb,
                    title: '',
                    description: sfInsight.description,
                    color: 'text-blue-600 bg-blue-50 border-blue-200'
                  });
        }    
    }      
    return advice;
  };

  
  const generateAdvice = () => {
    const advice = [];
    const fuelEfficiency = tripData.mileage ? parseFloat(tripData.mileage) : (tripData.distance / tripData.fuelUsed);
    
    // Score-based advice
    if (tripData.score >= 90) {
      advice.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Excellent Driving Performance!',
        description: 'Your driving score of ' + tripData.score + ' indicates very safe and efficient driving habits. Keep up the great work!',
        color: 'text-green-600 bg-green-50 border-green-200'
      });
    } else if (tripData.score >= 80) {
      advice.push({
        type: 'warning',
        icon: TrendingUp,
        title: 'Good Driving with Room for Improvement',
        description: 'Your score of ' + tripData.score + ' is good, but there are opportunities to enhance your driving efficiency and safety.',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
      });
    } else {
      advice.push({
        type: 'alert',
        icon: AlertTriangle,
        title: 'Driving Habits Need Attention',
        description: 'Your score of ' + tripData.score + ' suggests several areas for improvement to enhance safety and fuel efficiency.',
        color: 'text-red-600 bg-red-50 border-red-200'
      });
    }

    // Harsh events advice
    if (tripData.events.harshAcceleration > 0 || tripData.events.harshBraking > 0) {
      advice.push({
        type: 'tip',
        icon: Lightbulb,
        title: 'Smooth Driving Technique',
        description: `You had ${tripData.events.harshAcceleration + tripData.events.harshBraking} harsh driving events. Try to accelerate and brake more gradually to improve fuel efficiency by up to 15% and reduce wear on your vehicle.`,
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      });
    }

    // Idling advice
    if (tripData.events.idling > 120) { // More than 2 minutes
      const idlingMinutes = Math.floor(tripData.events.idling / 60);
      advice.push({
        type: 'tip',
        icon: Lightbulb,
        title: 'Reduce Idling Time',
        description: `You idled for ${idlingMinutes} minutes during this trip. Consider turning off your engine when stopped for more than 30 seconds to save fuel and reduce emissions.`,
        color: 'text-amber-600 bg-amber-50 border-amber-200'
      });
    }

    // Speed advice
    if (tripData.avgSpeed < 30) {
      advice.push({
        type: 'tip',
        icon: Lightbulb,
        title: 'Optimize Route Planning',
        description: 'Your average speed was quite low, suggesting heavy traffic or frequent stops. Consider using traffic apps to find more efficient routes during peak hours.',
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
      });
    }

    // Fuel efficiency advice
    const avgFuelEfficiency = 15; // km/l baseline
    const currentEfficiency = typeof fuelEfficiency === 'number' ? fuelEfficiency : parseFloat(fuelEfficiency.toString());
    if (currentEfficiency < avgFuelEfficiency) {
      advice.push({
        type: 'tip',
        icon: Lightbulb,
        title: 'Improve Fuel Efficiency',
        description: `Your fuel efficiency of ${currentEfficiency.toFixed(1)} km/l is below average. Maintain steady speeds, avoid rapid acceleration, and ensure your tires are properly inflated to improve efficiency.`,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
      });
    } else {
      advice.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Great Fuel Efficiency!',
        description: `Your fuel efficiency of ${currentEfficiency.toFixed(1)} km/l is excellent. Your smooth driving style is saving you money and reducing environmental impact.`,
        color: 'text-green-600 bg-green-50 border-green-200'
      });
    }

    return advice;
  };

  const adviceItems = tripData.insights && tripData.insights.length > 0
    ? AIAdvice();
    : generateAdvice();
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Brain className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Driving Insights</h3>
          <p className="text-sm text-gray-600">Personalized recommendations based on your driving pattern</p>
        </div>
      </div>

      <div className="space-y-4">
        {adviceItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className={`p-4 rounded-lg border ${item.color}`}>
              <div className="flex items-start space-x-3">
                <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm opacity-90">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIAdvice;