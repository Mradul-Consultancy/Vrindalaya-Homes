import React from 'react'
import { Link } from 'react-router-dom';
import './AboutGroup.css'

const AboutGroup = () => {
    return (
        <div className='AboutGroupDiv'>
            <div className="left">
                <div className="title">
                    Find a place to call home in Vrindavan and Mathura
                </div>
                <div className="sub-tile">
                    <i>Explore homes, apartments, plots and commercial properties around Vrindavan and Mathura, or submit a property listing for review.</i>
                </div>
                <div className="buy-btn">
                    <Link to="/buy"><button type="button">Browse properties</button></Link>
                </div>
            </div>
            <div className="right">
            </div>
            <div className='main-copy'>
                <div className="reserve">
                    © 2025. Vrindalaya Homes, Vrindavan. All Rights Reserved. Sitemap
                </div>
                <div className="designby">
                    Site Created by Tech Team
                </div>
            </div>
        </div>
    )
}

export default AboutGroup