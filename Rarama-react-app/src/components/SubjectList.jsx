import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaPlus, FaThLarge, FaList } from "react-icons/fa";
import SubjectCard from "./SubjectCard";
import FilterBar from "./FilterBar";
import subjectsData from "../data/subjects.json";
import programsData from "../data/programs.json";
import "./SubjectList.css";

const SubjectList = () => {
  const [subjects, setSubjects] = useState(subjectsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterUnits, setFilterUnits] = useState("all");
  const [filterPrerequisites, setFilterPrerequisites] = useState("all");
  const [filterProgram, setFilterProgram] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showAddModal, setShowAddModal] = useState(false);

  // Get unique values for filters
  const semesters = ["all", ...new Set(subjects.map(s => s.semesterTerm))];
  const units = ["all", ...new Set(subjects.map(s => s.units))];
  const programs = ["all", ...new Set(programsData.map(p => p.code))];

  // Filter subjects
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = filterSemester === "all" || subject.semesterTerm === filterSemester;
    const matchesUnits = filterUnits === "all" || subject.units === parseInt(filterUnits);
    const matchesPrerequisites = filterPrerequisites === "all" || 
                                 (filterPrerequisites === "with" && subject.preRequisites.length > 0) ||
                                 (filterPrerequisites === "without" && subject.preRequisites.length === 0);
    const matchesProgram = filterProgram === "all" || subject.program === filterProgram;
    
    return matchesSearch && matchesSemester && matchesUnits && matchesPrerequisites && matchesProgram;
  });

  const filterOptions = [
    {
      label: "Semester/Term",
      name: "semester",
      value: filterSemester,
      options: semesters.map(s => ({
        value: s,
        label: s === "all" ? "All Terms" : s.charAt(0).toUpperCase() + s.slice(1)
      }))
    },
    {
      label: "Units",
      name: "units",
      value: filterUnits,
      options: units.map(u => ({
        value: u,
        label: u === "all" ? "All Units" : `${u} Units`
      }))
    },
    {
      label: "Prerequisites",
      name: "prerequisites",
      value: filterPrerequisites,
      options: [
        { value: "all", label: "All Subjects" },
        { value: "with", label: "With Prerequisites" },
        { value: "without", label: "Without Prerequisites" }
      ]
    },
    {
      label: "Program",
      name: "program",
      value: filterProgram,
      options: programs.map(p => ({
        value: p,
        label: p === "all" ? "All Programs" : p
      }))
    }
  ];

  const handleFilterChange = (name, value) => {
    if (name === "semester") setFilterSemester(value);
    if (name === "units") setFilterUnits(value);
    if (name === "prerequisites") setFilterPrerequisites(value);
    if (name === "program") setFilterProgram(value);
  };

  const handleClearFilters = () => {
    setFilterSemester("all");
    setFilterUnits("all");
    setFilterPrerequisites("all");
    setFilterProgram("all");
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
      className="subject-list"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="subject-list-header">
        <div className="header-title">
          <h1>Subject Offerings</h1>
          <p>Manage and view all academic subjects</p>
        </div>
        <motion.button 
          className="add-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus /> Add Subject
        </motion.button>
      </div>

      <div className="subject-list-controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by subject name or code..."
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
        showClearButton={filterSemester !== "all" || filterUnits !== "all" || 
                        filterPrerequisites !== "all" || filterProgram !== "all" || 
                        searchTerm !== ""}
      />

      <AnimatePresence>
        <motion.div 
          className={`subjects-grid ${viewMode}`}
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
          {filteredSubjects.map((subject, index) => (
            <SubjectCard key={subject.id} subject={subject} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredSubjects.length === 0 && (
        <motion.div 
          className="no-results"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>No subjects found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </motion.div>
      )}

      {/* Add Subject Modal (Design Only) */}
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
              <h2>Add New Subject</h2>
              <form className="modal-form">
                <div className="form-group">
                  <label>Subject Code</label>
                  <input type="text" placeholder="e.g., IT101" />
                </div>
                <div className="form-group">
                  <label>Subject Title</label>
                  <input type="text" placeholder="e.g., Introduction to Computing" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Units</label>
                    <input type="number" placeholder="e.g., 3" />
                  </div>
                  <div className="form-group">
                    <label>Semester/Term</label>
                    <select>
                      <option>semester</option>
                      <option>term</option>
                      <option>both</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Program</label>
                  <select>
                    {programsData.map(p => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="3" placeholder="Enter subject description..."></textarea>
                </div>
                <div className="form-group">
                  <label>Pre-requisites (comma-separated)</label>
                  <input type="text" placeholder="e.g., IT101, IT102" />
                </div>
                <div className="form-group">
                  <label>Co-requisites (comma-separated)</label>
                  <input type="text" placeholder="e.g., IT103" />
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="submit-btn">Add Subject</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SubjectList;