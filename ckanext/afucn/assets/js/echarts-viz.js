// echarts-viz.js

// Namespace for the ECharts Visualization module
const EchartsViz = {
    // Configuration (can be extended)
    config: {
        ckanApiUrl: '/api/3/action/', // Adjust if CKAN API path is different
        maxRowCount: 10000,      // Increased row limit
        maxFileSizeMB: 10,        // Increased file size limit
    },

    // Store chart instances and their states
    instances: {},

    // Utility functions
    utils: {
        mbToBytes: function(mb) {
            return mb * 1024 * 1024;
        },
        normalizeValue: function(value) {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') {
              const parsed = parseFloat(value.replace(/,/g, '')); // Handle commas in numbers
              return isNaN(parsed) ? null : parsed;
            }
            return null;
        }
        // Add other common utils if needed
    },

    // Data fetching and processing
    data: {
        fetchDatasetInfo: async function(datasetSlugOrId) {
            const url = `${EchartsViz.config.ckanApiUrl}package_show?id=${datasetSlugOrId}`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`CKAN API error fetching dataset info: ${response.statusText}`);
                }
                const data = await response.json();
                if (!data.success) {
                    throw new Error(`CKAN API error: ${data.error ? data.error.message : 'Unknown error'}`);
                }
                return data.result;
            } catch (error) {
                console.error(`Error fetching dataset info for ${datasetSlugOrId}:`, error);
                throw error; // Re-throw to be caught by the caller
            }
        },

        fetchResourceData: async function(resourceUrl) {
            const maxFileSizeBytes = EchartsViz.utils.mbToBytes(EchartsViz.config.maxFileSizeMB);

            try {
                // First, try a HEAD request to check if the resource exists and get headers
                const headResponse = await fetch(resourceUrl, { method: 'HEAD' });
                console.log(`HEAD request status for ${resourceUrl}: ${headResponse.status}`);

                if (!headResponse.ok) {
                    // If HEAD request fails, log the error and try GET anyway,
                    // as HEAD might not be supported or configured correctly.
                    console.warn(`HEAD request failed for ${resourceUrl} with status ${headResponse.status}. Proceeding with GET request.`);
                    // It might be useful to throw an error here if HEAD is expected to work,
                    // depending on server configuration and requirements.
                    // throw new Error(`Resource not found or accessible (HEAD failed): ${headResponse.status}`);
                }

                // Proceed with GET request to fetch actual data
                const response = await fetch(resourceUrl);
                console.log(`GET request status for ${resourceUrl}: ${response.status}`);

                if (!response.ok) {
                    throw new Error(`HTTP error fetching resource: ${response.statusText}`);
                }

                const contentType = response.headers.get('content-type') || '';
                const urlLower = resourceUrl.toLowerCase();

                if (urlLower.endsWith('.csv') || contentType.includes('csv')) {
                    const text = await response.text();
                    return EchartsViz.data.parseCSV(text);
                } else if (urlLower.endsWith('.xlsx') || urlLower.endsWith('.xls') || contentType.includes('excel') || contentType.includes('spreadsheetml.sheet')) {
                    const buffer = await response.arrayBuffer();
                    return EchartsViz.data.parseExcel(buffer);
                } else {
                    throw new Error(`Unsupported file format: ${contentType || 'unknown'} (URL: ${resourceUrl})`);
                }
            } catch (error) {
                console.error(`Error fetching or processing resource ${resourceUrl}:`, error);
                throw error;
            }
        },

        parseCSV: function(csvText) {
            return new Promise((resolve, reject) => {
                // Check if PapaParse is loaded
                if (typeof Papa === 'undefined') {
                    return reject(new Error('PapaParse library is required but not loaded.'));
                }
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: function(results) {
                        if (results.errors && results.errors.length > 0) {
                             console.warn("CSV Parsing warnings/errors:", results.errors);
                            // Decide if errors are critical, for now, let's proceed but log
                        }
                        if (!results.data || results.data.length === 0) {
                            return reject(new Error('CSV parsing resulted in no data. Check file format and content.'));
                        }
                        if (results.data.length > EchartsViz.config.maxRowCount) {
                             return reject(new Error(`Dataset exceeded maximum row count of ${EchartsViz.config.maxRowCount}.`));
                        }
                        resolve(results.data);
                    },
                    error: function(error) {
                        console.error("Critical CSV parsing error:", error);
                        reject(new Error(`Failed to parse CSV data: ${error.message}`));
                    }
                });
            });
        },

        parseExcel: function(arrayBuffer) {
             return new Promise((resolve, reject) => {
                 // Check if XLSX is loaded
                 if (typeof XLSX === 'undefined') {
                    return reject(new Error('XLSX library (SheetJS) is required but not loaded.'));
                 }
                try {
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' }); // Specify type as 'array'
                    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                        return reject(new Error('Excel file contains no sheets.'));
                    }
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null }); // Use defval: null for empty cells

                    if (data.length === 0) {
                         return reject(new Error('Excel sheet parsing resulted in no data.'));
                    }
                     if (data.length > EchartsViz.config.maxRowCount) {
                        return reject(new Error(`Dataset exceeded maximum row count of ${EchartsViz.config.maxRowCount}.`));
                     }
                    resolve(data);
                } catch (error) {
                    console.error("Error parsing Excel:", error);
                    reject(new Error(`Failed to parse Excel data: ${error.message}`));
                }
            });
        },

        filterData: function(data, filters) {
            if (!filters || Object.keys(filters).length === 0) {
                return data; // No filters applied
            }
            return data.filter(row => {
                return Object.entries(filters).every(([key, value]) => {
                    // Ensure the row has the property and the value matches (case-insensitive for strings)
                     if (row.hasOwnProperty(key) && row[key] !== null && row[key] !== undefined) {
                        const rowValue = String(row[key]).trim();
                        const filterValue = String(value).trim();
                        // Basic equality check, potentially needs improvement for numeric types etc.
                        // Using String comparison for flexibility, assuming filters come as strings.
                        return rowValue.toLowerCase() === filterValue.toLowerCase();
                    }
                    return false; // Row doesn't have the key or value is null/undefined
                });
            });
        }
    },

    // Chart rendering
    charts: {
        renderChart: function(instanceId, chartOptions) {
            const instance = EchartsViz.instances[instanceId];
            if (!instance || !instance.chartInstance) {
                console.error(`Chart instance ${instanceId} not found or not initialized.`);
                return;
            }

            try {
                // Check if echarts is loaded
                if (typeof echarts === 'undefined') {
                    throw new Error('ECharts library is required but not loaded.');
                }

                // Add safety net to ensure element has size before rendering
                const dom = instance.chartInstance.getDom();
                const box = dom.getBoundingClientRect();

                if (box.width === 0 || box.height === 0) {
                    // try again on the next frame
                    requestAnimationFrame(() => EchartsViz.charts.renderChart(instanceId, chartOptions));
                    return;
                }

                instance.chartInstance.clear();
                instance.chartInstance.setOption(chartOptions, true); // true to clear previous options
            } catch (error) {
                console.error(`Error setting ECharts options for ${instanceId}:`, error);
                EchartsViz.ui.setError(instanceId, `Failed to render chart: ${error.message}`);
            }
        }
        // REMOVED getTrendChartOptions and getBarChartOptions helpers
    },

    // UI state management
    ui: {
        setState: function(instanceId, state) { // states: 'loading', 'loaded', 'error'
            const container = document.getElementById(instanceId);
            if (container) {
                container.classList.remove('loading', 'loaded', 'error');
                container.classList.add(state);
                if (EchartsViz.instances[instanceId]) {
                    EchartsViz.instances[instanceId].state = state;
                }
                 // Ensure chart resizes correctly when container becomes visible
                 if (state === 'loaded' && EchartsViz.instances[instanceId] && EchartsViz.instances[instanceId].chartInstance) {
                     // Use a small delay to allow layout adjustments
                     setTimeout(() => {
                        try {
                            if (EchartsViz.instances[instanceId].chartInstance) { // Check again if it still exists
                                EchartsViz.instances[instanceId].chartInstance.resize();
                            }
                        } catch(e) {
                            console.warn(`Could not resize chart ${instanceId}:`, e);
                        }
                    }, 50);
                 }
            }
        },
        setError: function(instanceId, message) {
            const container = document.getElementById(instanceId);
             if (container) {
                const errorElement = container.querySelector('.echart-viz-error p');
                if (errorElement) {
                    errorElement.textContent = message || 'An unknown error occurred.';
                }
                EchartsViz.ui.setState(instanceId, 'error');
             }
        }
    },

    // Initialization function called from Jinja snippet
    init: async function(instanceId, config) {
         // Basic check for container and required config elements
         const container = document.getElementById(instanceId);
         if (!container) {
            console.error(`EchartsViz: Container element with ID '${instanceId}' not found.`);
            return;
         }
         const chartElement = container.querySelector('.echart-viz-chart');
          if (!chartElement) {
             console.error(`EchartsViz (${instanceId}): Chart element with class '.echart-viz-chart' not found inside container.`);
             EchartsViz.ui.setError(instanceId, 'Chart container structure is incorrect.');
             return;
          }
          if (!config || !config.datasetSlug) {
             console.error(`EchartsViz (${instanceId}): Configuration object with 'datasetSlug' is required.`);
             EchartsViz.ui.setError(instanceId, 'Chart configuration is missing dataset slug.');
             return;
          }
          // CRITICAL: Check for the getChartOptions function passed in config
          if (!config.getChartOptions || typeof config.getChartOptions !== 'function') {
            console.error(`EchartsViz (${instanceId}): Configuration object must include a 'getChartOptions' function.`);
            EchartsViz.ui.setError(instanceId, 'Chart configuration is missing options generator.');
            return;
          }

        // Initialize instance state
        EchartsViz.instances[instanceId] = {
            config: config,
            state: 'loading',
            chartInstance: null,
            rawData: null,
            filteredData: null
        };

        EchartsViz.ui.setState(instanceId, 'loading');

        try {
            // 1. Get Dataset Info using datasetSlug
            const datasetInfo = await EchartsViz.data.fetchDatasetInfo(config.datasetSlug);
            if (!datasetInfo.resources || datasetInfo.resources.length === 0) throw new Error('Dataset has no resources.');
            
            // Find first resource that is CSV or Excel
            const resource = datasetInfo.resources.find(r => {
                const url = r.url.toLowerCase();
                const format = (r.format || '').toLowerCase();
                return url.endsWith('.csv') || url.endsWith('.xlsx') || url.endsWith('.xls') ||
                       format === 'csv' || format === 'xlsx' || format === 'xls';
            });
            
            if (!resource) throw new Error('No CSV or Excel resources found in dataset.');
            if (!resource.url) throw new Error('Selected resource has no URL.');

            // --> START: Add Source/Organization to Footer
            let sourceOrOrgText = 'Not specified'; // Default text (Removed _() wrapper)
            if (datasetInfo.source) {
                sourceOrOrgText = datasetInfo.source;
            } else if (datasetInfo.organization && datasetInfo.organization.title) {
                sourceOrOrgText = datasetInfo.organization.title;
            }
            const sourceElement = container.querySelector('.echart-viz-source-value');
            if (sourceElement) {
                // Construct the dataset URL
                const datasetUrl = `/dataset/${datasetInfo.name}`; // Assumes datasetInfo.name is the slug
                // Set innerHTML to create a link
                sourceElement.innerHTML = `<a href="${datasetUrl}" target="_blank" rel="noopener noreferrer">${sourceOrOrgText}</a>`;
            } else {
                console.warn(`EchartsViz (${instanceId}): Could not find source element '.echart-viz-source-value'.`);
            }
            // <-- END: Add Source/Organization to Footer

            // Use the direct resource URL provided by CKAN API
            const resourceUrl = resource.url;
            // const resourceUrl = `${ckan.SITE_ROOT}/dataset/${resource.package_id}/resource/${resource.id}/download/${resource.name}`;
            console.log(`Attempting to fetch data from: ${resourceUrl}`);

            // 2. Fetch and Parse Resource Data
            const rawData = await EchartsViz.data.fetchResourceData(resourceUrl);
            EchartsViz.instances[instanceId].rawData = rawData;

            // 4. Apply Basic Filters (read from config.filters)
            const filters = config.filters || {}; // Filters come from the snippet via config
            const filteredData = EchartsViz.data.filterData(rawData, filters);
            EchartsViz.instances[instanceId].filteredData = filteredData;

            // 5. Initialize EChart Instance
            try {
                 if (EchartsViz.instances[instanceId].chartInstance) {
                     EchartsViz.instances[instanceId].chartInstance.dispose();
                 }
                 if (typeof echarts === 'undefined') throw new Error('ECharts library not loaded.');
                 // Initialize with the 'walden' theme
                 EchartsViz.instances[instanceId].chartInstance = echarts.init(chartElement, 'walden');
                 // Setup resize listener
                 const resizeHandler = () => {
                     if (EchartsViz.instances[instanceId] && EchartsViz.instances[instanceId].chartInstance) {
                         try { EchartsViz.instances[instanceId].chartInstance.resize(); }
                         catch (e) { window.removeEventListener('resize', resizeHandler); }
                     }
                 };
                 window.addEventListener('resize', resizeHandler);
                 EchartsViz.instances[instanceId].resizeHandler = resizeHandler;
            } catch (e) {
                 throw new Error(`Failed to initialize ECharts: ${e.message}`);
            }

            // 6. Get Chart Options using the provided function
            const chartTitle = config.title || '';
            let chartOptions;
            try {
                // Call the function passed from the snippet
                chartOptions = config.getChartOptions(filteredData, chartTitle);
            } catch (e) {
                console.error(`EchartsViz (${instanceId}): Error executing provided getChartOptions function:`, e);
                throw new Error(`Error in chart option generation: ${e.message}`);
            }
            if (!chartOptions || typeof chartOptions !== 'object') {
                throw new Error('getChartOptions function did not return a valid options object.');
            }

            // 7. Set state to loaded FIRST, then render chart
            EchartsViz.ui.setState(instanceId, 'loaded');
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                EchartsViz.charts.renderChart(instanceId, chartOptions);
            }, 50);

        } catch (error) {
            console.error(`EchartsViz (${instanceId}): Initialization failed.`, error);
            EchartsViz.ui.setError(instanceId, `Error initializing chart: ${error.message}`);
        }
    }
}; 