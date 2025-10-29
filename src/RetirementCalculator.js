import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Historical S&P 500 returns (approximate annual returns including dividends)
const sp500Returns = {
  1972: 0.1588, 1973: -0.1737, 1974: -0.2964, 1975: 0.3149, 1976: 0.1918,
  1977: -0.1153, 1978: 0.0106, 1979: 0.1231, 1980: 0.2585, 1981: -0.0973,
  1982: 0.1549, 1983: 0.1706, 1984: 0.0115, 1985: 0.2633, 1986: 0.1462,
  1987: 0.0203, 1988: 0.1240, 1989: 0.2725, 1990: -0.0656, 1991: 0.2631,
  1992: 0.0446, 1993: 0.0706, 1994: -0.0154, 1995: 0.3411, 1996: 0.2026,
  1997: 0.3101, 1998: 0.2668, 1999: 0.1953, 2000: -0.1014, 2001: -0.1303,
  2002: -0.2337, 2003: 0.2638, 2004: 0.0888, 2005: 0.0300, 2006: 0.1362,
  2007: 0.0353, 2008: -0.3849, 2009: 0.2346, 2010: 0.1288, 2011: 0.0000,
  2012: 0.1341, 2013: 0.2970, 2014: 0.1139, 2015: -0.0073, 2016: 0.0996,
  2017: 0.1942, 2018: -0.0620, 2019: 0.2890, 2020: 0.1640, 2021: 0.2689,
  2022: -0.1849, 2023: 0.2426, 2024: 0.2350, 2025: 0.0500
};

// Historical Social Security wage caps and Medicare calculations
const socialSecurityCaps = {
  1972: 9000, 1973: 10800, 1974: 13200, 1975: 14100, 1976: 15300,
  1977: 16500, 1978: 17700, 1979: 22900, 1980: 25900, 1981: 29700,
  1982: 32400, 1983: 35700, 1984: 37800, 1985: 39600, 1986: 42000,
  1987: 43800, 1988: 45000, 1989: 48000, 1990: 51300, 1991: 53400,
  1992: 55500, 1993: 57600, 1994: 60600, 1995: 61200, 1996: 62700,
  1997: 65400, 1998: 68400, 1999: 72600, 2000: 76200, 2001: 80400,
  2002: 84900, 2003: 87000, 2004: 87900, 2005: 90000, 2006: 94200,
  2007: 97500, 2008: 102000, 2009: 106800, 2010: 106800, 2011: 106800,
  2012: 110100, 2013: 113700, 2014: 117000, 2015: 118500, 2016: 118500,
  2017: 127200, 2018: 128400, 2019: 132900, 2020: 137700, 2021: 142800,
  2022: 147000, 2023: 160200, 2024: 168600
};

// Calculate actual Social Security and Medicare taxes
const taxData = Object.keys(socialSecurityCaps).map(year => {
  const yearNum = parseInt(year);
  const ssCap = socialSecurityCaps[yearNum];
  
  // Assume high earner hitting SS cap + reasonable Medicare earnings
  const ssWages = ssCap; // Hit the cap
  const medicareWages = Math.min(ssCap * 1.5, 200000); // 1.5x SS cap or $200K max
  
  // Calculate taxes (employee portion only)
  const ssTax = ssWages * 0.062; // 6.2%
  const medicareTax = medicareWages * 0.0145; // 1.45%
  const employeeTax = ssTax + medicareTax;
  
  // Total with employer match
  const totalContribution = employeeTax * 2;
  
  return {
    year: yearNum,
    ssCap: ssCap,
    total: totalContribution
  };
});

const RetirementCalculator = () => {

  const calculations = useMemo(() => {
    let balance = 0;
    const yearlyData = [];
    
    taxData.forEach((data, index) => {
      const totalContribution = data.total;  // Already includes employee + employer
      const employeeTax = totalContribution / 2;  // Half is employee portion
      const employerMatch = totalContribution / 2;  // Half is employer match
      
      balance += totalContribution;
      
      const returnRate = sp500Returns[data.year] || 0;
      const yearEndBalance = balance * (1 + returnRate);
      const gain = yearEndBalance - balance;
      
      yearlyData.push({
        year: data.year,
        employeeTax: employeeTax,
        employerMatch: employerMatch,
        totalContribution: totalContribution,
        annualReturn: (returnRate * 100).toFixed(2),
        gain: gain,
        yearEndBalance: yearEndBalance
      });
      
      balance = yearEndBalance;
    });
    
    return yearlyData;
  }, []);

  const totalContributed = calculations.reduce((sum, year) => sum + year.totalContribution, 0);
  const finalBalance = calculations[calculations.length - 1]?.yearEndBalance || 0;
  const totalGain = finalBalance - totalContributed;

  const [showTable, setShowTable] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const downloadCSV = () => {
    const headers = ['Year', 'Employee Tax Paid', 'Employer Match', 'Total Contribution', 'Annual Return %', 'Investment Gain', 'Year End Balance'];
    const rows = calculations.map(row => [
      row.year,
      row.employeeTax.toFixed(2),
      row.employerMatch.toFixed(2),
      row.totalContribution.toFixed(2),
      row.annualReturn,
      row.gain.toFixed(2),
      row.yearEndBalance.toFixed(2)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'retirement_calculation.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Social Security & Medicare Tax Investment Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover what your Social Security and Medicare taxes would have grown to if invested in the S&P 500 from 1972 to 2024.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Contributed</h3>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalContributed)}</p>
            <p className="text-sm text-gray-500 mt-1">Employee + Employer Match</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Final Balance</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(finalBalance)}</p>
            <p className="text-sm text-gray-500 mt-1">With S&P 500 Returns</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Gain</h3>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(totalGain)}</p>
            <p className="text-sm text-gray-500 mt-1">Investment Growth</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Investment Growth Over Time</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calculations}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="year" 
                  className="text-sm"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  className="text-sm"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value), name]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#f9fafb', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="yearEndBalance" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Account Balance"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => setShowTable(!showTable)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg"
          >
            {showTable ? 'Hide' : 'Show'} Detailed Table
          </button>
          
          <button
            onClick={downloadCSV}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg"
          >
            Download CSV
          </button>
        </div>

        {/* Detailed Table */}
        {showTable && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Year-by-Year Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Tax</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer Match</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Contribution</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment Gain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year End Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {calculations.map((row, index) => (
                    <tr key={row.year} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(row.employeeTax)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(row.employerMatch)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(row.totalContribution)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${parseFloat(row.annualReturn) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {row.annualReturn}%
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${row.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(row.gain)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(row.yearEndBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            * This calculation assumes both employee and employer contributions were invested in the S&P 500 with historical returns. 
            Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RetirementCalculator;