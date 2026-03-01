import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBook, FaClock, FaLink, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import "./SubjectCard.css";

const SubjectCard = ({ subject, index }) => {
  const getSemesterBadge = (semester) => {
    switch(semester) {
      case "semester":
        return { color: "var(--success-color)", label: "Semester", icon: FaClock };
      case "term":
        return { color: "var(--warning-color)", label: "Term", icon: FaClock };
      case "both":
        return { color: "var(--info-color)", label: "Both", icon: FaCheckCircle };
      default:
        return { color: "var(--gray-500)", label: "Unknown", icon: FaClock };
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
        delay: index * 0.05
      }
    }
  };

  const semesterBadge = getSemesterBadge(subject.semesterTerm);
  const SemesterIcon = semesterBadge.icon;

  return (
    <motion.div 
      className="subject-card"
      variants={cardVariants}
      whileHover={{ 
        y: -5,
        boxShadow: "var(--shadow-xl)",
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
    >
      <div className="subject-card-header">
        <div className="subject-icon">
          <FaBook />
        </div>
        <div className="subject-badges">
          <span className="semester-badge" style={{ backgroundColor: semesterBadge.color }}>
            <SemesterIcon className="badge-icon" />
            {semesterBadge.label}
          </span>
          {subject.preRequisites.length > 0 && (
            <span className="prerequisite-badge">
              <FaLink /> Has Prereq
            </span>
          )}
        </div>
      </div>
      
      <div className="subject-card-body">
        <h3>{subject.title}</h3>
        <p className="subject-code">{subject.code}</p>
        
        <div className="subject-details">
          <div className="detail-item">
            <FaClock className="detail-icon" />
            <span>{subject.units} Units</span>
          </div>
          {subject.program && (
            <div className="detail-item">
              <FaBook className="detail-icon" />
              <span>{subject.program}</span>
            </div>
          )}
        </div>

        {subject.description && (
          <p className="subject-description">{subject.description.substring(0, 60)}...</p>
        )}
      </div>
      
      <div className="subject-card-footer">
        <Link to={`/subjects/${subject.code}`} className="view-details-btn">
          <span>View Details</span>
          <FaArrowRight className="arrow-icon" />
        </Link>
      </div>
    </motion.div>
  );
};

export default SubjectCard;