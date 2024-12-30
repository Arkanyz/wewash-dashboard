import React, { useState, useEffect } from 'react';
import { Power, Loader2 } from 'lucide-react';
import { weLineService } from '../../services/weline';

interface Machine {
    id: string;
    name: string;
    status: string;
    location: string;
}

const MachinesList: React.FC = () => {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toggleLoading, setToggleLoading] = useState<string | null>(null);

    const loadMachines = async () => {
        try {
            setLoading(true);
            const machinesList = await weLineService.getMachinesList();
            setMachines(machinesList);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMachines();
    }, []);

    const handleToggle = async (machineId: string, currentStatus: string) => {
        try {
            setToggleLoading(machineId);
            const action = currentStatus === 'on' ? 'off' : 'on';
            await weLineService.toggleMachine(machineId, action);
            await loadMachines(); // Recharger la liste après le changement
        } catch (err: any) {
            setError(err.message);
        } finally {
            setToggleLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 text-[#99E5DC] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Machines</h3>
            
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-500 text-sm">{error}</p>
                </div>
            )}

            <div className="grid gap-3">
                {machines.map((machine) => (
                    <div 
                        key={machine.id}
                        className="bg-[#1A1D1D] p-4 rounded-lg flex items-center justify-between"
                    >
                        <div>
                            <h4 className="font-medium text-white">{machine.name}</h4>
                            <p className="text-sm text-gray-400">{machine.location}</p>
                        </div>

                        <button
                            onClick={() => handleToggle(machine.id, machine.status)}
                            disabled={toggleLoading === machine.id}
                            className={`p-2 rounded-lg transition-colors ${
                                machine.status === 'on'
                                    ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                                    : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                            }`}
                        >
                            {toggleLoading === machine.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Power className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MachinesList;
