# Retirement Calculator

This React application calculates what your Social Security and Medicare taxes would have grown to if invested in the S&P 500.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

## Features

- Year-by-year investment tracking from 1972-2024
- Historical S&P 500 returns
- Interactive chart visualization
- CSV export functionality
- Includes both employee and employer contributions
- Responsive design with Tailwind CSS

## Technologies

- React 18
- Recharts for data visualization
- Tailwind CSS for styling

## How It Works

The calculator takes historical Social Security and Medicare tax data and simulates what would have happened if those contributions (both employee and employer portions) were invested in the S&P 500 index instead.

Key assumptions:
- Both employee and employer contributions are invested
- Historical S&P 500 returns include dividends
- Annual rebalancing is assumed
- No fees or taxes on investment gains

## Data Sources

- Historical S&P 500 returns (1972-2024)
- Social Security and Medicare tax contribution limits and actual contributions
- Tax data includes both employee portion and employer matching

## Development

To set up Tailwind CSS (if not already configured):

```bash
npx tailwindcss init -p
```

The application uses a gradient background and responsive design optimized for both desktop and mobile viewing.

## License

MIT License