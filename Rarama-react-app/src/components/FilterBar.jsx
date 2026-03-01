import React from "react";
import { motion } from "framer-motion";
import { FaFilter, FaTimes } from "react-icons/fa";
import "./FilterBar.css";

const FilterBar = ({ 
  filters = [], 
  onFilterChange, 
  onClearFilters,
  showClearButton = false 
}) => {
  return (
    <motion.div 
      className="filter-bar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="filter-bar-header">
        <div className="filter-title">
          <FaFilter className="filter-icon" />
          <span>Filters</span>
        </div>
        {showClearButton && (
          <motion.button 
            className="clear-filters-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearFilters}
          >
            <FaTimes /> Clear All
          </motion.button>
        )}
      </div>
      
      <div className="filter-options">
        {filters.map((filter, index) => (
          <motion.div 
            key={filter.name}
            className="filter-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <label>{filter.label}</label>
            <select
              value={filter.value}
              onChange={(e) => onFilterChange(filter.name, e.target.value)}
              className="filter-select"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FilterBar;