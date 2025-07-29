import React from "react";

const TextField = ({ label, name, type = "text", value, onChange, error }) => {
    const handleChange = (e) => {
        onChange({ name: e.target.name, value: e.target.value });
    };

    return (
        <div className="mb-3">
            <label htmlFor={name} className="form-label fw-bold">
                {label}
            </label>
            <input
                type={type}
                className={`form-control ${error ? "is-invalid" : ""}`}
                id={name}
                name={name}
                value={value}
                onChange={handleChange}
            />
            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    );
};

export default TextField;
