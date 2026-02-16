// src/lib/pdfReport.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SessionStats, SessionItem } from '@/types/session';

export class PdfReportGenerator {
    static generateDailyReport(stats: any, activities: any[]) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(128, 0, 0); // Maroon
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('WAREHOUSE DAILY REPORT', 20, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, 20, 33);

        // Stats Section
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Ringkasan Operasional', 20, 55);

        const statsData = [
            ['Sesi Hari Ini', stats?.totalSessions || 0],
            ['Terscan Hari Ini', stats?.totalScannedToday || 0],
            ['Sesi Aktif', stats?.activeSessions || 0],
            ['Total Progress', `${stats?.overallProgress || 0}%`]
        ];

        autoTable(doc, {
            startY: 60,
            head: [['Metrik', 'Nilai']],
            body: statsData,
            theme: 'striped',
            headStyles: { fillColor: [128, 0, 0] },
            margin: { left: 20 }
        });

        // History Section
        const finalY = (doc as any).lastAutoTable.finalY || 100;
        const historyStartY = finalY + 15;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Aktivitas Terakhir', 20, historyStartY);

        const historyData = activities.map(a => [
            new Date(a.scannedAt).toLocaleTimeString('id-ID'),
            a.trackingId,
            a.productName || 'N/A',
            a.session.name,
            a.scannedBy?.name || 'Operator'
        ]);

        autoTable(doc, {
            startY: historyStartY + 5,
            head: [['Waktu', 'Tracking ID', 'Produk', 'Sesi', 'Operator']],
            body: historyData,
            theme: 'grid',
            headStyles: { fillColor: [80, 80, 80] },
            styles: { fontSize: 8 },
            margin: { left: 20 }
        });

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Wijaya Tracking - Halaman ${i} dari ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        }

        doc.save(`Warehouse_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    }
}
