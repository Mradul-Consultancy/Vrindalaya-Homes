import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../../utils/api';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [authShow, setAuthShow] = useState(true);

    // Login form state
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    // Signup form state
    const [signupData, setSignupData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password2: ''
    });

    // Handle login input change
    const handleLoginChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
    };

    // Handle signup input change
    const handleSignupChange = (e) => {
        setSignupData({
            ...signupData,
            [e.target.name]: e.target.value
        });
    };

    // Login submit handler
    const handleLoginSubmit = async () => {
        try {
            const response = await api.post('/accounts/auth/login/', loginData);
            localStorage.setItem('access', response.data.access_token);
            localStorage.setItem('refresh', response.data.refresh_token);
            alert('Login successful!');
            navigate('/'); 
            // Redirect or fetch protected data here
        } catch (error) {
            alert('Login failed: ' + (error.response?.data?.detail || error.message));
        }
    };

    // Signup submit handler
    const handleSignupSubmit = async () => {
        if (signupData.password !== signupData.password2) {
            return alert("Passwords don't match");
        }

        try {
            await api.post('/accounts/auth/register/', signupData);
            alert('Signup successful! Please check your email to verify your account.');
            setAuthShow(true); // Switch to login screen after signup
        } catch (error) {
            alert('Signup failed: ' + (error.response?.data?.detail || error.message));
        }
    };

    return (
        <>
        {authShow ? (
            <div className='LoginMainDiv'>
                <div className="Loginleft">
                    <div className="CompanyTitle">Vrindalaya Homes</div>
                    <div className="logintitle">Login to Your Account</div>
                    <div className="loginDetail">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={loginData.email}
                            onChange={handleLoginChange}
                        /><br />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={loginData.password}
                            onChange={handleLoginChange}
                        /><br />
                        <button onClick={handleLoginSubmit}>Submit</button>
                    </div>
                </div>
                <div className="Loginright">
                    <div className="newhere">New Here?</div>
                    <div className="loginsubtitle">
                        Sign Up and discover a great <br /> amount of new opportunities!
                    </div>
                    <div className="signup-btn">
                        <button onClick={() => setAuthShow(false)}>Sign Up</button>
                    </div>
                </div>
            </div>
        ) : (
            <div className="SingupMainDiv">
                <div className="signupleft">
                    <div className="Signuptitle">Hello Friends!</div>
                    <div className="singup-slogon">
                        Enter your personal details <br /> and start journey with us
                    </div>
                    <div className="sign-btn">
                        <button onClick={() => setAuthShow(true)}>Sign In</button>
                    </div>
                </div>
                <div className="signupRight">
                    <div className="Signuptitle-2">Create Your Account</div>
                    <div className="signupDetail">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={signupData.email}
                            onChange={handleSignupChange}
                        /><br />
                        <input
                            type="text"
                            name="first_name"
                            placeholder="First Name"
                            value={signupData.first_name}
                            onChange={handleSignupChange}
                        /><br />
                        <input
                            type="text"
                            name="last_name"
                            placeholder="Last Name"
                            value={signupData.last_name}
                            onChange={handleSignupChange}
                        /><br />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={signupData.password}
                            onChange={handleSignupChange}
                        /><br />
                        <input
                            type="password"
                            name="password2"
                            placeholder="Confirm Password"
                            value={signupData.password2}
                            onChange={handleSignupChange}
                        /><br />
                        <button onClick={handleSignupSubmit}>Submit</button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default Login;
