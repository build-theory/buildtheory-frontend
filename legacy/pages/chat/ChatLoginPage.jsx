import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InputField = ({ label, placeholder, value, onChange, type = "text" }) => {
    return (
        <div className="flex flex-col mt-6 w-full max-w-[444px]">
            <label className="text-2xl font-medium leading-none text-neutral-800">
                {label}
            </label>
            <div className="flex items-center p-3 mt-4 w-full rounded-lg bg-zinc-50 min-h-[54px] shadow-[0px_0px_2px_rgba(0,0,0,1)]">
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="flex-1 self-stretch text-lg leading-loose text-stone-500 bg-transparent border-none outline-none"
                    aria-label={label}
                />
            </div>
        </div>
    );
};

const LoginButton = ({ onClick }) => (
    <button
        onClick={onClick}
        className="w-full px-10 py-2 mt-6 text-xl font-medium bg-gray-900 rounded-3xl text-zinc-50 min-h-[60px] mx-0"
        type="button"
    >
        Enter
    </button>
);

const ChatLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('https://insurebuzz-backend.onrender.com/chat-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await response.json();
            console.log('Login successful:', data);
            navigate('/chat-page');
        } catch (error) {
            console.error('Login error:', error);
            setError('Invalid username or password.');
        }
    };

    return (
        <main className="overflow-hidden py-8 pr-8 pl-16 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] h-full flex justify-center items-center">
            <div className="flex gap-5 w-full max-md:flex-col items-center m-auto">
                {/* Illustration Section */}
                <section className="flex flex-col w-[45%] max-md:ml-0 m-8">
                    <img
                        loading="lazy"
                        src="assets/img/login.svg"
                        alt="Login illustration"
                        className="object-contain w-full aspect-[0.91] max-md:mt-10"
                    />
                </section>

                {/* Login Section */}
                <section className="flex flex-col w-[55%] max-md:w-full rounded-2xl bg-gradient-main p-10">
                    <div className="flex flex-col justify-center items-center py-7 w-full bg-[linear-gradient(104deg,#C2FEFE_0.01%,rgba(255,228,199,0.20_99.99%))] rounded-3xl">
                        <img
                            src=""
                            alt="InsureBuzz AI Logo"
                            className="object-contain w-[200px]"
                        />
                        <div className="flex flex-col mt-11 w-[444px] max-md:mt-10">
                            <h1 className="text-3xl font-semibold leading-none text-neutral-800 mb-6 text-center">
                                Login
                            </h1>

                            {/* Username Input */}
                            <InputField
                                label="Username"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                            {/* Password Input */}
                            <InputField
                                label="Password"
                                placeholder="Enter your password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {/* Error Message */}
                            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

                            {/* Login Button */}
                            <LoginButton onClick={handleLogin} />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default ChatLoginPage;
