import React from 'react'
import { Link } from 'react-router-dom';
import './Project.css'
import img1 from '../../assets/p1.avif';
import img2 from '../../assets/p2.avif';
import img3 from '../../assets/p3.jpeg';
import img4 from '../../assets/p4.jpeg';

const Project = () => {
  return (
    <div className='ProjectDiv'>
            <div className="left">
                <img src={img1} alt="Example home exterior" loading="lazy" decoding="async" />
            </div>
        <div className="right">
            <div className="title">Explore property possibilities</div>
            <div className="subtitle">Browse homes and property options in Vrindavan and Mathura, and find a place that suits your needs.</div>
            <Link className="contact-btn" to="/buy">Browse listings</Link>
        </div>
        <div className="gallery">
            <div className="photo1">
                <img src={img2} alt="Example home with landscaped grounds" loading="lazy" decoding="async" />
                <div className="tined">
                    <div>Family homes</div>
                    </div>
            </div>
            <div className="photo2">
                <img src={img3} alt="Example residential property" loading="lazy" decoding="async" />
                <div className="tined">
                    <div>Local properties</div>
                    
                    </div>
                </div>
            <div className="photo3">
                <img src={img4} alt="Example modern home" loading="lazy" decoding="async" />
                <div className="tined">
                    <div>Modern living</div>
                    </div>
            </div>
        </div>
    </div>
  )
}

export default Project