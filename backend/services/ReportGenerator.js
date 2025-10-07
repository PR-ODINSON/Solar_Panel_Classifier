import ExcelJS from 'exceljs';
import fs from 'fs-extra';
import path from 'path';

class ReportGenerator {
    constructor(config) {
        this.config = config;
        this.classNames = ['Bird-drop', 'Clean', 'Dusty', 'Physical-Damage'];
    }
    
    /**
     * Generate comprehensive Excel report with multiple sheets
     */
    async generateExcelReport(classificationResults, imageName, outputPath, gpsData = null) {
        console.log(`Generating Excel report for: ${imageName}`);
        
        const workbook = new ExcelJS.Workbook();
        
        // Set workbook properties
        workbook.creator = 'Solar Panel Classification System';
        workbook.lastModifiedBy = 'Solar Panel Classification System';
        workbook.created = new Date();
        workbook.modified = new Date();
        
        // Create worksheets
        await this.createSummarySheet(workbook, classificationResults, imageName, gpsData);
        await this.createDetailedResultsSheet(workbook, classificationResults);
        await this.createStatisticsSheet(workbook, classificationResults);
        await this.createGpsSheet(workbook, classificationResults, gpsData);
        
        // Save workbook
        await workbook.xlsx.writeFile(outputPath);
        
        // Generate summary data
        const summary = this.generateSummaryData(classificationResults);
        
        console.log(`Excel report saved to: ${outputPath}`);
        
        return {
            total_panels: summary.totalPanels,
            class_distribution: summary.classDistribution,
            file_path: outputPath,
            report_sheets: ['Summary', 'Detailed Results', 'Statistics', 'GPS Data'],
            processing_time: new Date().toISOString()
        };
    }
    
    /**
     * Create summary sheet
     */
    async createSummarySheet(workbook, classificationResults, imageName, gpsData) {
        const sheet = workbook.addWorksheet('Summary');
        
        // Set column widths
        sheet.columns = [
            { header: 'Metric', key: 'metric', width: 25 },
            { header: 'Value', key: 'value', width: 30 },
            { header: 'Details', key: 'details', width: 40 }
        ];
        
        // Header styling
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, size: 12 };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        headerRow.font = { ...headerRow.font, color: { argb: 'FFFFFFFF' } };
        
        // Add title
        sheet.insertRow(1, ['Solar Panel Inspection Report', '', '']);
        sheet.mergeCells('A1:C1');
        const titleRow = sheet.getRow(1);
        titleRow.font = { bold: true, size: 16 };
        titleRow.alignment = { horizontal: 'center' };
        titleRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2F5597' }
        };
        titleRow.font = { ...titleRow.font, color: { argb: 'FFFFFFFF' } };
        
        // Add empty row
        sheet.addRow([]);
        
        // Basic information
        const summary = this.generateSummaryData(classificationResults);
        const processTime = new Date().toLocaleString();
        
        sheet.addRow(['Image Name', imageName, 'Source image file']);
        sheet.addRow(['Processing Date', processTime, 'When analysis was completed']);
        sheet.addRow(['Total Panels Detected', summary.totalPanels, 'Number of solar panels found']);
        
        // Add GPS information
        if (gpsData && gpsData.hasGps) {
            sheet.addRow(['GPS Latitude', gpsData.latitude.toFixed(6), 'Geographic latitude']);
            sheet.addRow(['GPS Longitude', gpsData.longitude.toFixed(6), 'Geographic longitude']);
        } else {
            sheet.addRow(['GPS Data', 'Not Available', 'No GPS information in image']);
        }
        
        // Add empty row before class breakdown
        sheet.addRow([]);
        sheet.addRow(['Classification Breakdown', '', '']);
        
        // Add class distribution
        this.classNames.forEach(className => {
            const count = summary.classDistribution[className] || 0;
            const percentage = summary.totalPanels > 0 ? 
                ((count / summary.totalPanels) * 100).toFixed(1) + '%' : '0%';
            sheet.addRow([`${className} Panels`, count, `${percentage} of total panels`]);
        });
        
        // Calculate health metrics
        const cleanPanels = summary.classDistribution['Clean'] || 0;
        const healthPercentage = summary.totalPanels > 0 ? 
            ((cleanPanels / summary.totalPanels) * 100).toFixed(1) + '%' : '0%';
        
        sheet.addRow([]);
        sheet.addRow(['Overall Health Status', healthPercentage, 'Percentage of clean panels']);
        
        // Style data rows
        for (let i = 4; i <= sheet.lastRow.number; i++) {
            const row = sheet.getRow(i);
            if (row.getCell(1).value && row.getCell(1).value.toString().includes('Breakdown')) {
                row.font = { bold: true };
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE7E6E6' }
                };
            }
        }
    }
    
    /**
     * Create detailed results sheet
     */
    async createDetailedResultsSheet(workbook, classificationResults) {
        const sheet = workbook.addWorksheet('Detailed Results');
        
        // Set columns
        sheet.columns = [
            { header: 'Panel ID', key: 'panel_id', width: 20 },
            { header: 'Classification', key: 'classification', width: 15 },
            { header: 'Confidence', key: 'confidence', width: 12 },
            { header: 'X1', key: 'x1', width: 8 },
            { header: 'Y1', key: 'y1', width: 8 },
            { header: 'X2', key: 'x2', width: 8 },
            { header: 'Y2', key: 'y2', width: 8 },
            { header: 'Width', key: 'width', width: 10 },
            { header: 'Height', key: 'height', width: 10 },
            { header: 'Area', key: 'area', width: 12 }
        ];
        
        // Style header
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        headerRow.font = { ...headerRow.font, color: { argb: 'FFFFFFFF' } };
        
        // Add data
        classificationResults.forEach(result => {
            const [x1, y1, x2, y2] = result.bbox;
            const width = x2 - x1;
            const height = y2 - y1;
            const area = width * height;
            
            sheet.addRow({
                panel_id: result.panel_id,
                classification: result.classification,
                confidence: (result.confidence * 100).toFixed(1) + '%',
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                width: width,
                height: height,
                area: area
            });
        });
        
        // Add conditional formatting for classifications
        sheet.getColumn('B').eachCell((cell, rowNumber) => {
            if (rowNumber > 1) { // Skip header
                switch (cell.value) {
                    case 'Clean':
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FF90EE90' }
                        };
                        break;
                    case 'Dusty':
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFD700' }
                        };
                        break;
                    case 'Physical-Damage':
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFF6B6B' }
                        };
                        break;
                    case 'Bird-drop':
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFA500' }
                        };
                        break;
                }
            }
        });
    }
    
    /**
     * Create statistics sheet
     */
    async createStatisticsSheet(workbook, classificationResults) {
        const sheet = workbook.addWorksheet('Statistics');
        
        const summary = this.generateSummaryData(classificationResults);
        
        // Set columns
        sheet.columns = [
            { header: 'Statistic', key: 'statistic', width: 25 },
            { header: 'Value', key: 'value', width: 15 },
            { header: 'Percentage', key: 'percentage', width: 15 }
        ];
        
        // Style header
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        headerRow.font = { ...headerRow.font, color: { argb: 'FFFFFFFF' } };
        
        // Add statistics
        sheet.addRow(['Total Panels', summary.totalPanels, '100%']);
        
        this.classNames.forEach(className => {
            const count = summary.classDistribution[className] || 0;
            const percentage = summary.totalPanels > 0 ? 
                ((count / summary.totalPanels) * 100).toFixed(1) + '%' : '0%';
            sheet.addRow([className, count, percentage]);
        });
        
        // Add confidence statistics
        if (classificationResults.length > 0) {
            const confidences = classificationResults.map(r => r.confidence);
            const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
            const minConfidence = Math.min(...confidences);
            const maxConfidence = Math.max(...confidences);
            
            sheet.addRow([]);
            sheet.addRow(['Average Confidence', (avgConfidence * 100).toFixed(1) + '%', '']);
            sheet.addRow(['Min Confidence', (minConfidence * 100).toFixed(1) + '%', '']);
            sheet.addRow(['Max Confidence', (maxConfidence * 100).toFixed(1) + '%', '']);
        }
        
        // Add area statistics
        if (classificationResults.length > 0) {
            const areas = classificationResults.map(r => {
                const [x1, y1, x2, y2] = r.bbox;
                return (x2 - x1) * (y2 - y1);
            });
            
            const totalArea = areas.reduce((a, b) => a + b, 0);
            const avgArea = totalArea / areas.length;
            
            sheet.addRow([]);
            sheet.addRow(['Total Panel Area', `${totalArea.toLocaleString()} px²`, '']);
            sheet.addRow(['Average Panel Area', `${Math.round(avgArea).toLocaleString()} px²`, '']);
        }
    }
    
    /**
     * Create GPS data sheet
     */
    async createGpsSheet(workbook, classificationResults, gpsData) {
        const sheet = workbook.addWorksheet('GPS Data');
        
        // Set columns
        sheet.columns = [
            { header: 'GPS Information', key: 'info', width: 25 },
            { header: 'Value', key: 'value', width: 30 },
            { header: 'Format', key: 'format', width: 20 }
        ];
        
        // Style header
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        headerRow.font = { ...headerRow.font, color: { argb: 'FFFFFFFF' } };
        
        if (gpsData && gpsData.hasGps) {
            sheet.addRow(['Latitude', gpsData.latitude, 'Decimal degrees']);
            sheet.addRow(['Longitude', gpsData.longitude, 'Decimal degrees']);
            sheet.addRow(['Coordinates', `${gpsData.latitude}, ${gpsData.longitude}`, 'Lat, Lon']);
            
            // Add Google Maps link
            const mapsUrl = `https://www.google.com/maps?q=${gpsData.latitude},${gpsData.longitude}`;
            sheet.addRow(['Google Maps Link', mapsUrl, 'URL']);
            
            // Make the URL clickable
            const urlCell = sheet.getCell('B4');
            urlCell.value = {
                text: mapsUrl,
                hyperlink: mapsUrl
            };
            urlCell.font = { color: { argb: 'FF0000FF' }, underline: true };
        } else {
            sheet.addRow(['GPS Status', 'No GPS data available', 'N/A']);
            sheet.addRow(['Note', 'Image does not contain GPS information', 'N/A']);
        }
        
        // Add panel location summary
        if (classificationResults.length > 0) {
            sheet.addRow([]);
            sheet.addRow(['Panel Detection Summary', '', '']);
            sheet.addRow(['Total Panels Found', classificationResults.length, 'Count']);
            
            // Calculate bounding box of all panels
            const allX = classificationResults.flatMap(r => [r.bbox[0], r.bbox[2]]);
            const allY = classificationResults.flatMap(r => [r.bbox[1], r.bbox[3]]);
            
            const minX = Math.min(...allX);
            const maxX = Math.max(...allX);
            const minY = Math.min(...allY);
            const maxY = Math.max(...allY);
            
            sheet.addRow(['Detection Area (X)', `${minX} - ${maxX}`, 'Pixels']);
            sheet.addRow(['Detection Area (Y)', `${minY} - ${maxY}`, 'Pixels']);
            sheet.addRow(['Coverage Width', maxX - minX, 'Pixels']);
            sheet.addRow(['Coverage Height', maxY - minY, 'Pixels']);
        }
    }
    
    /**
     * Generate summary data
     */
    generateSummaryData(classificationResults) {
        const totalPanels = classificationResults.length;
        const classDistribution = {};
        
        // Initialize all classes with 0
        this.classNames.forEach(className => {
            classDistribution[className] = 0;
        });
        
        // Count classifications
        classificationResults.forEach(result => {
            if (classDistribution.hasOwnProperty(result.classification)) {
                classDistribution[result.classification]++;
            }
        });
        
        return {
            totalPanels,
            classDistribution
        };
    }
    
    /**
     * Generate CSV report as alternative format
     */
    async generateCsvReport(classificationResults, imageName, outputPath) {
        const csvData = classificationResults.map((result, index) => {
            const [x1, y1, x2, y2] = result.bbox;
            return {
                index: index + 1,
                panel_id: result.panel_id,
                classification: result.classification,
                confidence: result.confidence,
                x1, y1, x2, y2,
                width: x2 - x1,
                height: y2 - y1,
                area: (x2 - x1) * (y2 - y1)
            };
        });
        
        const csvWriter = createObjectCsvWriter({
            path: outputPath,
            header: [
                { id: 'index', title: 'Index' },
                { id: 'panel_id', title: 'Panel ID' },
                { id: 'classification', title: 'Classification' },
                { id: 'confidence', title: 'Confidence' },
                { id: 'x1', title: 'X1' },
                { id: 'y1', title: 'Y1' },
                { id: 'x2', title: 'X2' },
                { id: 'y2', title: 'Y2' },
                { id: 'width', title: 'Width' },
                { id: 'height', title: 'Height' },
                { id: 'area', title: 'Area' }
            ]
        });
        
        await csvWriter.writeRecords(csvData);
        return outputPath;
    }
}

export default ReportGenerator;
