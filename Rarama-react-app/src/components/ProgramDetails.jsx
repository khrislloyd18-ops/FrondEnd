import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaArrowLeft, FaGraduationCap, FaClock, FaBook, 
  FaLayerGroup, FaCalendarAlt, FaUniversity, FaInfoCircle,
  FaBookOpen, FaChartLine, FaCheckCircle, FaTimesCircle
} from "react-icons/fa";
import programsData from "../data/programs.json";
import subjectsData from "../data/subjects.json";
import "./ProgramDetails.css";

const ProgramDetails = () => {
  const { programCode } = useParams();
  const program = programsData.find(p => p.code === programCode);
  
  if (!program) {
    return (
      <motion.div 
        className="program-not-found"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <FaTimesCircle className="not-found-icon" />
        <h2>Program Not Found</h2>
        <p>The program you're looking for doesn't exist or has been removed.</p>
        <Link to="/programs" className="back-link">
          <FaArrowLeft /> Back to Programs
        </Link>
      </motion.div>
    );
  }

  // Get subjects for this program
  const programSubjects = subjectsData.filter(s => s.program === program.code);

  // Group subjects by year and semester
  const subjectsByYear = {};
  program.yearLevels.forEach(yearLevel => {
    subjectsByYear[yearLevel.year] = {
      semester1: programSubjects.filter(s => 
        s.yearLevel === yearLevel.year && s.semester === 1
      ),
      semester2: programSubjects.filter(s => 
        s.yearLevel === yearLevel.year && s.semester === 2
      )
    };
  });

  const getStatusColor = (status) => {
    switch(status) {
      case "active": return "var(--success-color)";
      case "phased out": return "var(--warning-color)";
      case "under review": return "var(--info-color)";
      default: return "var(--gray-500)";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "active": return <FaCheckCircle />;
      case "phased out": return <FaTimesCircle />;
      case "under review": return <FaInfoCircle />;
      default: return <FaInfoCircle />;
    }
  };

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
      className="program-details"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
    >
      {/* Header with Back Button */}
      <motion.div className="details-header" variants={itemVariants}>
        <Link to="/programs" className="back-button">
          <FaArrowLeft /> Back to Programs
        </Link>
        <div className="header-actions">
          <motion.button 
            className="edit-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Edit Program
          </motion.button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div 
        className="program-hero"
        variants={itemVariants}
        style={{ background: `linear-gradient(135deg, var(--primary-color), var(--primary-dark))` }}
      >
        <div className="hero-content">
          <div className="hero-icon">
            <FaGraduationCap />
          </div>
          <div className="hero-text">
            <h1>{program.name}</h1>
            <div className="hero-meta">
              <span className="program-code-badge">{program.code}</span>
              <span 
                className="status-badge-large" 
                style={{ backgroundColor: getStatusColor(program.status) }}
              >
                {getStatusIcon(program.status)}
                {program.status}
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
            <FaClock />
          </div>
          <div className="stat-content">
            <span className="stat-label">Duration</span>
            <span className="stat-value">{program.duration}</span>
          </div>
        </motion.div>

        <motion.div className="stat-card-small" whileHover={{ y: -3 }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--secondary-100)', color: 'var(--secondary-color)' }}>
            <FaBook />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Units</span>
            <span className="stat-value">{program.totalUnits}</span>
          </div>
        </motion.div>

        <motion.div className="stat-card-small" whileHover={{ y: -3 }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--success-50)', color: 'var(--success-color)' }}>
            <FaLayerGroup />
          </div>
          <div className="stat-content">
            <span className="stat-label">Year Levels</span>
            <span className="stat-value">{program.yearLevels.length}</span>
          </div>
        </motion.div>

        <motion.div className="stat-card-small" whileHover={{ y: -3 }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--warning-50)', color: 'var(--warning-color)' }}>
            <FaBookOpen />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Subjects</span>
            <span className="stat-value">{programSubjects.length}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Description Card */}
      <motion.div className="description-card-modern" variants={itemVariants}>
        <div className="card-header">
          <FaInfoCircle className="header-icon" />
          <h2>Program Description</h2>
        </div>
        <p className="description-text">{program.description}</p>
      </motion.div>

      {/* Curriculum Section */}
      <motion.div className="curriculum-section" variants={itemVariants}>
        <div className="section-header">
          <div className="header-title">
            <FaChartLine className="title-icon" />
            <h2>Curriculum by Year Level</h2>
          </div>
          <div className="legend">
            <span className="legend-item">
              <span className="legend-dot semester"></span>
              First Semester
            </span>
            <span className="legend-item">
              <span className="legend-dot term"></span>
              Second Semester
            </span>
          </div>
        </div>

        <div className="year-levels-container">
          {program.yearLevels.map((yearLevel, index) => (
            <motion.div 
              key={yearLevel.year}
              className="year-card-modern"
              variants={itemVariants}
              custom={index}
              whileHover={{ y: -3 }}
            >
              <div className="year-header-modern">
                <div className="year-badge">
                  <FaLayerGroup className="year-icon" />
                  <span>Year {yearLevel.year}</span>
                </div>
                <span className="subject-count-badge">
                  {yearLevel.semester1.length + yearLevel.semester2.length} Subjects
                </span>
              </div>
              
              <div className="semester-grid">
                {/* First Semester */}
                <div className="semester-card">
                  <div className="semester-header semester">
                    <FaCalendarAlt className="semester-icon" />
                    <h4>First Semester</h4>
                  </div>
                  <ul className="subject-list-modern">
                    {yearLevel.semester1.map(subject => (
                      <motion.li 
                        key={subject.code}
                        whileHover={{ x: 3 }}
                      >
                        <Link to={`/subjects/${subject.code}`}>
                          <span className="subject-code-modern">{subject.code}</span>
                          <span className="subject-title-modern">{subject.title}</span>
                          <span className="subject-units-modern">{subject.units} units</span>
                        </Link>
                      </motion.li>
                    ))}
                    {yearLevel.semester1.length === 0 && (
                      <li className="no-subjects">
                        <FaInfoCircle /> No subjects assigned
                      </li>
                    )}
                  </ul>
                </div>

                {/* Second Semester */}
                <div className="semester-card">
                  <div className="semester-header term">
                    <FaCalendarAlt className="semester-icon" />
                    <h4>Second Semester</h4>
                  </div>
                  <ul className="subject-list-modern">
                    {yearLevel.semester2.map(subject => (
                      <motion.li 
                        key={subject.code}
                        whileHover={{ x: 3 }}
                      >
                        <Link to={`/subjects/${subject.code}`}>
                          <span className="subject-code-modern">{subject.code}</span>
                          <span className="subject-title-modern">{subject.title}</span>
                          <span className="subject-units-modern">{subject.units} units</span>
                        </Link>
                      </motion.li>
                    ))}
                    {yearLevel.semester2.length === 0 && (
                      <li className="no-subjects">
                        <FaInfoCircle /> No subjects assigned
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProgramDetails;