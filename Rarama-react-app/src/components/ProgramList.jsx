import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaPlus, FaThLarge, FaList } from "react-icons/fa";
import ProgramCard from "./ProgramCard";
import FilterBar from "./FilterBar";
import programsData from "../data/programs.json";
import "./ProgramList.css";

const ProgramList = () => {
  const [programs, setPrograms] = useState(programsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showAddModal, setShowAddModal] = useState(false);

  // Get unique values for filters
  const statuses = ["all", ...new Set(programs.map(p => p.status))];
  const types = ["all", ...new Set(programs.map(p => p.type))];

  // Filter programs
  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || program.status === filterStatus;
    const matchesType = filterType === "all" || program.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filterOptions = [
    {
      label: "Status",
      name: "status",
      value: filterStatus,
      options: statuses.map(s => ({
        value: s,
        label: s === "all" ? "All Status" : s.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }))
    },
    {
      label: "Program Type",
      name: "type",
      value: filterType,
      options: types.map(t => ({
        value: t,
        label: t === "all" ? "All Types" : t
      }))
    }
  ];

  const handleFilterChange = (name, value) => {
    if (name === "status") setFilterStatus(value);
    if (name === "type") setFilterType(value);
  };

  const handleClearFilters = () => {
    setFilterStatus("all");
    setFilterType("all");
    setSearchTerm("");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      className="program-list"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="program-list-header">
        <div className="header-title">
          <h1>Program Offerings</h1>
          <p>Manage and view all academic programs</p>
        </div>
        <motion.button 
          className="add-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus /> Add Program
        </motion.button>
      </div>

      <div className="program-list-controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by program name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="view-toggle">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <FaThLarge /> Grid
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FaList /> List
          </button>
        </div>
      </div>

      <FilterBar 
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        showClearButton={filterStatus !== "all" || filterType !== "all" || searchTerm !== ""}
      />

      <AnimatePresence>
        <motion.div 
          className={`programs-grid ${viewMode}`}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {filteredPrograms.map((program, index) => (
            <ProgramCard key={program.id} program={program} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredPrograms.length === 0 && (
        <motion.div 
          className="no-results"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>No programs found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </motion.div>
      )}

      {/* Add Program Modal (Design Only) */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h2>Add New Program</h2>
              <form className="modal-form">
                <div className="form-group">
                  <label>Program Code</label>
                  <input type="text" placeholder="e.g., BSIT" />
                </div>
                <div className="form-group">
                  <label>Program Name</label>
                  <input type="text" placeholder="e.g., Bachelor of Science in Information Technology" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Program Type</label>
                    <select>
                      <option>Bachelor's Degree</option>
                      <option>Master's Degree</option>
                      <option>Associate Degree</option>
                      <option>Diploma</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input type="text" placeholder="e.g., 4 years" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Total Units</label>
                    <input type="number" placeholder="e.g., 135" />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select>
                      <option>active</option>
                      <option>phased out</option>
                      <option>under review</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="4" placeholder="Enter program description..."></textarea>
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="submit-btn">Add Program</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProgramList;