import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGraduationCap, FaClock, FaBook, FaArrowRight } from "react-icons/fa";
import "./ProgramCard.css";

const ProgramCard = ({ program, index }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case "active": return "var(--success-color)";
      case "phased out": return "var(--warning-color)";
      case "under review": return "var(--info-color)";
      default: return "var(--gray-500)";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case "active": return "status-badge active";
      case "phased out": return "status-badge phased";
      case "under review": return "status-badge review";
      default: return "status-badge";
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: index * 0.1
      }
    }
  };

  return (
    <motion.div 
      className="program-card"
      variants={cardVariants}
      whileHover={{ 
        y: -5,
        boxShadow: "var(--shadow-xl)",
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
    >
      <div className="program-card-header">
        <div className="program-icon">
          <FaGraduationCap />
        </div>
        <span className={getStatusBadgeClass(program.status)}>
          {program.status}
        </span>
      </div>
      
      <div className="program-card-body">
        <h3>{program.name}</h3>
        <p className="program-code">{program.code}</p>
        
        <div className="program-details">
          <div className="detail-item">
            <FaGraduationCap className="detail-icon" />
            <span>{program.type}</span>
          </div>
          <div className="detail-item">
            <FaClock className="detail-icon" />
            <span>{program.duration}</span>
          </div>
          <div className="detail-item">
            <FaBook className="detail-icon" />
            <span>{program.totalUnits} Units</span>
          </div>
        </div>
      </div>
      
      <div className="program-card-footer">
        <Link to={`/programs/${program.code}`} className="view-details-btn">
          <span>View Details</span>
          <FaArrowRight className="arrow-icon" />
        </Link>
      </div>
    </motion.div>
  );
};

export default ProgramCard;