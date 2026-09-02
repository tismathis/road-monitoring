import * as XLSX from 'xlsx';

/**
 * Export camera data to Excel file
 * Creates multiple sheets for current stats, historical data, and metadata
 * @param {Object} stats - Current camera statistics {car: number, bus: number, person: number}
 * @param {Array} history - Historical time-series data [{time: string, car: number, bus: number, person: number}]
 * @param {Array} heatmapPoints - Heatmap coordinates [{x: number, y: number, w: number, h: number}]
 */
export function exportCameraDataToExcel(stats, history, heatmapPoints = []) {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // ========== Sheet 1: Current Statistics ==========
  const currentStatsData = [
    ['Gaborone CBD - Road Monitoring System'],
    ['Live Camera Data Export'],
    ['Export Date/Time:', new Date().toLocaleString('fr-FR')],
    [],
    ['Current Statistics'],
    ['Object Type', 'Count'],
    ['Cars', stats.car || 0],
    ['Buses', stats.bus || 0],
    ['Persons', stats.person || 0],
    ['Total Objects', Object.values(stats).reduce((a, b) => a + b, 0)],
  ];

  const currentStatsSheet = XLSX.utils.aoa_to_sheet(currentStatsData);

  // Style the header rows
  currentStatsSheet['!cols'] = [
    { wch: 20 }, // Column A width
    { wch: 15 }, // Column B width
  ];

  XLSX.utils.book_append_sheet(workbook, currentStatsSheet, 'Current Statistics');

  // ========== Sheet 2: Historical Data ==========
  if (history && history.length > 0) {
    const historyData = [
      ['Historical Traffic Data'],
      ['Time Series Data - Object Detection Over Time'],
      [],
      ['Timestamp', 'Cars', 'Buses', 'Persons', 'Total'],
    ];

    // Add each history entry
    history.forEach(entry => {
      const total = (entry.car || 0) + (entry.bus || 0) + (entry.person || 0);
      historyData.push([
        entry.time || '',
        entry.car || 0,
        entry.bus || 0,
        entry.person || 0,
        total
      ]);
    });

    // Add summary statistics
    const totalCars = history.reduce((sum, entry) => sum + (entry.car || 0), 0);
    const totalBuses = history.reduce((sum, entry) => sum + (entry.bus || 0), 0);
    const totalPersons = history.reduce((sum, entry) => sum + (entry.person || 0), 0);
    const avgCars = (totalCars / history.length).toFixed(2);
    const avgBuses = (totalBuses / history.length).toFixed(2);
    const avgPersons = (totalPersons / history.length).toFixed(2);

    historyData.push([]);
    historyData.push(['Summary Statistics']);
    historyData.push(['Total Data Points:', history.length]);
    historyData.push(['Average Cars per Reading:', avgCars]);
    historyData.push(['Average Buses per Reading:', avgBuses]);
    historyData.push(['Average Persons per Reading:', avgPersons]);
    historyData.push(['Total Cars (All Readings):', totalCars]);
    historyData.push(['Total Buses (All Readings):', totalBuses]);
    historyData.push(['Total Persons (All Readings):', totalPersons]);

    const historySheet = XLSX.utils.aoa_to_sheet(historyData);

    // Set column widths
    historySheet['!cols'] = [
      { wch: 20 }, // Timestamp
      { wch: 10 }, // Cars
      { wch: 10 }, // Buses
      { wch: 10 }, // Persons
      { wch: 10 }, // Total
    ];

    XLSX.utils.book_append_sheet(workbook, historySheet, 'Historical Data');
  }

  // ========== Sheet 3: Heatmap Data ==========
  if (heatmapPoints && heatmapPoints.length > 0) {
    const heatmapData = [
      ['Heatmap Detection Points'],
      ['Normalized coordinates (0-1) of recent detections'],
      [],
      ['Point #', 'X (normalized)', 'Y (normalized)', 'Width (normalized)', 'Height (normalized)'],
    ];

    heatmapPoints.forEach((point, index) => {
      heatmapData.push([
        index + 1,
        point.x ? point.x.toFixed(4) : 0,
        point.y ? point.y.toFixed(4) : 0,
        point.w ? point.w.toFixed(4) : 0,
        point.h ? point.h.toFixed(4) : 0,
      ]);
    });

    heatmapData.push([]);
    heatmapData.push(['Total Detection Points:', heatmapPoints.length]);
    heatmapData.push(['Note:', 'Coordinates are normalized (0-1) relative to image dimensions']);

    const heatmapSheet = XLSX.utils.aoa_to_sheet(heatmapData);

    heatmapSheet['!cols'] = [
      { wch: 10 }, // Point #
      { wch: 18 }, // X
      { wch: 18 }, // Y
      { wch: 20 }, // Width
      { wch: 20 }, // Height
    ];

    XLSX.utils.book_append_sheet(workbook, heatmapSheet, 'Heatmap Data');
  }

  // ========== Sheet 4: Metadata ==========
  const metadataData = [
    ['Export Metadata'],
    [],
    ['System Information'],
    ['Location:', 'Gaborone CBD, Botswana'],
    ['Camera ID:', 'Main Traffic Camera'],
    ['Export Date:', new Date().toLocaleDateString('fr-FR')],
    ['Export Time:', new Date().toLocaleTimeString('fr-FR')],
    ['Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone],
    [],
    ['Data Summary'],
    ['Current Statistics Records:', '1'],
    ['Historical Data Points:', history ? history.length : 0],
    ['Heatmap Detection Points:', heatmapPoints ? heatmapPoints.length : 0],
    [],
    ['Detection Classes'],
    ['- Cars', 'Motor vehicles'],
    ['- Buses', 'Public transport vehicles'],
    ['- Persons', 'Pedestrians and cyclists'],
    [],
    ['Notes'],
    ['Data Source:', 'Live camera feed with YOLO object detection'],
    ['Update Frequency:', 'Statistics: 3 seconds, History: 3 seconds, Heatmap: 1 second'],
    ['Coordinate System:', 'Normalized (0-1) relative to image dimensions'],
  ];

  const metadataSheet = XLSX.utils.aoa_to_sheet(metadataData);

  metadataSheet['!cols'] = [
    { wch: 30 },
    { wch: 40 },
  ];

  XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `Camera_Data_Export_${timestamp}.xlsx`;

  // Write the file
  XLSX.writeFile(workbook, filename);

  return filename;
}

/**
 * Export only historical data in a simplified format
 * @param {Array} history - Historical time-series data
 */
export function exportHistoryToCSV(history) {
  if (!history || history.length === 0) {
    console.warn('No history data to export');
    return;
  }

  // Create CSV content
  const csvRows = [
    ['Timestamp', 'Cars', 'Buses', 'Persons', 'Total']
  ];

  history.forEach(entry => {
    const total = (entry.car || 0) + (entry.bus || 0) + (entry.person || 0);
    csvRows.push([
      entry.time || '',
      entry.car || 0,
      entry.bus || 0,
      entry.person || 0,
      total
    ]);
  });

  const csvContent = csvRows.map(row => row.join(',')).join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `Camera_History_${timestamp}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return filename;
}
