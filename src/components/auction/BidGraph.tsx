import React from 'react';
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
  amount: number;
  createdAt: string;
  // Add other bid record fields as needed
}

interface Participant {
  id: string;
  name: string;
  bidRecords: BidRecord[];
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

const formatXAxis = (tickItem: string) => {
  return format(new Date(tickItem), 'HH:mm:ss');
};

const BidGraph: React.FC<BidGraphProps> = ({ participants, leadingPrice }) => {
  // Filter participants who have placed bids
  const participantsWithBids = participants.filter(
    (participant) => participant.bidRecords && participant.bidRecords.length > 0
  );

  if (participantsWithBids.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No bid data available</p>
      </div>
    );
  }

  // Flatten all bid records and sort by creation time
  const allBids = participantsWithBids
    .flatMap(participant =>
      participant.bidRecords.map(bid => ({
        ...bid,
        participantId: participant.id,
        participantName: participant.tempCompanyName || participant.name || `Participant ${participant.id.slice(0, 4)}`,
        timestamp: new Date(bid.createdAt).getTime()
      }))
    )
    .sort((a, b) => a.timestamp - b.timestamp);

  // Create data points for the chart
  const chartData = allBids.map((bid, index) => {
    const dataPoint: any = {
      name: format(new Date(bid.createdAt), 'HH:mm:ss'),
      timestamp: bid.timestamp,
      [`${bid.participantId}_amount`]: bid.amount,
      [`${bid.participantId}_name`]: bid.participantName
    };

    // Carry forward previous bids for each participant
    if (index > 0) {
      Object.assign(dataPoint, chartData[index - 1]);
      dataPoint[`${bid.participantId}_amount`] = bid.amount;
    }

    return dataPoint;
  });

  // If no bids, return early
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No bid data available</p>
      </div>
    );
  }

  // Get unique participants for legend
  const uniqueParticipants = Array.from(
    new Map(participantsWithBids.map(p => [p.id, {
      id: p.id,
      name: p.tempCompanyName || p.name || `Participant ${p.id.slice(0, 4)}`
    }])).values()
  );

  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Bid History</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            label={{ value: 'Time', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis
            label={{ value: 'Bid Amount', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number, name: string, props: any) => {
              const participantId = name.split('_')[0];
              const participantName = props.payload[`${participantId}_name`];
              return [value, participantName];
            }}
            labelFormatter={(label) => `Time: ${format(new Date(label), 'PPpp')}`}
          />
          <Legend 
            formatter={(value) => {
              const participant = uniqueParticipants.find(p => value.includes(p.id));
              return participant?.name || value;
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
          {uniqueParticipants.map((participant, index) => (
            <Line
              key={participant.id}
              type="monotone"
              dataKey={`${participant.id}_amount`}
              name={participant.id}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BidGraph;
