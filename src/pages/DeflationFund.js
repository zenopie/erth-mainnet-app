import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import './DeflationFund.css';
import { showLoadingScreen } from '../utils/uiUtils';
import { query } from '../utils/contractUtils';

const this_contract = "secret10ea3ya578qnz02rmr7adhu2rq7g2qjg88ry2h5";
const this_hash = "7815b8b45275e14d060a553dbda6f16ac3ad6fce45adc2ec9bddad50e1e283f6";

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#8E44AD', '#F39C12', '#2ECC71'];

const allocationNames = [
  { id: '1', name: 'LP Rewards' },
  // Add more allocation names here
];

const renderCustomLegend = (props, data) => {
  const { payload } = props;
  const total = data.reduce((acc, entry) => acc + (entry.value || 0), 0);

  return (
    <ul
      style={{
        listStyleType: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      {payload.map((entry, index) => {
        const value = entry.payload.value || 0;
        const name = entry.payload.name || 'N/A';
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
        const formattedPercentage = percentage.endsWith('.0') ? parseInt(percentage) : percentage;

        return (
          <li
            key={`item-${index}`}
            style={{
              margin: '0 10px',
              color: entry.color,
              whiteSpace: 'nowrap',
            }}
          >
            {`${name} ${formattedPercentage}%`}
          </li>
        );
      })}
    </ul>
  );
};

const DeflationFund = ({ isKeplrConnected }) => {
  const [activeTab, setActiveTab] = useState('Actual');
  const [dataActual, setDataActual] = useState([]);
  const [selectedAllocations, setSelectedAllocations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isKeplrConnected) {
      if (activeTab === 'Actual') {
        fetchDataActual();
      } else if (activeTab === 'Preferred') {
        fetchUserInfo();
      }
    }
  }, [isKeplrConnected, activeTab]);

  const fetchDataActual = async () => {
    try {
      showLoadingScreen(true);
      const querymsg = { get_allocation_options: {} }; 
      const response = await query(this_contract, this_hash, querymsg);

      const transformedData = response.allocations.map((allocation) => {
        const nameMatch = allocationNames.find((item) => item.id === String(allocation.allocation_id));
        return {
          id: allocation.allocation_id,
          name: nameMatch ? nameMatch.name : `Unknown (${allocation.allocation_id})`,
          value: parseInt(allocation.amount_allocated, 10),
        };
      });

      setDataActual(transformedData);
    } catch (error) {
      console.error("Error fetching actual data:", error);
    }
    showLoadingScreen(false);
  };

  const fetchUserInfo = async () => {
    try {
      showLoadingScreen(true);
      const querymsg = { get_user_info: { address: window.secretjs.address } }; 
      const response = await query(this_contract, this_hash, querymsg);
      const transformedData = response.user_info.percentages.map((percentage) => {
        const nameMatch = allocationNames.find((item) => item.id === String(percentage.allocation_id));
        return {
          id: percentage.allocation_id,
          name: nameMatch ? nameMatch.name : `Unknown (${percentage.allocation_id})`,
          value: parseInt(percentage.percentage, 10),
        };
      });

      setSelectedAllocations(transformedData);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
    showLoadingScreen(false);
  };

  const openTab = (tabName) => {
    setActiveTab(tabName);
  };

  const addAllocation = (option) => {
    if (!selectedAllocations.find((alloc) => alloc.id === option.id)) {
      setSelectedAllocations([...selectedAllocations, { ...option, percentage: '' }]);
    }
    setShowDropdown(false);
  };

  const removeAllocation = (id) => {
    setSelectedAllocations(selectedAllocations.filter((alloc) => alloc.id !== id));
  };

  const handlePercentageChange = (id, value) => {
    setSelectedAllocations(
      selectedAllocations.map((alloc) =>
        alloc.id === id ? { ...alloc, value: value } : alloc
      )
    );
  };

  return (
    <div className="deflation-fund-box">
      <h2>Deflation Fund</h2>
      <div className="deflation-fund-tab">
        <button
          className={`tablinks ${activeTab === 'Actual' ? 'active' : ''}`}
          onClick={() => openTab('Actual')}
        >
          Actual Allocation
        </button>
        <button
          className={`tablinks ${activeTab === 'Preferred' ? 'active' : ''}`}
          onClick={() => openTab('Preferred')}
        >
          Preferred Allocation
        </button>
      </div>

      {activeTab === 'Actual' && (
        <div className="chart-box">
          <div className="canvas-container">
            <PieChart width={350} height={350}>
              <Pie
                data={dataActual}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                fill="#8884d8"
                paddingAngle={0}
                cornerRadius={2}
                startAngle={90}
                endAngle={450}
                dataKey="value"
                isAnimationActive={false}
              >
                {dataActual.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend 
                content={(props) => renderCustomLegend(props, dataActual)} 
                layout="horizontal" 
                align="center" 
                verticalAlign="bottom" 
              />
            </PieChart>
          </div>
        </div>
      )}

      {activeTab === 'Preferred' && (
        <div className="chart-box">
          <div className="canvas-container">
            <PieChart width={350} height={350}>
              <Pie
                data={selectedAllocations}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                fill="#8884d8"
                paddingAngle={0}
                cornerRadius={2}
                startAngle={90}
                endAngle={450}
                dataKey="value"
                isAnimationActive={false}
              >
                {selectedAllocations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div id="input-container">
            {selectedAllocations.map((alloc) => (
              <div key={alloc.id} className="allocation-input-group">
                <span>{alloc.name}</span>
                <input
                  type="number"
                  value={alloc.value}
                  onChange={(e) => handlePercentageChange(alloc.id, e.target.value)}
                  placeholder="%"
                />
                <button
                  className="circle-button"
                  onClick={() => removeAllocation(alloc.id)}
                >
                  -
                </button>
              </div>
            ))}
          </div>
          <div className="dropdown-container">
            <button className="circle-button" onClick={() => setShowDropdown(!showDropdown)}>
              +
            </button>
            {showDropdown && (
              <select
                onChange={(e) =>
                  addAllocation(
                    selectedAllocations.find((option) => option.id === e.target.value)
                  )
                }
              >
                <option value="">Select an option</option>
                {allocationNames.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          {selectedAllocations.length > 0 && (
            <button onClick={() => console.log('Change Allocation')} className="claim-button">
              Change
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DeflationFund;