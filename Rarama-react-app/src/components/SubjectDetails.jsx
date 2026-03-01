import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaArrowLeft, FaBook, FaClock, FaLink, FaUnlink, 
  FaGraduationCap, FaCheckCircle, FaInfoCircle, FaTimesCircle,
  FaCalendarAlt, FaLayerGroup, FaUniversity, FaChartLine
} from "react-icons/fa";
import subjectsData from "../data/subjects.json";
import programsData from "../data/programs.json";
import "./SubjectDetails.css";

const SubjectDetails = () => {
  const { subjectCode } = useParams();
  const subject = subjectsData.find(s => s.code === subjectCode);
  const program = programsData.find(p => p.code === subject?.program);

  if (!subject) {
    return (
      <motion.div 
        className="subject-not-found"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <FaTimesCircle className="not-found-icon" />
        <h2>Subject Not Found</h2>
        <p>The subject you're looking for doesn't exist or has been removed.</p>
        <Link to="/subjects" className="back-link">
          <FaArrowLeft /> Back to Subjects
        </Link>
      </motion.div>
    );
  }

  const getSemesterBadge = (semester) => {
    switch(semester) {
      case "semester":
        return { 
          color: "var(--success-color)", 
          label: "Semester", 
          icon: FaClock,
          gradient: "linear-gradient(135deg, var(--success-color), #059669)"
        };
      case "term":
        return { 
          color: "var(--warning-color)", 
          label: "Term", 
          icon: FaClock,
          gradient: "linear-gradient(135deg, var(--warning-color), #d97706)"
        };
      case "both":
        return { 
          color: "var(--info-color)", 
          label: "Both", 
          icon: FaCheckCircle,
          gradient: "linear-gradient(135deg, var(--info-color), #2563eb)"
        };
      default:
        return { 
          color: "var(--gray-500)", 
          label: "Unknown", 
          icon: FaClock,
          gradient: "linear-gradient(135deg, var(--gray-500), var(--gray-600))"
        };
    }
  };

  const getRequisiteStatus = (requisites) => {
    return requisites && requisites.length > 0 ? "has" : "none";
  };

  const semesterBadge = getSemesterBadge(subject.semesterTerm);
  const SemesterIcon = semesterBadge.icon;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="subject-details"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
    >
      {/* Header with Back Button */}
      <motion.div className="details-header" variants={itemVariants}>
        <Link to="/subjects" className="back-button">
          <FaArrowLeft /> Back to Subjects
        </Link>
        <div className="header-actions">
          <motion.button 
            className="edit-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Edit Subject
          </motion.button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div 
        className="subject-hero"
        variants={itemVariants}
        style={{ background: semesterBadge.gradient }}
      >
        <div className="hero-content">
          <div className="hero-icon">
            <FaBook />
          </div>
          <div className="hero-text">
            <h1>{subject.title}</h1>
            <div className="hero-meta">
              <span className="subject-code-badge">{subject.code}</span>
              <span className="semester-badge-large">
                <SemesterIcon className="badge-icon" />
                {semesterBadge.label}
              </span>
            </div>
          </div>
        </div>
        <div className="hero-decoration">
          <FaUniversity className="decoration-icon" />
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div className="stats-grid" variants={itemVariants}>
        <motion.div className="stat-card-small" whileHover={{ y: -3 }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-100)', color: 'var(--primary-color)' }}>
            <FaBook />
          </div>
          <div className="stat-content">
            <span className="stat-label">Units</span>
            <span className="stat-value">{subject.units} credits</span>
          </div>
        </motion.div>

        <motion.div className="stat-card-small" whileHover={{ y: -3 }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--secondary-100)', color: 'var(--secondary-color)' }}>
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <span className="stat-label">Term</span>
            <span className="stat-value">{subject.semesterTerm}</span>
          </div>
        </motion.div>

        {program && (
          <motion.div className="stat-card-small" whileHover={{ y: -3 }}>
            <div className="stat-icon-wrapper" style={{ background: 'var(--success-50)', color: 'var(--success-color)' }}>
              <FaGraduationCap />
            </div>
            <div className="stat-content">
              <span className="stat-label">Program</span>
              <span className="stat-value">{program.code}</span>
            </div>
          </motion.div>
        )}

        <motion.div className="stat-card-small" whileHover={{ y: -3 }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--warning-50)', color: 'var(--warning-color)' }}>
            <FaLayerGroup />
          </div>
          <div className="stat-content">
            <span className="stat-label">Year Level</span>
            <span className="stat-value">Year {subject.yearLevel || 1}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Description Card */}
      <motion.div className="description-card-modern" variants={itemVariants}>
        <div className="card-header">
          <FaInfoCircle className="header-icon" />
          <h2>Subject Description</h2>
        </div>
        <p className="description-text">{subject.description || "No description available."}</p>
      </motion.div>

      {/* Program Information Card (if program exists) */}
      {program && (
        <motion.div className="program-info-card" variants={itemVariants}>
          <div className="card-header">
            <FaUniversity className="header-icon" />
            <h2>Program Information</h2>
          </div>
          <div className="program-info-content">
            <div className="program-info-item">
              <span className="info-label">Program Name:</span>
              <Link to={`/programs/${program.code}`} className="program-link">
                {program.name}
              </Link>
            </div>
            <div className="program-info-item">
              <span className="info-label">Program Code:</span>
              <span className="info-value">{program.code}</span>
            </div>
            <div className="program-info-item">
              <span className="info-label">Program Type:</span>
              <span className="info-value">{program.type}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Requisites Section */}
      <motion.div className="requisites-section-modern" variants={itemVariants}>
        <div className="section-header">
          <div className="header-title">
            <FaChartLine className="title-icon" />
            <h2>Pre-requisites & Co-requisites</h2>
          </div>
        </div>

        <div className="requisites-grid">
          {/* Pre-requisites Card */}
          <motion.div 
            className={`requisite-card-modern ${getRequisiteStatus(subject.preRequisites)}`}
            whileHover={{ y: -3 }}
          >
            <div className="requisite-header">
              <FaLink className="requisite-icon" />
              <h3>Pre-requisites</h3>
              {subject.preRequisites && subject.preRequisites.length > 0 ? (
                <span className="requisite-count">{subject.preRequisites.length}</span>
              ) : null}
            </div>
            
            {subject.preRequisites && subject.preRequisites.length > 0 ? (
              <ul className="requisite-list-modern">
                {subject.preRequisites.map((prereq, index) => {
                  const prereqSubject = subjectsData.find(s => s.code === prereq);
                  return (
                    <motion.li 
                      key={index}
                      whileHover={{ x: 3 }}
                    >
                      <Link to={`/subjects/${prereq}`}>
                        <span className="requisite-code">{prereq}</span>
                        {prereqSubject && (
                          <>
                            <span className="requisite-title">{prereqSubject.title}</span>
                            <span className="requisite-units">{prereqSubject.units} units</span>
                          </>
                        )}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            ) : (
              <div className="no-requisites-modern">
                <FaUnlink className="no-requisites-icon" />
                <p>No pre-requisites required</p>
              </div>
            )}
          </motion.div>

          {/* Co-requisites Card */}
          <motion.div 
            className={`requisite-card-modern ${getRequisiteStatus(subject.coRequisites)}`}
            whileHover={{ y: -3 }}
          >
            <div className="requisite-header">
              <FaLink className="requisite-icon" />
              <h3>Co-requisites</h3>
              {subject.coRequisites && subject.coRequisites.length > 0 ? (
                <span className="requisite-count">{subject.coRequisites.length}</span>
              ) : null}
            </div>
            
            {subject.coRequisites && subject.coRequisites.length > 0 ? (
              <ul className="requisite-list-modern">
                {subject.coRequisites.map((coreq, index) => {
                  const coreqSubject = subjectsData.find(s => s.code === coreq);
                  return (
                    <motion.li 
                      key={index}
                      whileHover={{ x: 3 }}
                    >
                      <Link to={`/subjects/${coreq}`}>
                        <span className="requisite-code">{coreq}</span>
                        {coreqSubject && (
                          <>
                            <span className="requisite-title">{coreqSubject.title}</span>
                            <span className="requisite-units">{coreqSubject.units} units</span>
                          </>
                        )}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            ) : (
              <div className="no-requisites-modern">
                <FaUnlink className="no-requisites-icon" />
                <p>No co-requisites required</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Additional Info Section */}
      <motion.div className="additional-info-section" variants={itemVariants}>
        <div className="info-grid">
          <div className="info-chip">
            <span className="chip-label">Semester:</span>
            <span className="chip-value">Semester {subject.semester || 1}</span>
          </div>
          <div className="info-chip">
            <span className="chip-label">Year Level:</span>
            <span className="chip-value">Year {subject.yearLevel || 1}</span>
          </div>
          {subject.preRequisites && subject.preRequisites.length > 0 && (
            <div className="info-chip warning">
              <span className="chip-label">Has Pre-requisites</span>
            </div>
          )}
          {subject.coRequisites && subject.coRequisites.length > 0 && (
            <div className="info-chip info">
              <span className="chip-label">Has Co-requisites</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SubjectDetails;