/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

const StatCard = ({ title, value, icon, trend }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
      {trend && <p className="text-xs text-green-600 mt-1 font-medium">{trend}</p>}
    </div>
    <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
  </div>
);

export default StatCard;