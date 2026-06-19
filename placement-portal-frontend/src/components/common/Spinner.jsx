// src/components/common/Spinner.jsx
const Spinner = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="page-wrapper flex-center">
        <div className="spinner" />
      </div>
    );
  }
  return (
    <div className="spinner-overlay">
      <div className="spinner" />
    </div>
  );
};

export default Spinner;