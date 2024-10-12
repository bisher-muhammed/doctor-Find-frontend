import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Typography, Button } from "@material-tailwind/react"; // Import Button
import Chart from "react-apexcharts";
import { Square3Stack3DIcon } from "@heroicons/react/24/outline";
import axios from "axios";

function RevenueChart() {
  const [yearlyData, setYearlyData] = useState({ categories: [], series: [] });
  const [monthlyData, setMonthlyData] = useState({ categories: [], series: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMonthly, setIsMonthly] = useState(false); // State to track the current chart type

  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');

  // Fetch data from the backend when the component loads
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}/api/admin/admin/revenue/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { yearly_revenue, monthly_revenue } = response.data;

        // Get current year
        const currentYear = new Date().getFullYear();
        
        // Set up the range for the yearly chart
        const years = [];
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
          years.push(i.toString());
        }

        // Prepare yearly revenue data
        const revenueData = years.map(year => yearly_revenue[year] || 0);

        setYearlyData({
          categories: years,
          series: [{ name: "Revenue", data: revenueData }],
        });

        // Prepare monthly data to include all months
        const allMonths = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        // Create monthly revenue array initialized to 0
        const monthlyRevenueData = new Array(12).fill(0);

        // Fill in the revenue for the months with income
        Object.entries(monthly_revenue).forEach(([month, revenue]) => {
          const monthIndex = new Date(month).getMonth(); // Get index of the month (0-11)
          monthlyRevenueData[monthIndex] = revenue; // Set revenue for that month
        });

        setMonthlyData({
          categories: allMonths,
          series: [{ name: "Revenue", data: monthlyRevenueData }],
        });
      } catch (error) {
        console.error("Error fetching revenue data", error);
        setError("Failed to load revenue data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const yearlyChartConfig = {
    type: "area",
    height: 240,
    series: yearlyData.series,
    options: {
      chart: {
        toolbar: { show: false },
      },
      xaxis: {
        categories: yearlyData.categories,
        labels: {
          style: {
            colors: "#ff0000",
            fontSize: "12px",
            fontFamily: "Monospace",
            fontWeight: 400,
          },
        },
      },
      dataLabels: { enabled: false },
      colors: ["#006000"],
      stroke: { curve: "smooth" },
      tooltip: {
        theme: "dark",
        x: { show: true }, // Show year on x-axis
        y: {
          formatter: (val) => `Revenue: $${val}`, // Customize y-axis label
        },
      },
      grid: {
        show: true,
        borderColor: "#dddddd",
        strokeDashArray: 5,
        padding: { top: 5, right: 20 },
      },
    },
  };

  const monthlyChartConfig = {
    type: "bar",
    height: 240,
    series: monthlyData.series,
    options: {
      chart: {
        toolbar: { show: false },
      },
      xaxis: {
        categories: monthlyData.categories,
        labels: {
          style: {
            colors: "#ffffff",
            fontSize: "14px",
            fontFamily: "Monospace",
            fontWeight: 500,
          },
        },
      },
      plotOptions: {
        bar: {
          columnWidth: "60%", // Adjusted column width for better spacing
          borderRadius: 8, // Rounded corners for the bars
        },
      },
      dataLabels: { enabled: true, style: { colors: ["#ffffff"] } }, // Show data labels in white
      colors: ["#4B89FF"], // Updated bar color
      tooltip: {
        theme: "dark",
        x: { show: true },
        y: {
          formatter: (val) => `Revenue: $${val}`,
        },
      },
      grid: {
        show: true,
        borderColor: "#333333", // Darker grid lines
        strokeDashArray: 5,
        padding: { top: 4, right: 20 },
      },
    },
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Typography>Loading...</Typography>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <Typography color="red">{error}</Typography>
        </div>
      ) : (
        <>
          {/* Button to switch chart type */}
          <div className="flex justify-center mb-4">
            <Button 
              onClick={() => setIsMonthly(false)} 
              color={isMonthly ? "gray" : "blue"} 
              className="mr-2"
            >
              Yearly
            </Button>
            <Button 
              onClick={() => setIsMonthly(true)} 
              color={isMonthly ? "blue" : "gray"}
            >
              Monthly
            </Button>
          </div>

          <Card>
            <CardHeader floated={false} shadow={false} color="transparent">
              <div className="flex flex-col items-center">
                <Square3Stack3DIcon className="h-6 w-6" />
                <Typography variant="h6" className="ml-2">
                  {isMonthly ? "Monthly" : "Yearly"} Revenue Chart
                </Typography>
              </div>
            </CardHeader>
            <CardBody>
              {/* Conditional rendering based on isMonthly state */}
              {isMonthly ? (
                <Chart {...monthlyChartConfig} />
              ) : (
                <Chart {...yearlyChartConfig} />
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}

export default RevenueChart;
