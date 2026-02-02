import React from "react";

const userRole = localStorage.getItem("userRole");
const userDepartment = localStorage.getItem("userDepartment");

const Headerr = () => {
  return (
    <div className="px-8 py-1.5 border-b sticky top-0 z-50 bg-white">
      <h1 className=" text-2xl font-bold capitalize">{userRole} Dashboard</h1>
      <p className="text-black/50 text-sm">{userDepartment ? userDepartment : "Welcome"}</p>
    </div>
  );
};

export default Headerr;
