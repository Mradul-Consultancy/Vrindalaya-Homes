import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackgroundVideo from '../../assets/BackgroundVideo.mp4';
import BackgroundVideoPoster from '../../assets/BackgroundVideoPoster.webp';
import './Home.css';
import Project from './Project';
import AboutGroup from './AboutGroup';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
    const isAuthenticated = Boolean(localStorage.getItem('access'));
    
    const textslide = [
        {
            subtitle: 'Explore local property listings',
            title: 'IN VRINDAVAN',
        },
        {
            subtitle: 'Vrindalaya Homes',
            title: 'VRINDAVAN & MATHURA',
        },
        {
            subtitle: 'Find a place that fits your needs',
            title: 'EXPLORE PROPERTIES',
        },
        {
            subtitle: 'Ready to make a move?',
            title: 'BUY OR SELL LOCALLY',
        },
    ];
     const handleSellClick = () => {
        const token = localStorage.getItem('access');

        if (!token) {
            alert('Please login first to post your property.');
            navigate('/login');
        } else {
            navigate('/sell');
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % textslide.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [textslide.length]);

    useEffect(() => {
        const connection = navigator.connection;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isSlowConnection = connection?.saveData
            || ['slow-2g', '2g', '3g'].includes(connection?.effectiveType);

        if (prefersReducedMotion || isSlowConnection) return undefined;

        let timer;
        const scheduleVideo = () => {
            timer = window.setTimeout(() => setShouldLoadVideo(true), 1500);
        };

        if (document.readyState === 'complete') {
            scheduleVideo();
        } else {
            window.addEventListener('load', scheduleVideo, { once: true });
        }

        return () => {
            window.removeEventListener('load', scheduleVideo);
            window.clearTimeout(timer);
        };
    }, []);

    return (
        <div className='MainHome'>
            {/* Hero Section with Video Background */}
            <div className="hero-section">
                <div className="background">
                    <video
                        src={shouldLoadVideo ? BackgroundVideo : undefined}
                        poster={BackgroundVideoPoster}
                        autoPlay={shouldLoadVideo}
                        loop
                        muted
                        playsInline
                        preload="none"
                        className="background-video"
                    />
                </div>
                <div className="contentdiv">
                    <div className="navbar">
                        <div className="left-part">
                            <div className='logo'>
                                <Link to="/">Vrindalaya Homes</Link>
                            </div>
                        </div>
                        <div className="right-part-desktop">
                            <ul>
                                <li className="li-1">
                                    <Link to="/buy">Buy</Link>
                                </li>
                                <li className="li-2">
                                     <div onClick={handleSellClick} className='Sellbtn'>Sell</div>
                                </li>
                                {isAuthenticated && <li><Link to="/my-listings">My listings</Link></li>}
                                <li className="li-3">
                                    <Link to={isAuthenticated ? "/my-listings" : "/login"}>{isAuthenticated ? 'My Account' : 'Login'}</Link>
                                </li>
                                {!isAuthenticated && <li className="li-4">
                                    <Link to="/login">SignUp</Link>
                                </li>}
                                
                            </ul>
                        </div>
                        {/* --------Mobile View-------- */}
                        <div className="right-part-mobile">
                            <i className="ri-menu-line" onClick={()=>setShow(!show)}></i>
                        </div>
                    </div>
                    {show && <div className="mobile-menu">
                        <ul>
                            <li className="li-1" onClick={()=>setShow(false)}>
                                <Link to="/buy">Buy</Link>
                            </li>
                            <li className="li-2" onClick={()=>setShow(false)}>
                                 <button onClick={handleSellClick}>Sell</button>
                            </li>
                            {isAuthenticated && <li onClick={()=>setShow(false)}><Link to="/my-listings">My listings</Link></li>}
                            <li className="li-3" onClick={()=>setShow(false)}>
                                <Link to="/login">Login</Link>
                            </li>
                            <li className="li-4" onClick={()=>setShow(false)}>
                                <Link to="/signup">SignUp</Link>
                            </li>
                            <li className="li-5" onClick={()=>setShow(false)}>
                                <Link to="/contact">Contact Us</Link>
                            </li>
                        </ul>
                    </div>}
                    <div className="text-slide">
                         <div className="text-slide-content">
                            <div className="subtitle">{textslide[currentSlide].subtitle}</div>
                            <div className="title">{textslide[currentSlide].title}</div>
                        </div>
                        <div className="slogan-1">
                        Our Client Satisfaction is Our Priority 
                    </div>
                    </div>
                    <div className='slogan-2'>
                        Find Your Dream Home By Clicking Below
                        <div className="buttons">
                            <Link to="/buy">
                                <button className='button-1'>Buy</button>
                            </Link>  
                                <button className='button-2' onClick={handleSellClick}>Sell</button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Project Section - Scrollable Content Below */}
            <div className="Project">
                <Project />
            </div>
            <div className="AboutGroup">
                <AboutGroup />
            </div>
        </div>
    );
};

export default Home;