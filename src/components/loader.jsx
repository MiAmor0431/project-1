import React from "react";

const Loader = ({ visible }) => {
    if (!visible) return null;
    return (
        <div className="d-flex justify-content-center my-3">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
};

export default Loader;