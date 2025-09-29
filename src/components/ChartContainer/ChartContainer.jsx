import React from 'react';

const ChartContainer = ({ type, data, title }) => {
    if (type === 'bar') {
        return (
            <div>
                <h3>{title}</h3>
                {data.map((item, index) => (
                    <div key={index} className="chart-bar">
                        <div className="chart-bar-fill" style={{ width: `${item.value}%` }}>
                            {item.value}%
                        </div>
                        <div className="chart-labels">
                            <span className="chart-label">{item.label}</span>
                            <span className="chart-label">{item.details}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    } else if (type === 'pie') {
        // Cálculo de porcentajes acumulados para el gradiente cónico
        let cumulativePercentage = 0;
        const gradientStops = data.map(item => {
            const start = cumulativePercentage;
            cumulativePercentage += item.value;
            return `${item.color} ${start}% ${cumulativePercentage}%`;
        }).join(', ');

        return (
            <div>
                <h3>{title}</h3>
                <div className="pie-chart" style={{ background: `conic-gradient(${gradientStops})` }}></div>
                <div className="chart-labels">
                    {data.map((item, index) => (
                        <span key={index} className="chart-label">{item.label}: {item.value}%</span>
                    ))}
                </div>
            </div>
        );
    }
    return <div>Tipo de gráfico no soportado</div>;
};

export default ChartContainer;