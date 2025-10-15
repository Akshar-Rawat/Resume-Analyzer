import React from "react";
import { Link, useNavigate } from "react-router-dom";
const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to={"/"}>
        <p className="text-2xl font-bold text-gradient">RESUMIDE</p>
      </Link>
      <Link to={"/upload"} className="primary-button w-fit">
        
        Upload Resume
      </Link>
    </nav>
  );
};

export default Navbar;
