import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "./textField";
import { validator } from "../utils/validator";

const LoginForm = () => {
    const [data, setData] = useState({ name: "", password: "" });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = ({ name, value }) => {
        setData((prevState) => ({ ...prevState, [name]: value }));
    };

    const validConfigurator = {
        name: {
            isRequired: { message: "Please enter a name" },
        },
        password: {
            isRequired: { message: "Please enter password" },
        },
    };

    const validate = () => {
        const errors = validator(data, validConfigurator);
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const res = await fetch("http://localhost:8080/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Неверное имя или пароль");

            const user = await res.json();
            localStorage.setItem("currentUser", JSON.stringify(user));
            navigate(user.role === "admin" ? "/dashboard" : "/user");
        } catch (error) {
            alert("Ошибка входа: " + error.message);
        }
    };

    const isValid = Object.keys(errors).length === 0;

    return (
        <form onSubmit={handleSubmit} className="p-3">
            <TextField
                label="Name"
                name="name"
                type="text"
                value={data.name}
                onChange={handleChange}
                error={errors.name}
            />
            <TextField
                label="Password"
                name="password"
                type="password"
                value={data.password}
                onChange={handleChange}
                error={errors.password}
            />
            <button
                type="submit"
                className="btn btn-primary w-100 mt-3"
                disabled={!isValid}
            >
                Войти
            </button>
        </form>
    );
};

export default LoginForm;
