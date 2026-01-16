import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PrimaryHero from "../../../Components/PrimaryHead";
import CityDisplay from "../../../Components/CityDisplay";
import cities from "../../../Data/CityData";
import PrimaryBtn from "../../../Components/PrimartyBtn";
import Form from "../../ContactUs/Sections/Form";

const CityPage = () => {
  const navigate = useNavigate();
  const { citySlug } = useParams();
   const params = useParams(); // Get all params
  useEffect(() => {
    console.log("All params:", params);
    console.log("City param:", citySlug);
    console.log("Current URL:", window.location.pathname);
  }, [citySlug, params]);

  // Safely handle undefined cityName
  const city = cities.find(
    c => c.name.toLowerCase() === citySlug?.toLowerCase()
  );

  if (!city) {
    return (
      <div
        className="text-center py-20 pt-52"
      >
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          City not found
        </h1>
        {/* <button onClick={() => navigate(-1)} className="p-1 px-2 bg-gradient-to-r from-primary to-white text-secondary">Back</button> */}
        <PrimaryBtn className="" onClick={() => navigate(-1)}>Back</PrimaryBtn>
      </div>
    );
  }

  return (
    <div>
      <PrimaryHero title="City" subtitle="Presence" />
      <CityDisplay
        cityImage={city.image}
        cityName={city.name}
      />
      <Form />
    </div>
  );
};

export default CityPage;
