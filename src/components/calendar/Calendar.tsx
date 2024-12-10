import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/calendar.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { supabase } from '../../lib/supabaseClient';

interface CalendarProps {
  onExtract?: () => void;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

const Calendar: React.FC<CalendarProps> = () => {
  const currentStats = [
    { value: 3, label: 'Incidents' },
    { value: 1, label: 'Machines bloquées' },
    { value: 0, label: 'Maintenance' },
  ];

  const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  
  const [currentDate, setCurrentDate] = useState(new Date(2024, 11, 8));
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

  // Exemple de données pour l'export (à adapter selon vos besoins réels)
  const mockIncidentData = [
    { date: '2024-12-07', type: 'Panne', machine: 'Machine 1', status: 'Résolu' },
    { date: '2024-12-14', type: 'Blocage', machine: 'Machine 3', status: 'En cours' },
    { date: '2024-12-22', type: 'Maintenance', machine: 'Machine 2', status: 'Planifié' },
  ];

  // Exemple de dates avec des événements
  const datesWithEvents = [7, 14, 22];

  // Fonctions de navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Fonction pour obtenir les jours du mois courant
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const formatMonthYear = () => {
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const createDateFromDay = (day: number) => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
  };

  const isDateStart = (day: number) => {
    if (!dateRange.start || !day) return false;
    const currentDay = createDateFromDay(day);
    return currentDay.getTime() === dateRange.start.getTime();
  };

  const isDateEnd = (day: number) => {
    if (!dateRange.end || !day) return false;
    const currentDay = createDateFromDay(day);
    return currentDay.getTime() === dateRange.end.getTime();
  };

  const isDateBetween = (day: number) => {
    if (!dateRange.start || !dateRange.end || !day) return false;
    const currentDay = createDateFromDay(day);
    return currentDay > dateRange.start && currentDay < dateRange.end;
  };

  const handleDateClick = (day: number) => {
    if (!day) return;
    
    const clickedDate = createDateFromDay(day);
    
    if (!dateRange.start) {
      // Premier clic - définir la date de début
      setDateRange({ start: clickedDate, end: null });
    } else if (!dateRange.end) {
      // Deuxième clic - définir la date de fin
      if (clickedDate < dateRange.start) {
        setDateRange({ start: clickedDate, end: dateRange.start });
      } else {
        setDateRange({ ...dateRange, end: clickedDate });
      }
    } else {
      // Réinitialiser et commencer une nouvelle sélection
      setDateRange({ start: clickedDate, end: null });
    }
  };

  const handleExport = () => {
    if (!dateRange.start || !dateRange.end) return;

    // Générer toutes les dates dans la plage
    const dates: Date[] = [];
    let currentDate = new Date(dateRange.start);
    
    while (currentDate <= dateRange.end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Créer les données pour l'export
    const exportData = dates.map(date => {
      const formattedDate = date.toISOString().split('T')[0];
      // Trouver les incidents pour cette date
      const incidents = mockIncidentData.filter(incident => incident.date === formattedDate);
      
      if (incidents.length > 0) {
        return incidents.map(incident => ({
          Date: formattedDate,
          Type: incident.type,
          Machine: incident.machine,
          Statut: incident.status
        }));
      }
      
      // Si pas d'incident, retourner une ligne vide
      return [{
        Date: formattedDate,
        Type: '-',
        Machine: '-',
        Statut: '-'
      }];
    }).flat();

    // Créer le workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Incidents");

    // Générer le fichier Excel
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Télécharger le fichier
    const fileName = `incidents_${dateRange.start.toISOString().split('T')[0]}_${dateRange.end.toISOString().split('T')[0]}.xlsx`;
    saveAs(data, fileName);
  };

  return (
    <div className="bg-[#111313] p-6 rounded-xl h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Suivi des Incidents</h2>
          <div className="flex items-center gap-2 ml-4">
            <button 
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-[#1F211F] rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span>{formatMonthYear()}</span>
            <button 
              onClick={goToNextMonth}
              className="p-2 hover:bg-[#1F211F] rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-[#1F211F] text-white rounded-lg hover:bg-[#2A2C2A] transition-colors"
            disabled={!dateRange.start || !dateRange.end}
          >
            Extraction
          </button>
        </div>
      </div>

      <div className="flex justify-between mb-8">
        {currentStats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-[#616A6A] text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center text-[#616A6A] py-2">
            {day}
          </div>
        ))}
        {getDaysInMonth().map((day, index) => (
          <div
            key={index}
            onClick={() => day && handleDateClick(day)}
            className={`calendar-day select-none ${
              day === null 
                ? 'invisible' 
                : isDateStart(day) || isDateEnd(day)
                  ? 'calendar-day-selected'
                  : isDateBetween(day)
                    ? 'bg-[#1E201F] text-white'
                    : 'calendar-day-default'
            } ${day && datesWithEvents.includes(day) ? 'relative' : ''} 
              ${day ? 'cursor-pointer hover:bg-opacity-80' : ''}`}
          >
            {day}
            {day && datesWithEvents.includes(day) && (
              <span className="absolute bottom-1 right-1 w-1 h-1 bg-[#99E5DC] rounded-full"></span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
