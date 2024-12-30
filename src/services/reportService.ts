import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { logService } from './logService';
import { supabase } from '../lib/supabase/client';

interface ReportOptions {
  title: string;
  startDate?: Date;
  endDate?: Date;
  format?: 'A4' | 'A3';
  orientation?: 'portrait' | 'landscape';
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

class ReportService {
  private static instance: ReportService;
  private readonly LOGO_PATH = '/logo.png';

  private constructor() {}

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  public async generateLaundryReport(laundryId: string, options: ReportOptions) {
    try {
      // Création du document PDF
      const doc = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: options.format || 'A4'
      });

      // En-tête du rapport
      await this.addHeader(doc, options.title);

      // Informations de la laverie
      const laundryData = await this.getLaundryData(laundryId);
      this.addLaundryInfo(doc, laundryData);

      // Statistiques des machines
      const machineStats = await this.getMachineStatistics(laundryId, options);
      this.addMachineStatistics(doc, machineStats);

      // Historique des interventions
      const interventions = await this.getInterventions(laundryId, options);
      this.addInterventionsTable(doc, interventions);

      // Graphiques
      const performanceData = await this.getPerformanceData(laundryId, options);
      await this.addCharts(doc, performanceData);

      // Pied de page
      this.addFooter(doc);

      // Génération du PDF
      const fileName = `rapport_laverie_${laundryId}_${format(new Date(), 'dd-MM-yyyy')}.pdf`;
      doc.save(fileName);

      logService.info('report', 'Rapport PDF généré avec succès', {
        laundryId,
        fileName
      });

      return fileName;
    } catch (error) {
      logService.error('report', 'Erreur lors de la génération du rapport PDF', error);
      throw error;
    }
  }

  private async addHeader(doc: jsPDF, title: string) {
    // Logo
    const img = new Image();
    img.src = this.LOGO_PATH;
    doc.addImage(img, 'PNG', 10, 10, 30, 30);

    // Titre
    doc.setFontSize(20);
    doc.text(title, 50, 25);

    // Date
    doc.setFontSize(12);
    doc.text(
      `Généré le ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`,
      50, 35
    );
  }

  private addLaundryInfo(doc: jsPDF, data: any) {
    doc.setFontSize(14);
    doc.text('Informations de la laverie', 14, 50);
    
    doc.setFontSize(12);
    doc.text(`Nom: ${data.name}`, 14, 60);
    doc.text(`Adresse: ${data.address}`, 14, 67);
    doc.text(`Téléphone: ${data.phone}`, 14, 74);
    doc.text(`Email: ${data.email}`, 14, 81);
  }

  private addMachineStatistics(doc: jsPDF, stats: any) {
    doc.setFontSize(14);
    doc.text('Statistiques des machines', 14, 95);

    const tableData = [
      ['Type', 'Total', 'En service', 'En maintenance', 'Taux de disponibilité'],
      ['Lave-linge', stats.washers.total, stats.washers.active, stats.washers.maintenance, `${stats.washers.availability}%`],
      ['Sèche-linge', stats.dryers.total, stats.dryers.active, stats.dryers.maintenance, `${stats.dryers.availability}%`]
    ];

    (doc as any).autoTable({
      startY: 100,
      head: [tableData[0]],
      body: tableData.slice(1)
    });
  }

  private addInterventionsTable(doc: jsPDF, interventions: any[]) {
    doc.setFontSize(14);
    doc.text('Historique des interventions', 14, doc.lastAutoTable.finalY + 20);

    const tableData = interventions.map(int => [
      format(new Date(int.date), 'dd/MM/yyyy'),
      int.type,
      int.machine,
      int.technician,
      int.status
    ]);

    (doc as any).autoTable({
      startY: doc.lastAutoTable.finalY + 25,
      head: [['Date', 'Type', 'Machine', 'Technicien', 'Statut']],
      body: tableData
    });
  }

  private async addCharts(doc: jsPDF, data: ChartData) {
    // Implémentation des graphiques avec Chart.js
    // Cette partie nécessite une bibliothèque supplémentaire pour
    // convertir les graphiques Canvas en images pour le PDF
  }

  private addFooter(doc: jsPDF) {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  }

  private async getLaundryData(laundryId: string) {
    const { data, error } = await supabase
      .from('laundries')
      .select('*')
      .eq('id', laundryId)
      .single();

    if (error) throw error;
    return data;
  }

  private async getMachineStatistics(laundryId: string, options: ReportOptions) {
    // Implémenter la logique pour récupérer les statistiques des machines
    return {
      washers: { total: 0, active: 0, maintenance: 0, availability: 0 },
      dryers: { total: 0, active: 0, maintenance: 0, availability: 0 }
    };
  }

  private async getInterventions(laundryId: string, options: ReportOptions) {
    const { data, error } = await supabase
      .from('interventions')
      .select(`
        *,
        machines (name),
        technicians (full_name)
      `)
      .eq('laundry_id', laundryId)
      .gte('created_at', options.startDate?.toISOString())
      .lte('created_at', options.endDate?.toISOString());

    if (error) throw error;
    return data;
  }

  private async getPerformanceData(laundryId: string, options: ReportOptions) {
    // Implémenter la logique pour récupérer les données de performance
    return {
      labels: [],
      datasets: []
    };
  }

  // Export des données
  public async exportToCSV(data: any[], filename: string) {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(obj => 
      headers.map(header => JSON.stringify(obj[header] || '')).join(',')
    );

    return [
      headers.join(','),
      ...rows
    ].join('\n');
  }
}

export const reportService = ReportService.getInstance();
