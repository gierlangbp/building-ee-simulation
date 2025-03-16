// Constants for interventions
const INTERVENTIONS = {
    solarGlass: { reduction: 0.08, originalReduction: 0.08, cost: 0 }, // Will be calculated dynamically
    reflectiveRoof: { reduction: 0.04, originalReduction: 0.04, cost: 0 }, // Will be calculated dynamically
    // AC Central options
    coolingSystem: {
        'air-cooled': { reduction: 0.28, originalReduction: 0.28, cost: 6500000000 },
        'water-cooled': { reduction: 0.32, originalReduction: 0.32, cost: 8500000000 },
        'vrf': { reduction: 0.33, originalReduction: 0.33, cost: 8000000000 },
        'package': { reduction: 0.28, originalReduction: 0.28, cost: 16000000000 },
        'split': { reduction: 0.30, originalReduction: 0.30, cost: 18000000000 }
    },
    // AC Split options
    splitCoolingSystem: {
        'airChiller': { reduction: 0.28, originalReduction: 0.28, cost: 1150000000, label: 'Replace all mini split units with central air-cooled chiller' },
        'waterChiller': { reduction: 0.32, originalReduction: 0.32, cost: 1500000000, label: 'Replace all mini split units with central water-cooled chiller' },
        'vrfSystem': { reduction: 0.33, originalReduction: 0.33, cost: 1000000000, label: 'Replace mini split units with VRF system' },
        'packageUnits': { reduction: 0.28, originalReduction: 0.28, cost: 850000000, label: 'Replace all mini split units with cold air package units' },
        'splitUnits': { reduction: 0.30, originalReduction: 0.30, cost: 350000000, label: 'Replace old mini split units with new energy efficient mini split' }
    },
    exhaustSensor: { reduction: 0.01, originalReduction: 0.01, cost: 60000000 },
    ledLights: { reduction: 0.04, originalReduction: 0.04, cost: 216000000 },
    lightingControl: {
        'separate': { reduction: 0.02, originalReduction: 0.02, cost: 200000000 },
        'central': { reduction: 0.03, originalReduction: 0.03, cost: 540000000 }
    },
    pumpSystem: {
        'new': { reduction: 0.02, originalReduction: 0.02, cost: 648000000 },
        'retrofit': { reduction: 0.04, originalReduction: 0.04, cost: 1300000000 }
    },
    waterHeater: { reduction: 0.004, originalReduction: 0.004, cost: 364000000 },
    bms: { reduction: 0.15, originalReduction: 0.15, cost: 855000000 },
    ems: { reduction: 0.04, originalReduction: 0.04, cost: 165000000 }
};

// Load distribution constants
const LOAD_DISTRIBUTION = {
    cooling: 0.69,
    lighting: 0.04,
    ventilation: 0.05,
    office: 0.07,
    pump: 0.10,
    hotWater: 0.03,
    others: 0.02
};

// Format number with thousand separator and decimal comma
function formatNumber(number, decimals = 2) {
    if (number === 0) return '0';
    
    // Convert to string with fixed decimals
    const formatted = number.toFixed(decimals);
    
    // Split number into integer and decimal parts
    const parts = formatted.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1] : '';
    
    // Add thousand separators to integer part
    const integerWithSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Combine with decimal part, using comma as decimal separator
    return decimalPart ? integerWithSeparators + ',' + decimalPart : integerWithSeparators;
}

// Function to format investment values with dot as thousands separator
function formatInvestment(value) {
    if (!value) return '';
    // Remove any non-numeric characters and parse
    const numericValue = parseFloat(value.toString().replace(/[^0-9]/g, ''));
    if (isNaN(numericValue) || numericValue === 0) return '';
    
    // Convert to string with no decimals
    const formatted = numericValue.toFixed(0);
    
    // Add thousand separators using dots
    const withSeparators = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // No Rp prefix, just return the formatted number
    return withSeparators;
}

// Function to parse investment input values (removes dots)
function parseInvestment(formattedValue) {
    if (!formattedValue) return 0;
    // Remove any thousand separators
    return parseFloat(formattedValue.toString().replace(/\./g, '')) || 0;
}

// Parse number with thousand separator and decimal comma
function parseFormattedNumber(str) {
    return parseFloat(str.replace(/\./g, '').replace(/,/g, '.'));
}

// Initialize chart
let energyChart;

function initializeChart(baseConsumption) {
    const ctx = document.getElementById('energyChart').getContext('2d');
    const data = {
        labels: ['Pendingin', 'Pencahayaan', 'Ventilasi', 'Perangkat Kantor', 'Pompa Air', 'Air Panas', 'Lainnya'],
        datasets: [
            {
                label: 'Konsumsi',
                data: [
                    baseConsumption * LOAD_DISTRIBUTION.cooling, 
                    baseConsumption * LOAD_DISTRIBUTION.lighting,
                    baseConsumption * LOAD_DISTRIBUTION.ventilation,
                    baseConsumption * LOAD_DISTRIBUTION.office,
                    baseConsumption * LOAD_DISTRIBUTION.pump,
                    baseConsumption * LOAD_DISTRIBUTION.hotWater,
                    baseConsumption * LOAD_DISTRIBUTION.others
                ],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(201, 203, 207, 0.8)'
                ],
                stack: 'Stack 0'
            },
            {
                label: 'Penghematan',
                data: [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(52, 211, 153, 0.6)',
                stack: 'Stack 0',
                borderWidth: 0
            }
        ]
    };

    if (energyChart) {
        energyChart.destroy();
    }

    energyChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'MWh/tahun',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                },
                title: {
                    display: true,
                    text: 'Distribusi Konsumsi Energi',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += formatNumber(context.raw) + ' MWh';
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Calculate building metrics
function calculateBuildingMetrics() {
    const width = parseFloat(document.getElementById('width').value) || 0;
    const length = parseFloat(document.getElementById('length').value) || 0;
    const floors = parseFloat(document.getElementById('floors').value) || 0;
    const floorHeight = parseFloat(document.getElementById('floorHeight').value) || 0;
    const wwr = parseFloat(document.getElementById('wwr').value) || 0;
    const roofType = document.getElementById('roofType').value;
    const roofAngle = parseFloat(document.getElementById('roofAngle').value) || 0;
    const monthlyBill = parseMonthlyBill(document.getElementById('monthlyBill').value) || 0;
    const electricityRate = parseFloat(document.getElementById('electricityRate').value) || 1587.92;

    // Calculate areas
    const buildingArea = width * length * floors;
    const wallArea = 2 * (width + length) * floorHeight * floors;
    const windowArea = wallArea * (wwr / 100);
    
    // Calculate roof area based on type
    let roofArea = width * length;
    if (roofType !== 'datar' && roofAngle > 0) {
        roofArea = roofArea / Math.cos(roofAngle * Math.PI / 180);
    }

    // Calculate energy consumption
    const annualEnergyConsumption = ((monthlyBill / electricityRate) * 12) / 1000;

    // Update display fields - using innerHTML for the new result-box elements
    document.getElementById('buildingArea').innerHTML = formatNumber(buildingArea) + ' m²';
    document.getElementById('roofArea').innerHTML = formatNumber(roofArea) + ' m²';
    document.getElementById('windowArea').innerHTML = formatNumber(windowArea) + ' m²';
    document.getElementById('energyConsumption').innerHTML = formatNumber(annualEnergyConsumption) + ' MWh';

    // Initialize or update chart
    initializeChart(annualEnergyConsumption);

    return {
        buildingArea,
        roofArea,
        windowArea,
        annualEnergyConsumption
    };
}

// Calculate energy savings
function calculateEnergySavings() {
    // Ensure all investment fields are properly displayed with formatting
    const allInvestmentInputs = document.querySelectorAll('.investment-input');
    allInvestmentInputs.forEach(input => {
        // If the input has a value but no dot separators, format it
        if (input.value && !input.value.includes('.') && input.value.length > 3) {
            const numericValue = parseInvestment(input.value);
            if (numericValue > 0) {
                input.value = formatInvestment(numericValue);
            }
        }
    });
    
    // Format the monthly bill input if needed
    const monthlyBillInput = document.getElementById('monthlyBill');
    if (monthlyBillInput.value && !monthlyBillInput.value.includes('.') && monthlyBillInput.value.length > 3) {
        monthlyBillInput.value = formatMonthlyBill(monthlyBillInput.value);
    }
    
    // Get base consumption from the text content now, not from input value
    const energyConsumptionText = document.getElementById('energyConsumption').innerHTML;
    // Extract numeric value by removing units (MWh) and then parse
    const numericText = energyConsumptionText.replace(' MWh', '');
    const baseConsumption = parseFloat(numericText.replace(/\./g, '').replace(/,/g, '.'));
    
    const electricityRate = parseFloat(document.getElementById('electricityRate').value);
    const emissionFactor = parseFloat(document.getElementById('emissionFactor').value);
    
    let totalReduction = 0;
    let totalInvestment = 0;

    // Solar glass
    if (document.getElementById('solarGlass').checked) {
        totalReduction += INTERVENTIONS.solarGlass.reduction;
        
        // Calculate investment based on window area * 50% * 650,000
        const windowAreaText = document.getElementById('windowArea').innerHTML;
        const windowArea = parseFloat(windowAreaText.replace(' m²', '').replace(/\./g, '').replace(/,/g, '.'));
        const solarGlassInvestment = windowArea * 0.5 * 650000;
        
        // Always update the investment input field with the calculated value
        const solarGlassInvestmentInput = document.getElementById('solarGlassInvestment');
        solarGlassInvestmentInput.value = formatInvestment(solarGlassInvestment);
        
        totalInvestment += parseInvestment(solarGlassInvestmentInput.value);
    }

    // Reflective roof
    if (document.getElementById('reflectiveRoof').checked) {
        totalReduction += INTERVENTIONS.reflectiveRoof.reduction;
        
        // Calculate investment based on roof area / 20 * 1,700,000
        const roofAreaText = document.getElementById('roofArea').innerHTML;
        const roofArea = parseFloat(roofAreaText.replace(' m²', '').replace(/\./g, '').replace(/,/g, '.'));
        const reflectiveRoofInvestment = (roofArea / 20) * 1700000;
        
        // Always update the investment input field with the calculated value
        const reflectiveRoofInvestmentInput = document.getElementById('reflectiveRoofInvestment');
        reflectiveRoofInvestmentInput.value = formatInvestment(reflectiveRoofInvestment);
        
        totalInvestment += parseInvestment(reflectiveRoofInvestmentInput.value);
    }

    // Cooling system
    const coolingSystem = document.getElementById('coolingIntervention').value;
    if (coolingSystem) {
        // Check which cooling system type is selected (central or split)
        const coolingSystemType = document.getElementById('coolingSystem').value;
        const coolingSystemData = coolingSystemType === 'central' ? 
            INTERVENTIONS.coolingSystem[coolingSystem] : 
            INTERVENTIONS.splitCoolingSystem[coolingSystem];
        
        let coolingReduction = coolingSystemData.reduction;
        
        // Apply reduction rules if solar glass or reflective roof are selected
        if (document.getElementById('solarGlass').checked) coolingReduction -= 0.02;
        if (document.getElementById('reflectiveRoof').checked) coolingReduction -= 0.02;
        
        // Update the option text in the dropdown to reflect current reduction percentage
        const coolingInterventionSelect = document.getElementById('coolingIntervention');
        const selectedOption = coolingInterventionSelect.options[coolingInterventionSelect.selectedIndex];
        const optionText = selectedOption.text;
        const newPercentage = (coolingReduction * 100).toFixed(0);
        
        // Only update if the percentage has changed
        if (!optionText.includes(`(${newPercentage}%)`)) {
            const baseName = coolingSystemType === 'central' ? 
                getCoolingOptionBaseName(coolingSystem, 'central') :
                getCoolingOptionBaseName(coolingSystem, 'split');
            selectedOption.text = `${baseName} (${newPercentage}%)`;
        }
        
        totalReduction += coolingReduction;
        
        // Always update the investment input field with the system cost value when selecting or changing systems
        const coolingInvestmentInput = document.getElementById('coolingInvestment');
        coolingInvestmentInput.value = formatInvestment(coolingSystemData.cost);
        
        totalInvestment += parseInvestment(coolingInvestmentInput.value);
    }

    // BMS
    const hasBMS = document.getElementById('bms').checked;
    if (hasBMS) {
        totalReduction += INTERVENTIONS.bms.reduction;
        totalInvestment += parseInvestment(document.getElementById('bmsInvestment').value) || INTERVENTIONS.bms.cost;
    }

    // Other interventions
    if (!hasBMS) {
        // Exhaust sensor
        if (document.getElementById('exhaustSensor').checked) {
            totalReduction += INTERVENTIONS.exhaustSensor.reduction;
            totalInvestment += parseInvestment(document.getElementById('exhaustSensorInvestment').value) || INTERVENTIONS.exhaustSensor.cost;
        }

        // LED lights
        if (document.getElementById('ledLights').checked) {
            totalReduction += INTERVENTIONS.ledLights.reduction;
            totalInvestment += parseInvestment(document.getElementById('ledLightsInvestment').value) || INTERVENTIONS.ledLights.cost;
        }

        // Lighting control
        const lightingControl = document.getElementById('lightingControl').value;
        if (lightingControl) {
            totalReduction += INTERVENTIONS.lightingControl[lightingControl].reduction;
            
            // Update the investment input field with the calculated value
            const lightingControlInvestmentInput = document.getElementById('lightingControlInvestment');
            if (!lightingControlInvestmentInput.value || parseInvestment(lightingControlInvestmentInput.value) === 0) {
                lightingControlInvestmentInput.value = formatInvestment(INTERVENTIONS.lightingControl[lightingControl].cost);
            }
            
            totalInvestment += parseInvestment(lightingControlInvestmentInput.value) || INTERVENTIONS.lightingControl[lightingControl].cost;
        }

        // Pump system
        const pumpSystem = document.getElementById('pumpSystem').value;
        if (pumpSystem) {
            totalReduction += INTERVENTIONS.pumpSystem[pumpSystem].reduction;
            
            // Update the investment input field with the calculated value
            const pumpSystemInvestmentInput = document.getElementById('pumpSystemInvestment');
            if (!pumpSystemInvestmentInput.value || parseInvestment(pumpSystemInvestmentInput.value) === 0) {
                pumpSystemInvestmentInput.value = formatInvestment(INTERVENTIONS.pumpSystem[pumpSystem].cost);
            }
            
            totalInvestment += parseInvestment(pumpSystemInvestmentInput.value) || INTERVENTIONS.pumpSystem[pumpSystem].cost;
        }

        // Water heater
        if (document.getElementById('waterHeater').checked) {
            let waterHeaterReduction = INTERVENTIONS.waterHeater.reduction;
            if (hasBMS) {
                // If BMS is selected, water heater reduction is 0.1% instead
                waterHeaterReduction = 0.001;
            }
            totalReduction += waterHeaterReduction;
            totalInvestment += parseInvestment(document.getElementById('waterHeaterInvestment').value) || INTERVENTIONS.waterHeater.cost;
        }
    }

    // EMS
    if (document.getElementById('ems').checked && !hasBMS) {
        totalReduction += INTERVENTIONS.ems.reduction;
        totalInvestment += parseInvestment(document.getElementById('emsInvestment').value) || INTERVENTIONS.ems.cost;
    }
    
    // Update intervention reductions on the UI after calculations
    updateInterventionReductions();

    // Calculate savings
    const energySavings = baseConsumption * totalReduction;
    const co2Reduction = energySavings * emissionFactor;
    const costSavings = energySavings * 1000 * electricityRate;
    const paybackPeriod = totalInvestment / costSavings || 0;

    // Update results - using innerHTML for the new result-box elements
    document.getElementById('energySavings').innerHTML = formatNumber(energySavings) + ' MWh/tahun';
    document.getElementById('co2Reduction').innerHTML = formatNumber(co2Reduction) + ' ton CO₂e/tahun';
    document.getElementById('costSavings').innerHTML = 'Rp ' + formatNumber(costSavings) + '/tahun';
    document.getElementById('investment').innerHTML = 'Rp ' + formatNumber(totalInvestment, 0);
    document.getElementById('paybackPeriod').innerHTML = formatNumber(paybackPeriod) + ' tahun';
    
    // Calculate environmental impact equivalents
    // 1 tree absorbs approximately 21 kg of CO2 per year
    const treesEquivalent = Math.round(co2Reduction * 1000 / 21);
    // Convert CO2 reduction from tons to kg
    const co2EquivalentInKg = Math.round(co2Reduction * 1000);
    
    // Update environmental impact metrics
    document.getElementById('treesEquivalent').innerHTML = formatNumber(treesEquivalent, 0);
    document.getElementById('co2EquivalentInKg').innerHTML = formatNumber(co2EquivalentInKg, 0);

    // Update chart with savings
    updateChartWithSavings(baseConsumption, energySavings);
}

function updateChartWithSavings(baseConsumption, savings) {
    if (savings <= 0 || !baseConsumption || isNaN(baseConsumption)) {
        console.log('Invalid values for chart update:', {baseConsumption, savings});
        return;
    }
    
    // Get the datasets
    const consumptionDataset = energyChart.data.datasets[0]; // Consumption
    const savingsDataset = energyChart.data.datasets[1];     // Savings
    
    // Initialize savings for each category
    const categorySavings = {
        cooling: 0,      // Pendinginan
        lighting: 0,     // Pencahayaan
        ventilation: 0,  // Ventilasi
        office: 0,       // Perangkat Kantor
        pump: 0,         // Pompa Air
        hotWater: 0,     // Air Panas
        others: 0        // Lainnya
    };
    
    // Calculate total consumption for each category
    const categoryTotals = {};
    Object.keys(categorySavings).forEach(category => {
        categoryTotals[category] = baseConsumption * LOAD_DISTRIBUTION[category];
    });
    
    // Calculate savings for each intervention
    
    // 1. Kaca solar (solar glass) affects cooling
    if (document.getElementById('solarGlass').checked) {
        categorySavings.cooling += categoryTotals.cooling * INTERVENTIONS.solarGlass.reduction;
    }
    
    // 2. Cat reflektif (reflective roof) affects cooling
    if (document.getElementById('reflectiveRoof').checked) {
        const roofReduction = document.getElementById('solarGlass').checked ? 0.02 : INTERVENTIONS.reflectiveRoof.reduction;
        categorySavings.cooling += categoryTotals.cooling * roofReduction;
    }
    
    // 3. Cooling system affects cooling
    const coolingSystem = document.getElementById('coolingIntervention').value;
    if (coolingSystem) {
        const coolingSystemType = document.getElementById('coolingSystem').value;
        const coolingSystemData = coolingSystemType === 'central' ? 
            INTERVENTIONS.coolingSystem[coolingSystem] : 
            INTERVENTIONS.splitCoolingSystem[coolingSystem];
        
        let coolingReduction = coolingSystemData.reduction;
        
        // Apply reduction rules if solar glass or reflective roof are selected
        if (document.getElementById('solarGlass').checked) coolingReduction -= 0.02;
        if (document.getElementById('reflectiveRoof').checked) coolingReduction -= 0.02;
        
        categorySavings.cooling += categoryTotals.cooling * coolingReduction;
    }
    
    // 4. LED lights affect lighting
    if (document.getElementById('ledLights').checked) {
        categorySavings.lighting += categoryTotals.lighting * INTERVENTIONS.ledLights.reduction;
    }
    
    // 5. Lighting control system affects lighting
    const lightingControl = document.getElementById('lightingControl').value;
    if (lightingControl) {
        categorySavings.lighting += categoryTotals.lighting * INTERVENTIONS.lightingControl[lightingControl].reduction;
    }
    
    // 6. Exhaust sensor affects ventilation
    if (document.getElementById('exhaustSensor').checked) {
        categorySavings.ventilation += categoryTotals.ventilation * INTERVENTIONS.exhaustSensor.reduction;
    }
    
    // 7. Pump system affects pump
    const pumpSystem = document.getElementById('pumpSystem').value;
    if (pumpSystem) {
        categorySavings.pump += categoryTotals.pump * INTERVENTIONS.pumpSystem[pumpSystem].reduction;
    }
    
    // 8. Water heater affects hot water
    if (document.getElementById('waterHeater').checked) {
        const waterHeaterReduction = document.getElementById('bms').checked ? 0.001 : INTERVENTIONS.waterHeater.reduction;
        categorySavings.hotWater += categoryTotals.hotWater * waterHeaterReduction;
    }
    
    // 9. BMS savings are distributed equally among cooling, lighting, ventilation, pump, and hot water
    if (document.getElementById('bms').checked) {
        let bmsReduction = document.getElementById('coolingIntervention').value ? 0.05 : INTERVENTIONS.bms.reduction;
        
        // Distribute BMS savings equally to 5 categories
        const bmsPerCategory = bmsReduction / 5;
        
        categorySavings.cooling += categoryTotals.cooling * bmsPerCategory;
        categorySavings.lighting += categoryTotals.lighting * bmsPerCategory;
        categorySavings.ventilation += categoryTotals.ventilation * bmsPerCategory;
        categorySavings.pump += categoryTotals.pump * bmsPerCategory;
        categorySavings.hotWater += categoryTotals.hotWater * bmsPerCategory;
    }
    
    // 10. EMS savings (if we need to add this later, it would go here)
    
    // Update each category's consumption and savings in the chart
    const categories = ['cooling', 'lighting', 'ventilation', 'office', 'pump', 'hotWater', 'others'];
    for (let i = 0; i < categories.length; i++) {
        const originalValue = categoryTotals[categories[i]];
        const savingsValue = categorySavings[categories[i]];
        const remainingConsumption = originalValue - savingsValue;
        
        // Update consumption
        consumptionDataset.data[i] = remainingConsumption;
        
        // Update savings
        savingsDataset.data[i] = savingsValue;
    }
    
    energyChart.update();
}

// Function to update cooling intervention options based on cooling system type
function updateCoolingInterventionOptions() {
    const coolingSystemType = document.getElementById('coolingSystem').value;
    const coolingInterventionSelect = document.getElementById('coolingIntervention');
    
    // Clear existing options except for the first one
    while (coolingInterventionSelect.options.length > 1) {
        coolingInterventionSelect.remove(1);
    }
    
    // Add appropriate options based on the cooling system type
    if (coolingSystemType === 'central') {
        // Add options for central AC
        const centralOptions = [
            { value: 'air-cooled', text: 'Mengganti Chiller Lama dengan Chiller Baru Sistem Air Cooled (28%)' },
            { value: 'water-cooled', text: 'Mengganti Chiller Lama dengan Chiller Baru Sistem Water Cooled (32%)' },
            { value: 'vrf', text: 'Mengganti Chiller Lama dengan Sistem VRF (33%)' },
            { value: 'package', text: 'Mengganti Chiller Lama dengan Sistem Cold Air Package Units (28%)' },
            { value: 'split', text: 'Mengganti Chiller Lama dengan Unit Mini Split Hemat Energi (30%)' }
        ];
        
        centralOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.text = option.text;
            coolingInterventionSelect.add(optionElement);
        });
    } else {
        // Add options for split AC
        const splitOptions = [
            { value: 'airChiller', text: 'Mengganti Semua Unit Mini Split dengan Chiller Sentral Sistem Air Cooled (28%)' },
            { value: 'waterChiller', text: 'Mengganti Semua Unit Mini Split dengan Chiller Sentral Sistem Water Cooled (32%)' },
            { value: 'vrfSystem', text: 'Mengganti Unit Mini Split dengan Sistem VRF (33%)' },
            { value: 'packageUnits', text: 'Mengganti Semua Unit Mini Split dengan Sistem Cold Air Package Units (28%)' },
            { value: 'splitUnits', text: 'Mengganti Unit Mini Split Lama dengan Unit Mini Split Hemat Energi Baru (30%)' }
        ];
        
        splitOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.text = option.text;
            coolingInterventionSelect.add(optionElement);
        });
    }
    
    // Reset investment field when cooling system type changes
    document.getElementById('coolingInvestment').value = '';
}

// Event listeners
// Function to update intervention reduction values based on multiple conditions
function updateInterventionReductions() {
    // Reset all reduction values to their original values first
    INTERVENTIONS.solarGlass.reduction = INTERVENTIONS.solarGlass.originalReduction;
    INTERVENTIONS.reflectiveRoof.reduction = INTERVENTIONS.reflectiveRoof.originalReduction;
    INTERVENTIONS.exhaustSensor.reduction = INTERVENTIONS.exhaustSensor.originalReduction;
    INTERVENTIONS.ledLights.reduction = INTERVENTIONS.ledLights.originalReduction;
    INTERVENTIONS.bms.reduction = INTERVENTIONS.bms.originalReduction;
    INTERVENTIONS.ems.reduction = INTERVENTIONS.ems.originalReduction;
    
    // Reset reductions for selectable interventions
    for (const key in INTERVENTIONS.lightingControl) {
        INTERVENTIONS.lightingControl[key].reduction = INTERVENTIONS.lightingControl[key].originalReduction;
    }
    for (const key in INTERVENTIONS.pumpSystem) {
        INTERVENTIONS.pumpSystem[key].reduction = INTERVENTIONS.pumpSystem[key].originalReduction;
    }
    for (const key in INTERVENTIONS.coolingSystem) {
        INTERVENTIONS.coolingSystem[key].reduction = INTERVENTIONS.coolingSystem[key].originalReduction;
    }
    for (const key in INTERVENTIONS.splitCoolingSystem) {
        INTERVENTIONS.splitCoolingSystem[key].reduction = INTERVENTIONS.splitCoolingSystem[key].originalReduction;
    }

    // Get the state of each intervention
    const hasSolarGlass = document.getElementById('solarGlass').checked;
    const hasReflectiveRoof = document.getElementById('reflectiveRoof').checked;
    const hasBMS = document.getElementById('bms').checked;
    
    // Check if any cooling system is selected
    const coolingSystem = document.getElementById('coolingIntervention').value;
    const hasAnyCoolingSystem = coolingSystem !== '';
    
    // Apply the conditions

    // 1. Kaca solar (Solar Glass)
    if (hasReflectiveRoof) {
        INTERVENTIONS.solarGlass.reduction = 0.06; // 6%
    }
    if (hasAnyCoolingSystem) {
        INTERVENTIONS.solarGlass.reduction = 0.02; // 2% (overrides previous rule)
    }
    
    // 2. Cat reflektif (Reflective Roof)
    if (hasSolarGlass) {
        INTERVENTIONS.reflectiveRoof.reduction = 0.02; // 2%
    }
    if (hasAnyCoolingSystem) {
        INTERVENTIONS.reflectiveRoof.reduction = 0.01; // 1% (overrides previous rule)
    }
    
    // 3. Sistem pendingin (Cooling System)
    // These changes are applied in calculateEnergySavings() when calculating the total reduction
    
    // 4. Sensor exhaust fan
    if (hasBMS) {
        INTERVENTIONS.exhaustSensor.reduction = 0.0; // 0%
    }
    
    // 5. Lampu CFL dengan LED
    if (hasBMS) {
        INTERVENTIONS.ledLights.reduction = 0.01; // 1%
    }
    
    // 6. Sistem kendali pencahayaan
    if (hasBMS) {
        // Set all lighting control options to 0%
        for (const key in INTERVENTIONS.lightingControl) {
            INTERVENTIONS.lightingControl[key].reduction = 0.0;
        }
    }
    
    // 7. Sistem pompa air
    if (hasBMS) {
        // Set all pump system options to 1%
        for (const key in INTERVENTIONS.pumpSystem) {
            INTERVENTIONS.pumpSystem[key].reduction = 0.01;
        }
    }
    
    // 8. BMS
    if (hasAnyCoolingSystem) {
        INTERVENTIONS.bms.reduction = 0.08; // 8%
    }
    
    // 9. EMS
    if (hasAnyCoolingSystem) {
        INTERVENTIONS.ems.reduction = 0.02; // 2%
    }
    
    // Update the UI to reflect the new reduction values
    document.getElementById('solarGlassReduction').textContent = (INTERVENTIONS.solarGlass.reduction * 100) + '%';
    document.getElementById('reflectiveRoofReduction').textContent = (INTERVENTIONS.reflectiveRoof.reduction * 100) + '%';
    document.getElementById('exhaustSensorReduction').textContent = (INTERVENTIONS.exhaustSensor.reduction * 100) + '%';
    document.getElementById('ledLightsReduction').textContent = (INTERVENTIONS.ledLights.reduction * 100) + '%';
    document.getElementById('bmsReduction').textContent = (INTERVENTIONS.bms.reduction * 100) + '%';
    document.getElementById('emsReduction').textContent = (INTERVENTIONS.ems.reduction * 100) + '%';
    
    // For lighting control and pump system, update the dropdown option text
    updateSelectOptionText('lightingControl', 'separate', 
        `Sistem terpisah (${(INTERVENTIONS.lightingControl.separate.reduction * 100)}%)`);
    updateSelectOptionText('lightingControl', 'central', 
        `Sistem terpusat (${(INTERVENTIONS.lightingControl.central.reduction * 100)}%)`);
    
    updateSelectOptionText('pumpSystem', 'new', 
        `Pompa air baru + frequency drive (${(INTERVENTIONS.pumpSystem.new.reduction * 100)}%)`);
    updateSelectOptionText('pumpSystem', 'retrofit', 
        `Frequency drive pada pompa yang ada (${(INTERVENTIONS.pumpSystem.retrofit.reduction * 100)}%)`);
    
    // Format the waterHeater reduction with comma as decimal separator
    const waterHeaterReductionText = (INTERVENTIONS.waterHeater.reduction * 100).toFixed(1).replace('.', ',') + '%';
    document.getElementById('waterHeaterReduction').textContent = waterHeaterReductionText;
}

// Helper function to update select option text
function updateSelectOptionText(selectId, optionValue, newText) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === optionValue) {
            select.options[i].text = newText;
            break;
        }
    }
}

// Helper function to get the base name for cooling options
function getCoolingOptionBaseName(optionValue, coolingType) {
    if (coolingType === 'central') {
        const baseLabelMap = {
            'air-cooled': 'Mengganti Chiller Lama dengan Chiller Baru Sistem Air Cooled',
            'water-cooled': 'Mengganti Chiller Lama dengan Chiller Baru Sistem Water Cooled',
            'vrf': 'Mengganti Chiller Lama dengan Sistem VRF',
            'package': 'Mengganti Chiller Lama dengan Sistem Cold Air Package Units',
            'split': 'Mengganti Chiller Lama dengan Unit Mini Split Hemat Energi'
        };
        return baseLabelMap[optionValue] || optionValue;
    } else {
        const baseLabelMap = {
            'airChiller': 'Mengganti Semua Unit Mini Split dengan Chiller Sentral Sistem Air Cooled',
            'waterChiller': 'Mengganti Semua Unit Mini Split dengan Chiller Sentral Sistem Water Cooled',
            'vrfSystem': 'Mengganti Unit Mini Split dengan Sistem VRF',
            'packageUnits': 'Mengganti Semua Unit Mini Split dengan Sistem Cold Air Package Units',
            'splitUnits': 'Mengganti Unit Mini Split Lama dengan Unit Mini Split Hemat Energi Baru'
        };
        return baseLabelMap[optionValue] || optionValue;
    }
}

// Format monthly bill with thousand separator
function formatMonthlyBill(value) {
    if (!value) return '';
    // Remove any non-numeric characters and parse
    const numericValue = parseFloat(value.toString().replace(/[^0-9]/g, ''));
    if (isNaN(numericValue) || numericValue === 0) return '';
    
    // Convert to string with no decimals
    const formatted = numericValue.toFixed(0);
    
    // Add thousand separators using dots
    return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Parse monthly bill value (removes dots)
function parseMonthlyBill(formattedValue) {
    if (!formattedValue) return 0;
    // Remove any thousand separators
    return parseFloat(formattedValue.toString().replace(/\./g, '')) || 0;
}

// Function to apply preset values
function applyPreset(preset) {
    if (preset === 'lowRise') {
        document.getElementById('width').value = 20;
        document.getElementById('length').value = 50;
        document.getElementById('floors').value = 2;
        document.getElementById('floorHeight').value = 4;
        document.getElementById('wwr').value = 40;
        document.getElementById('roofType').value = 'perisai';
        document.getElementById('roofAngleDiv').style.display = 'block';
        document.getElementById('roofAngle').value = 30;
        document.getElementById('monthlyBill').value = '33.500.000';
        document.getElementById('coolingSystem').value = 'split'; // AC Split for Tingkat Rendah
    } else if (preset === 'highRise') {
        document.getElementById('width').value = 40;
        document.getElementById('length').value = 40;
        document.getElementById('floors').value = 16;
        document.getElementById('floorHeight').value = 3.5;
        document.getElementById('wwr').value = 40;
        document.getElementById('roofType').value = 'datar';
        document.getElementById('roofAngleDiv').style.display = 'none';
        document.getElementById('monthlyBill').value = '1.000.000.000';
        document.getElementById('coolingSystem').value = 'central'; // AC Central for Tingkat Tinggi
    }
    
    // Ensure roofAngle visibility is correctly set based on roof type
    const roofType = document.getElementById('roofType').value;
    document.getElementById('roofAngleDiv').style.display = roofType === 'datar' ? 'none' : 'block';
    
    // Make sure monthly bill is properly formatted
    const monthlyBillInput = document.getElementById('monthlyBill');
    if (monthlyBillInput.value) {
        // This is already formatted, so we don't need to do anything
        // Just ensuring it's properly recognized by the system
        const numericValue = parseMonthlyBill(monthlyBillInput.value);
        console.log('Monthly bill numeric value:', numericValue);
    }

    // Update UI and recalculate
    calculateBuildingMetrics();
    // Update cooling intervention options based on the cooling system type
    updateCoolingInterventionOptions();
    updateInterventionReductions();
    calculateEnergySavings();
}

// Function to clear form data on page reload
function resetFormOnReload() {
    if (performance.navigation.type === 1) { // Check if page was reloaded
        // Clear building data
        document.getElementById('width').value = '';
        document.getElementById('length').value = '';
        document.getElementById('floors').value = '';
        document.getElementById('floorHeight').value = '';
        document.getElementById('wwr').value = '';
        document.getElementById('roofType').value = 'datar';
        document.getElementById('roofAngleDiv').style.display = 'none';
        
        // Clear system parameters
        document.getElementById('monthlyBill').value = '';
        document.getElementById('coolingSystem').value = 'split';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Clear form on reload
    resetFormOnReload();
    
    // Initial call to update the reduction values
    updateInterventionReductions();
    
    // Show/hide roof angle input based on roof type
    document.getElementById('roofType').addEventListener('change', function() {
        const roofAngleDiv = document.getElementById('roofAngleDiv');
        roofAngleDiv.style.display = this.value === 'datar' ? 'none' : 'block';
    });
    
    // Add preset button listeners
    document.getElementById('lowRisePreset').addEventListener('click', function() {
        // Remove active class from all preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        // Add active class to this button
        this.classList.add('active');
        // Apply preset
        applyPreset('lowRise');
    });
    
    document.getElementById('highRisePreset').addEventListener('click', function() {
        // Remove active class from all preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        // Add active class to this button
        this.classList.add('active');
        // Apply preset
        applyPreset('highRise');
    });
    
    // Add cooling system type change listener
    document.getElementById('coolingSystem').addEventListener('change', function() {
        updateCoolingInterventionOptions();
        calculateBuildingMetrics();
        updateInterventionReductions();
        calculateEnergySavings();
    });

    // Add input event listeners to all form inputs
    const form = document.getElementById('buildingForm');
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            calculateBuildingMetrics();
            updateInterventionReductions();
            calculateEnergySavings();
        });
    });

    // Add event listeners to intervention inputs
    const interventionInputs = document.querySelectorAll('input[type="checkbox"], #coolingIntervention, #lightingControl, #pumpSystem');
    interventionInputs.forEach(input => {
        input.addEventListener('change', function() {
            updateInterventionReductions();
            calculateEnergySavings();
        });
    });
    
    // Add event listener to emission factor dropdown
    document.getElementById('emissionFactor').addEventListener('change', function() {
        calculateEnergySavings();
    });
    
    // Add thousands separator to monthly bill input
    const monthlyBillInput = document.getElementById('monthlyBill');
    
    // Format the monthly bill when user finishes typing
    monthlyBillInput.addEventListener('blur', function() {
        if (this.value) {
            this.value = formatMonthlyBill(this.value);
        }
    });
    
    // When focusing on monthly bill, remove formatting for easier editing
    monthlyBillInput.addEventListener('focus', function() {
        const numericValue = parseMonthlyBill(this.value);
        this.value = numericValue > 0 ? numericValue : '';
    });
    
    // Add event listeners for investment inputs
    const investmentInputs = document.querySelectorAll('.investment-input');
    investmentInputs.forEach(input => {
        // Format the value when user finishes typing
        input.addEventListener('blur', function() {
            if (this.value) {
                const numericValue = parseInvestment(this.value);
                this.value = formatInvestment(numericValue);
            }
        });
        
        // When focusing, remove the formatting for easier editing
        input.addEventListener('focus', function() {
            const numericValue = parseInvestment(this.value);
            this.value = numericValue > 0 ? numericValue : '';
        });
        
        // Calculate energy savings when input changes
        input.addEventListener('input', calculateEnergySavings);
    });

    // Set investment default values
    document.getElementById('bmsInvestment').value = '855.000.000';
    document.getElementById('exhaustSensorInvestment').value = '60.000.000';
    document.getElementById('ledLightsInvestment').value = '216.000.000';
    document.getElementById('waterHeaterInvestment').value = '364.000.000';
    document.getElementById('emsInvestment').value = '165.000.000';

    // Initialize calculations and set up dynamic form elements
    updateCoolingInterventionOptions();
    calculateBuildingMetrics();
    calculateEnergySavings();
});
