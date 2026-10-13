import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './BuyPage.css';
import { useNavigate } from 'react-router-dom';
import api, { mediaBaseUrl } from '../../utils/api';
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

const getPropertyImage = (property) => {
    if (property.images) {
        return property.images.startsWith('http')
            ? property.images
            : `${mediaBaseUrl}${property.images.startsWith('/') ? '' : '/'}${property.images}`;
    }
    const list = typeImages[property.property_type] || [house1, apt1, demoHouse];
    return list[property.id % list.length];
};

const BuyPage = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [filters, setFilters] = useState({ city: '', property_type: '', price__gte: '', price__lte: '' });
    const [appliedFilters, setAppliedFilters] = useState({});
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.get('/property/buy/', { params: { ...appliedFilters, page } })
            .then(({ data }) => {
                if (cancelled) return;
                setProperties(data.results);
                setPageCount(Math.max(1, Math.ceil(data.count / 12)));
                setLoadError('');
            })
            .catch(() => {
                if (!cancelled) setLoadError('Could not load properties. Please try again later.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [appliedFilters, page]);

    const handleFilterChange = (event) => {
        setFilters(prev => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleFilterSubmit = (event) => {
        event.preventDefault();
        const nextFilters = Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value !== '')
        );
        setAppliedFilters(nextFilters);
        setPage(1);
    };

    const handleSellClick = () => {
        const token = localStorage.getItem('access');

        if (!token) {
            alert('Please login first to post your property.');
            navigate('/login');
        } else {
            navigate('/sell');
        }
    };

    return (
        <div className="BuyPageContainer">
            <header className="BuyHeader">
                <Link to="/" className="BuyLogo">Vrindalaya Homes</Link>
                <div>
                    <Link to="/">Home</Link>
                    <div onClick={handleSellClick} className='Sellbtn'>Sell</div>
                </div>
            </header>

            <section className="BuyIntro">
                <h1>Find Your Dream Property</h1>
                <p>Explore properties across Vrindavan and Mathura.</p>
            </section>

            <form className="BuyFilters" onSubmit={handleFilterSubmit}>
                <input name="city" value={filters.city} onChange={handleFilterChange} placeholder="City" />
                <select name="property_type" value={filters.property_type} onChange={handleFilterChange}>
                    <option value="">Any property type</option>
                    {['House', 'Apartment', 'Plot', 'Commercial'].map(type => <option key={type}>{type}</option>)}
                </select>
                <input name="price__gte" type="number" min="0" value={filters.price__gte} onChange={handleFilterChange} placeholder="Min price (₹)" />
                <input name="price__lte" type="number" min="0" value={filters.price__lte} onChange={handleFilterChange} placeholder="Max price (₹)" />
                <button type="submit">Search</button>
            </form>

            <section className="BuyListings">
                {loading ? (
                    <p>Loading properties...</p>
                ) : loadError ? (
                    <p role="alert">{loadError}</p>
                ) : properties.length === 0 ? (
                    <p>No properties available yet.</p>
                ) : (
                    properties.map(property => (
                        <Link key={property.id} to={`/property/${property.id}`} className="BuyCardLink">
                            <div className="BuyCard">
                                <img
                                    src={getPropertyImage(property)}
                                    alt={property.title}
                                    loading="lazy"
                                    decoding="async"
                                />
                                <div className="BuyCardInfo">
                                    <h2>{property.title}</h2>
                                    <p className="BuyLocation">{property.city}, {property.locality}</p>
                                    <p className="BuyType">{property.property_type}</p>
                                    <p className="BuyPrice">
                                        ₹{Number(property.price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </p>
                                    <button className="BuyBtn">View Details</button>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </section>
            {!loading && !loadError && pageCount > 1 && (
                <nav className="BuyPagination" aria-label="Property pages">
                    <button type="button" onClick={() => setPage(current => current - 1)} disabled={page <= 1}>Previous</button>
                    <span>Page {page} of {pageCount}</span>
                    <button type="button" onClick={() => setPage(current => current + 1)} disabled={page >= pageCount}>Next</button>
                </nav>
            )}
        </div>
    );
};

export default BuyPage;
