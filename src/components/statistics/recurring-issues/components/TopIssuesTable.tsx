import React from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface Issue {
  id: number;
  type: string;
  location: string;
  machine: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
}

interface TopIssuesTableProps {
  issues: Issue[];
}

const PriorityIcon = ({ priority }: { priority: Issue['priority'] }) => {
  switch (priority) {
    case 'high':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'medium':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'low':
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const TopIssuesTable: React.FC<TopIssuesTableProps> = ({ issues }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priorité
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Laverie
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Machine
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {issues.map((issue) => (
            <tr key={issue.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <PriorityIcon priority={issue.priority} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{issue.type}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{issue.location}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{issue.machine}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${issue.status === 'Résolu' ? 'bg-green-100 text-green-800' : 
                    issue.status === 'En cours' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {issue.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopIssuesTable;
