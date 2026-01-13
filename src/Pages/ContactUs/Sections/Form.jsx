import React from "react";
import BottomLine from "../../../Components/BottomLine";
import { MdAddCall, MdEmail } from "react-icons/md";
import { FaFacebookF, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { TiSocialInstagram } from "react-icons/ti";
import { Link } from "react-router-dom";
import PrimaryBtn from "../../../Components/PrimartyBtn";
import LeftBottom from "../../../assets/ContactPageImg/LeftBottom.svg";
import RightTop from "../../../assets/ContactPageImg/RightTop.svg";
import RightBottom from "../../../assets/ContactPageImg//RightBottom.svg";
import LeftTop from "../../../assets/ContactPageImg/LeftTop.svg";
import PrimaryBg from "../../../Components/PrimaryBg";
import PrimaryObject from "../../../Components/PrimaryObject";
import src from "../../../assets/Obj2.svg";

const Social  = [
  {
    id: 1,
    icon: <FaFacebookF />,
    Link: "https://www.facebook.com/profile.php?id=61577085965987",
  },
  {
    id: 2,
    icon: <RiTwitterXFill />,
    Link: "https://twitter.com/",
  },
  {
    id: 3,
    icon: <FaWhatsapp />,
    Link: "https://api.whatsapp.com/send/?phone=919624150967&text&type=phone_number&app_absent=0",
  },
  {
    id: 4,
    icon: <TiSocialInstagram />,
    Link: "https://www.instagram.com/vernoxy_media/",
  },
  {
    id: 5,
    icon: <FaLinkedinIn />,
    Link: "https://www.linkedin.com/",
  },
];

const Form = () => {
  // Capture Form Data
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    message: "",
  });
  // Capture Form Data Change
  

  // Error Message
  const [errors, setErrors] = React.useState({});

  // Reset Form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  // Update State When User Types
 const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

React.useEffect(() => {
}, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    // Validate form data here
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.message) newErrors.message = "Message is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    resetForm();
  };

  return (
    <section className="relative overflow-hidden">
      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-y-28 relative">
        {/* Background elements */}
        <PrimaryBg className="absolute pr-[65rem] -top-52 -z-20" />
        <PrimaryBg className="absolute pl-[60rem] -bottom-48 -z-20" />

        {/* Contact Details (always above background) */}
        <div className="text-start md:w-[86%] lg:w-[75%] space-y-6 relative z-10">
          <p>
            Have questions or want to elevate your brand’s digital presence? Our
            team at [Vernoxy Media] is here to help. Whether it’s creative
            design, strategic marketing, or innovative digital solutions, we’re
            ready to listen and craft a plan tailored to your goals.
          </p>
          <BottomLine />

          {/* icons and text */}
          <div className="py-5 space-y-6">
            {/* Call */}
            <div className="flex gap-4 items-center">
              <MdAddCall className="border-2 border-primary rounded-full p-4 text-7xl" />
              <div>
                <p>GIVE US A CALL</p>
                <a
                  href="tel:+91 96241 50967"
                  className="text-2xl md:text-3xl font-Bai_Jamjuree font-extrabold"
                >
                  + 91 96241 50967
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4 items-center">
              <MdEmail className="border-2 border-primary rounded-full p-4 text-7xl" />
              <div>
                <p>SEND US A MESSAGE</p>
                <a
                  href="mailto:vernoxyM@gmail.com"
                  className="text-2xl md:text-3xl font-Bai_Jamjuree font-extrabold"
                >
                  vernoxyM@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Social Network */}
          <div>
            <p className="font-bold mb-3">SOCIAL NETWORK</p>
            <div className="flex gap-6">
              {Social .map((item) => (
                <a
                  href={item.Link}
                  target="_blank"
                  rel="noreferrer noopenner"
                  key={item.id}
                  className="text-3xl text-primary hover:text-white duration-300 transition-colors"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-6 md:p-12 relative z-10">
          {/* Decorative corners */}
          <img
            src={LeftTop}
            alt=""
            className="absolute left-0 top-0 object-contain -z-10"
          />
          <img
            src={LeftBottom}
            alt=""
            className="absolute left-0 bottom-0 object-contain -z-10"
          />
          <img
            src={RightTop}
            alt=""
            className="absolute right-0 top-0 object-contain -z-10"
          />
          <img
            src={RightBottom}
            alt=""
            className="absolute right-0 bottom-0 object-contain -z-10"
          />

          <div className="h-full bg-[#464646]/50 p-5 md:p-10 rounded-sm relative z-10 backdrop-blur-md">
            <p className="font-Bai_Jamjuree text-2xl md:text-3xl">
              Contact Form
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-5">
              <input
                name="name"
                type="text"
                placeholder="Name"
                className="input-style"
                onChange={handleChange}
                value={formData.name}
                required
                {...(errors.name && { "aria-invalid": true })}
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="input-style"
                onChange={handleChange}
                value={formData.email}
                required
                {...(errors.email && { "aria-invalid": true })}
              />
              <textarea
                name="message"
                rows="5"
                placeholder="Message"
                className="input-style"
                onChange={handleChange}
                value={formData.message}
                required
                {...(errors.message && { "aria-invalid": true })}
              ></textarea>
              <PrimaryBtn type="submit">Send Message</PrimaryBtn>
            </form>
          </div>
        </div>
      </div>

      {/* Floating decorative object */}
      <PrimaryObject src={src} className="absolute -top-14 right-0 -z-20" />
    </section>
  );
};

export default Form;
