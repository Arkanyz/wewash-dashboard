import React from 'react';
import { AlertCircle, Clock, Wrench } from 'lucide-react';

interface CriticalMachine {
  id: number;
  name: string;
  location: string;
  issueCount: number;
  lastIssue: string;
  status: string;
}

interface CriticalMachinesProps {
  machines: CriticalMachine[];
}

const CriticalMachines: React.FC<CriticalMachinesProps> = ({ machines }) => {
  return (
    <div className="space-y-4">
      {machines.map((machine) => (
        <div
          key={machine.id}
          className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{machine.name}</h4>
                <p className="text-sm text-gray-500">{machine.location}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Wrench className="w-4 h-4 mr-1" />
                    {machine.issueCount} problèmes
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Dernier : {machine.lastIssue}
                  </div>
                </div>
              </div>
            </div>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full 
                ${machine.status === 'Critique' ? 'bg-red-100 text-red-800' : 
                  machine.status === 'Surveillance' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-blue-100 text-blue-800'}`}
            >
              {machine.status}
            </span>
          </div>
          <div className="mt-4">
            <button className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
              Planifier une intervention
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CriticalMachines;
