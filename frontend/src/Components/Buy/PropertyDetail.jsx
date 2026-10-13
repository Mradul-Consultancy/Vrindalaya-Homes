import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { mediaBaseUrl } from '../../utils/api';
import './PropertyDetail.css';
import demoHouse from '../../assets/BuyPage/img1.jpg';
import demoApartment from '../../assets/BuyPage/img2.jpeg';
import demoPlot from '../../assets/BuyPage/img3.webp';
import house1 from '../../assets/BuyPage/img_house1.jpg';
import house2 from '../../assets/BuyPage/img_house2.jpg';
import apt1 from '../../assets/BuyPage/img_apt1.jpg';
import apt2 from '../../assets/BuyPage/img_apt2.jpg';
import villa1 from '../../assets/BuyPage/img_villa1.jpg';
import comm1 from '../../assets/BuyPage/img_comm1.jpg';
import plot1 from '../../assets/BuyPage/img_plot1.jpg';
import interior1 from '../../assets/BuyPage/img_interior1.jpg';

const typeImages = {
    House: [villa1, house1, house2, demoHouse],
    Apartment: [apt1, apt2, interior1, demoApartment],
    Plot: [plot1, demoPlot],
    Commercial: [comm1, house1],
};

const getDetailImage = (property) => {
    if (property.images) {
        return property.images.startsWith('http')
            ? property.images
            : `${mediaBaseUrl}${property.images.startsWith('/') ? '' : '/'}${property.images}`;
    }
    const list = typeImages[property.property_type] || [house1, apt1, demoHouse];
    return list[property.id % list.length];
};

const PropertyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [contact, setContact] = useState(null);
    const [error, setError] = useState('');
    const [contactError, setContactError] = useState('');

    useEffect(() => {
        let cancelled = false;
        api.get(`/property/property/${id}/`)
            .then(({ data }) => {
                if (!cancelled) {
                    setProperty(data);
                    setError('');
                }
            })
            .catch(() => {
                if (!cancelled) setError('This property could not be found or is no longer available.');
            });
        return () => { cancelled = true; };
    }, [id]);

    const showContact = async () => {
        const token = localStorage.getItem('access');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const { data } = await api.get(`/property/property/${id}/contact/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setContact(data);
            setContactError('');
        } catch {
            setContactError('Contact details could not be loaded. Please sign in again and retry.');
        }
    };

    const imageUrl = (path) => (
        path.startsWith('http') ? path : `${mediaBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`
    );

    return (
        <div className="PropertyDetail">
            <header className="DetailHeader">
                <Link to="/" className="BuyLogo">Vrindalaya Homes</Link>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/buy">Back to Listings</Link>
                </nav>
            </header>

            {error ? <p role="alert">{error}</p> : !property ? <p>Loading property...</p> : <div className="DetailContainer">
                <img
                    src={getDetailImage(property)}
                    alt={property.title}
                    className="DetailImage"
                />
                <div className="DetailContent">
                    <h1>{property.title}</h1>
                    <p><strong>Location:</strong> {property.city}, {property.locality}</p>
                    <p><strong>Type:</strong> {property.property_type}</p>
                    <p><strong>Size:</strong> {property.size_sqft} sqft</p>
                    <p><strong>Price:</strong> ₹{Number(property.price).toLocaleString('en-IN')}</p>
                    <p><strong>Construction:</strong> {property.construction_status}</p>
                    <p><strong>Age:</strong> {property.age_of_property}</p>
                    <p><strong>Bedrooms:</strong> {property.bedrooms || 'N/A'}</p>
                    <p><strong>Bathrooms:</strong> {property.bathrooms || 'N/A'}</p>
                    <p><strong>Description:</strong> {property.description}</p>

                    <div className="contact-buttons">
                        <button onClick={showContact}>Show seller contact (sign in required)</button>
                        {contactError && <p role="alert">{contactError}</p>}
                        {contact && (
                            <>
                                <p><strong>Phone:</strong> {contact.seller_contact}</p>
                                <p><strong>Email:</strong> {contact.seller_email}</p>
                            </>
                        )}
                    </div>
                </div>
                {property.gallery_images?.length > 0 && (
                    <div className="DetailGallery" aria-label="Property photos">
                        {property.gallery_images.map((image) => (
                            <img key={image} src={imageUrl(image)} alt={`${property.title} view`} />
                        ))}
                    </div>
                )}
            </div>}
        </div>
    );
};

export default PropertyDetail;
