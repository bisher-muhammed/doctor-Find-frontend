import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';

const ApexChart = () => {
    const [series, setSeries] = useState([]); // State to hold the revenue amounts
    const baseURL = import.meta.env.VITE_REACT_APP_API_URL;
    const token = localStorage.getItem('access');

    const [options, setOptions] = useState({
        chart: {
            width: '100%',
            type: 'pie',
            toolbar: { show: false }, // Disable the toolbar for cleaner UI
        },
        labels: [], // State to hold the doctor specifications
        colors: ['#FF4560', '#008FFB', '#00E396', '#775DD0', '#FEB019'], // Custom colors for each slice
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 300,
                },
                legend: {
                    position: 'bottom',
                },
            },
        }],
        legend: {
            position: 'right',
            floating: false,
        },
        tooltip: {
            enabled: true, // Ensure tooltip is enabled
            shared: true, // Allow tooltip to show multiple values
            intersect: false, // Show tooltip even if the mouse is not directly over the slice
            y: {
                formatter: (val) => `Revenue: ₹${val !== undefined ? val : 0}`, // Format tooltip to display revenue
            },
        },
        dataLabels: {
            enabled: true, // Enable data labels
            formatter: (val, opts) => {
                const label = opts.w.globals.labels[opts.dataPointIndex];
                // Ensure we display a valid value and avoid undefined
                return `${label}: ₹${val !== undefined ? val : 0}`; 
            },
        },
        title: {
            text: 'Revenue by Doctor Specification', // Add a title to the chart
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333'
            },
        },
    });

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                const response = await axios.get(`${baseURL}/api/admin/admin/revenue/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const { revenue_by_specialties } = response.data;
                console.log('Revenue Data:', revenue_by_specialties);

                // Ensure the data is valid
                if (revenue_by_specialties) {
                    const newSeries = Object.values(revenue_by_specialties).map(value => {
                        // Ensure each value is a number
                        return typeof value === 'number' ? value : 0;
                    });
                    const newLabels = Object.keys(revenue_by_specialties);

                    console.log('New Series:', newSeries);
                    console.log('New Labels:', newLabels);

                    setSeries(newSeries);
                    setOptions((prevOptions) => ({
                        ...prevOptions,
                        labels: newLabels, // Set the labels for the pie chart
                    }));
                } else {
                    console.error('No revenue data found');
                }
            } catch (error) {
                console.error('Error fetching revenue data:', error);
            }
        };

        fetchRevenueData();
    }, [baseURL, token]); // Added dependencies

    return (
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md">
            <div id="chart" style={{ width: '100%', height: '400px' }}>
                <ReactApexChart options={options} series={series} type="pie" width="100%" />
            </div>
            <div id="html-dist"></div>
        </div>
    );
};

export default ApexChart;
