import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format } from 'date-fns';

interface BidRecord {
  id: string;
  bidAmount: number;
  bidPercentage: number;
  count: number;
  createdAt: string;
  bidItems: Array<{
    id: string;
    rate: number;
    price: number;
    tax: number;
    taxPercent: number;
    finalPrice: number;
    installationPrice: number;
    installationPricePercent: number;
    installationTax: number;
    auctionItemId: string;
    auctionItem: {
      id: string;
      itemsSheetId: string;
      data: Record<string, any>;
      isEditable: boolean;
      isPreferred: boolean;
    };
  }>;
}

interface Vendor {
  id: string;
  vendorCode: string;
  email: string;
  tempName: string;
  tempCompanyName: string;
  tempCity: string;
  phone: string | null;
}

interface Participant {
  id: string;
  name: string;
  rank: number;
  response: string;
  auctionResult: string;
  status: string;
  bidRecords: BidRecord[];
  vendor?: Vendor;
  tempCompanyName?: string;
}

interface BidGraphProps {
  participants: Participant[];
  leadingPrice?: number;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', 
  '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'
];
const formatXAxis = (tickItem: number) => {
  return format(new Date(tickItem), 'HH:mm:ss');
};

interface ParticipantVisibility {
  [key: string]: boolean;
}

const BidGraph: React.FC<BidGraphProps> = ({ participants, leadingPrice }) => {
  const [viewMode, setViewMode] = useState<'time' | 'bid'>('time');
  const [hiddenParticipants, setHiddenParticipants] = useState<ParticipantVisibility>({});

  // Process bid data with useMemo to avoid unnecessary recalculations
  const { chartData, participantsWithBids } = useMemo(() => {
    // Get participants with bids
    const participantsWithBids = participants.filter(
      (participant) => participant.bidRecords && participant.bidRecords.length > 0
    );

    // If no participants with bids, return empty data
    if (participantsWithBids.length === 0) {
      const now = new Date().getTime();
      return {
        chartData: [
          { name: format(now, 'HH:mm:ss'), timestamp: now - 60000 },
          { name: format(now, 'HH:mm:ss'), timestamp: now }
        ],
        participantsWithBids: []
      };
    }

    // Flatten all bid records and sort by creation time
    const allBids = participantsWithBids
      .flatMap(participant =>
        (participant.bidRecords || []).map((bid, index) => ({
          ...bid,
          participantId: participant.id,
          participantName: participant.vendor?.tempCompanyName || participant.name || `Participant ${participant.id.slice(0, 4)}`,
          timestamp: new Date(bid.createdAt).getTime(),
          bidIndex: index
        }))
      )
      .sort((a, b) => a.timestamp - b.timestamp);

    // Create data points for the chart
    const chartData: any[] = [];
    const lastBids: Record<string, any> = {};

    allBids.forEach((bid, index) => {
      const dataPoint: any = {
        name: format(bid.timestamp, 'HH:mm:ss'),
        timestamp: bid.timestamp,
        bidIndex: index,
        [`${bid.participantId}_amount`]: bid.bidAmount,
        [`${bid.participantId}_name`]: bid.participantName
      };

      // Carry forward previous bids for each participant
      Object.entries(lastBids).forEach(([key, value]) => {
        if (!dataPoint[key]) {
          dataPoint[key] = value;
        }
      });
      
      // Update the current participant's bid
      dataPoint[`${bid.participantId}_amount`] = bid.bidAmount;
      lastBids[`${bid.participantId}_amount`] = bid.bidAmount;
      lastBids[`${bid.participantId}_name`] = bid.participantName;
      
      chartData.push(dataPoint);
    });

    return { chartData, participantsWithBids };
  }, [participants]);

  // Process chart data based on view mode
  const processedData = useMemo(() => {
    if (viewMode === 'bid') {
      // For bid-wise view, create a point for each bid
      const allBids: any[] = [];
      const bidCountMap = new Map<string, number>(); // participantId -> bid count
      
      // First, sort all data points by timestamp
      const sortedData = [...chartData].sort((a, b) => a.timestamp - b.timestamp);
      
      // Process each data point to extract individual bids
      sortedData.forEach(point => {
        // Find all participant bids in this point
        const bidsInPoint = Object.entries(point)
          .filter(([key]) => key.endsWith('_amount') && point[key] !== undefined)
          .map(([key, amount]) => {
            const participantId = key.replace('_amount', '');
            const bidCount = (bidCountMap.get(participantId) || 0) + 1;
            bidCountMap.set(participantId, bidCount);
            
            return {
              participantId,
              amount,
              participantName: point[`${participantId}_name`],
              bidCount,
              timestamp: point.timestamp,
              name: `Bid ${bidCount}`
            };
          });
        
        // Add a data point for each bid
        bidsInPoint.forEach(bid => {
          const dataPoint: any = {
            ...point,
            name: `Bid ${bid.bidCount}`,
            bidCount: bid.bidCount,
            timestamp: bid.timestamp,
            [`${bid.participantId}_amount`]: bid.amount,
            [`${bid.participantId}_name`]: bid.participantName,
            _bidParticipant: bid.participantId,
            _bidAmount: bid.amount
          };
          
          allBids.push(dataPoint);
        });
      });
      
      return allBids;
    }
    
    // For time-wise view, use the original data
    return chartData;
  }, [chartData, viewMode]);

  // Handle empty state
  const isEmpty = chartData.length === 0 || participantsWithBids.length === 0;
  if (isEmpty) {
    const now = new Date().getTime();
    const emptyData = [
      { name: format(now, 'HH:mm:ss'), timestamp: now - 60000 },
      { name: format(now, 'HH:mm:ss'), timestamp: now }
    ];
    
    return (
      <div className="w-full h-[400px] bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Bid History</h3>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart
            data={viewMode === 'time' ? emptyData : []}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              label={{ value: 'Time', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              domain={[0, 1000]}
              label={{ value: 'Bid Amount', angle: -90, position: 'insideLeft' }}
            />
            <text 
              x="50%" 
              y="50%" 
              textAnchor="middle" 
              dominantBaseline="middle"
              className="text-gray-500"
            >
              No bids have been placed yet
            </text>
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Get unique participants for legend
  const uniqueParticipants = useMemo(() => {
    let participantsList;
    
    // If in bid-wise view, get participants from the processed data
    if (viewMode === 'bid' && processedData.length > 0) {
      const participantMap = new Map<string, {id: string, name: string}>();
      
      processedData.forEach(point => {
        if (point._bidParticipant) {
          const participantId = point._bidParticipant;
          if (!participantMap.has(participantId)) {
            participantMap.set(participantId, {
              id: participantId,
              name: point[`${participantId}_name`] || `Participant ${participantId.slice(0, 4)}`
            });
          }
        }
      });
      
      participantsList = Array.from(participantMap.values());
    } else {
      // For time-wise view or no data, use participantsWithBids
      participantsList = Array.from(
        new Map(participantsWithBids.map(p => [p.id, {
          id: p.id,
          name: p.vendor?.tempCompanyName || p.name || `Participant ${p.id.slice(0, 4)}`
        }])).values()
      );
    }
    
    // Initialize visibility for new participants
    const newHiddenParticipants = { ...hiddenParticipants };
    let needsUpdate = false;
    
    participantsList.forEach(participant => {
      if (newHiddenParticipants[participant.id] === undefined) {
        newHiddenParticipants[participant.id] = false; // Default to visible
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) {
      // Use setTimeout to avoid state update during render
      setTimeout(() => setHiddenParticipants(newHiddenParticipants), 0);
    }
    
    return participantsList;
  }, [participantsWithBids, viewMode, processedData, hiddenParticipants]);

  return (
    <div className="w-full h-[450px] bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Bid History</h3>
        <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={processedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={viewMode === 'time' ? 'timestamp' : 'bidCount'}
            tickFormatter={(value: number) => {
              if (viewMode === 'time') return formatXAxis(value);
              return `Bid ${value}`;
            }}
            label={{ 
              value: viewMode === 'time' ? 'Time' : 'Bid Number',
              position: 'insideBottomRight',
              offset: -5
            }}
          />
          <YAxis
            label={{ value: 'Bid Amount', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: any, name: string | number, props: any) => {
              const participantId = typeof name === 'string' ? name.replace('_amount', '') : '';
              const participantName = props.payload?.[`${participantId}_name`] || 
                                   (typeof participantId === 'string' ? `Participant ${participantId.slice(0, 4)}` : '');
              return [`${value}`, participantName];
            }}
            labelFormatter={(label: any, payload: any) => {
              if (viewMode === 'time' && typeof label === 'number') {
                return formatXAxis(label);
              }
              // For bid-wise view, show the bid count and participant name if available
              const bidData = payload?.[0]?.payload;
              if (bidData?._bidParticipant) {
                const participantName = bidData[`${bidData._bidParticipant}_name`] || 
                                      `Participant ${String(bidData._bidParticipant).slice(0, 4)}`;
                return `Bid ${bidData.bidCount} - ${participantName}`;
              }
              return `Bid ${label}`;
            }}
          />
          <Legend 
            onClick={(e: any) => {
              const participantId = (e.value as string)?.split('_amount')[0];
              if (participantId) {
                setHiddenParticipants(prev => ({
                  ...prev,
                  [participantId]: !prev[participantId]
                }));
              }
            }}
            formatter={(value: any) => {
              const participant = uniqueParticipants.find(p => String(value).includes(p.id));
              const participantId = participant?.id || '';
              const isHidden = hiddenParticipants[participantId];
              
              return (
                <span style={{ 
                  cursor: 'pointer',
                  opacity: isHidden ? 0.5 : 1,
                  textDecoration: isHidden ? 'line-through' : 'none'
                }}>
                  {participant?.name || value}
                </span>
              );
            }}
          />
          {leadingPrice && (
            <ReferenceLine 
              y={leadingPrice} 
              label={`Leading Price: ${leadingPrice}`} 
              stroke="#ff7300"
              strokeDasharray="3 3"
            />
          )}
          {uniqueParticipants.map((participant, index) => {
            if (hiddenParticipants[participant.id]) return null;
            const color = COLORS[index % COLORS.length];
            return (
              <Line
                key={participant.id}
                type="monotone"
                dataKey={`${participant.id}_amount`}
                name={`${participant.id}_amount`}
                stroke={color}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
                hide={hiddenParticipants[participant.id]}
              />
            );
          })}</LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const ViewModeToggle: React.FC<{
  viewMode: 'time' | 'bid';
  onChange: (mode: 'time' | 'bid') => void;
}> = ({ viewMode, onChange }) => (
  <div className="flex items-center space-x-2">
    <span className="text-sm font-medium text-gray-700">View:</span>
    <div className="inline-flex rounded-md shadow-sm" role="group">
      <button
        type="button"
        onClick={() => onChange('time')}
        className={`px-3 py-1 text-sm font-medium rounded-l-lg border ${
          viewMode === 'time' 
            ? 'bg-blue-600 text-white border-blue-600' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        Time-wise
      </button>
      <button
        type="button"
        onClick={() => onChange('bid')}
        className={`px-3 py-1 text-sm font-medium rounded-r-lg border ${
          viewMode === 'bid' 
            ? 'bg-blue-600 text-white border-blue-600' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        Bid-wise
      </button>
    </div>
  </div>
);

export default BidGraph;
