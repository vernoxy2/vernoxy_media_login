import React from 'react';

const Footer = () => {
  return (
    <div >
      {/* <hr className="mt-8 mx-8" /> */}
          <p className="text-center pt-4 text-gray-500  mt-auto text-sm">
            © {new Date().getFullYear()} Developed by @Vernoxy
          </p>
    </div>
  );
}

export default Footer;