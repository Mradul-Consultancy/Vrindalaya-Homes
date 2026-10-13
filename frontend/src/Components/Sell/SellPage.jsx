import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import './SellPage.css';

const emptyForm = () => ({
    title: '',
    property_type: '',
    size_sqft: '',
    bedrooms: '',
    bathrooms: '',
    furnishing_status: '',
    price: '',
    city: '',
    locality: '',
    address: '',
    pincode: '',
    construction_status: '',
    age_of_property: '',
    floor_number: '',
    total_floors: '',
    parking: '',
    images: null,
    gallery: [],
    floor_plan: null,
    seller_name: '',
    seller_contact: '',
    seller_email: '',
    seller_type: '',
    description: '',
});

const SellPage = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name } = e.target;
        const files = Array.from(e.target.files || []);
        if (name === 'images') {
            if (files.length > 10) {
                setFormError('Upload no more than 10 property photos.');
                e.target.value = '';
                return;
            }
            setFormData(prev => ({ ...prev, images: files[0] || null, gallery: files.slice(1) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: files[0] || null }));
        }
        setFormError('');
    };

    const handleNext = () => {
        const requiredFields = {
            1: ['title', 'property_type', 'size_sqft', 'price'],
            2: ['city', 'locality', 'address', 'pincode'],
            3: ['construction_status', 'age_of_property', 'floor_number', 'total_floors', 'parking'],
            4: ['images'],
        }[step] || [];
        const missing = requiredFields.filter((field) => !formData[field]);
        if (missing.length) {
            setFormError('Please complete all required fields before continuing.');
            return;
        }
        setFormError('');
        if (step < 5) setStep(step + 1);
    };

    const handlePrevious = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        const requiredFields = ['seller_name', 'seller_contact', 'seller_email', 'seller_type', 'description'];
        if (requiredFields.some((field) => !formData[field])) {
            setFormError('Please complete all required seller details.');
            return;
        }
        try {
            const postData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'gallery') {
                    value.forEach((file) => postData.append('gallery', file));
                } else if (value !== null && value !== '') {
                    postData.append(key, value);
                }
            });

            postData.set('parking', formData.parking === 'Yes');

            setSubmitting(true);
            await api.post('/property/sell/', postData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access')}`,
                },
            });

            alert('Property submitted successfully and is awaiting review.');
            setFormData(emptyForm());
            setFormError('');
            setStep(1);
        } catch (err) {
            console.error(err);
            const detail = err.response?.data;
            setFormError(typeof detail === 'string' ? detail : JSON.stringify(detail || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className='SellPageDiv'>
            <div className="Sellnavbar">
                <div className="Sellleft">
                    <Link to="/" className='Selllogo'>Vrindalaya Homes</Link>
                </div>
                <div className="Sellright">
                    <nav>
                        <Link to="/">Home</Link>
                        <Link to="/buy">Buy</Link>
                    </nav>
                </div>
            </div>

            <div className="SellForm">
                {formError && <p className="SellFormError" role="alert">{formError}</p>}
                <div className="StatusBar">
                    {['Property Info', 'Address', 'Property Features', 'Photos', 'Review & Submit'].map((label, i) => {
                        const isActive = step === i + 1;
                        const isCompleted = step > i + 1;
                        return (
                            <div key={i} className="status-step">
                                <div className={`radio ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                    {isCompleted ? '✓' : i + 1}
                                </div>
                                <label>{label}</label>
                            </div>
                        );
                    })}
                </div>

                {/* STEP 1: Basic Property Info */}
                {step === 1 && (
                    <div className="BasicPropertyInfo slide-form active">
                        <div className="heading-1">Basic Property Detail</div>
                        <table>
                            <tbody>
                                <tr><td className='td-1'>Property Title*</td>
                                    <td><input type="text" name="title" value={formData.title} onChange={handleChange} /></td></tr>
                                <tr><td className='td-1'>Property Type*</td>
                                    <td className='td-btn'>
                                        {['House', 'Apartment', 'Plot', 'Commercial'].map(type => (
                                            <button type="button" key={type}
                                                onClick={() => setFormData(prev => ({ ...prev, property_type: type }))}
                                                className={formData.property_type === type ? 'selected' : ''}
                                            >{type}</button>
                                        ))}
                                    </td>
                                </tr>
                                <tr><td className='td-1'>Size*</td>
                                    <td><input type="number" min="0.01" step="0.01" name="size_sqft" value={formData.size_sqft} onChange={handleChange} /></td></tr>
                                <tr><td className='td-1'>Bedrooms</td>
                                    <td><input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} /></td></tr>
                                <tr><td className='td-1'>Bathrooms</td>
                                    <td><input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} /></td></tr>
                                <tr><td className='td-1'>Furnishing</td>
                                    <td>
                                        <select name="furnishing_status" value={formData.furnishing_status} onChange={handleChange}>
                                            <option value="">Select</option>
                                            <option>Furnished</option>
                                            <option>Semi-Furnished</option>
                                            <option>Unfurnished</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr><td className='td-1'>Price*</td>
                                    <td><input type="number" min="0.01" step="0.01" name="price" value={formData.price} onChange={handleChange} /></td></tr>
                                <tr><td></td><td><button onClick={handleNext}>Next</button></td></tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* STEP 2: Address */}
                {step === 2 && (
                    <div className="BasicPropertyInfo slide-form active">
                        <div className="heading-1">Location Details</div>
                        <table>
                            <tbody>
                                <tr><td className='td-1'>City*</td><td><input name="city" value={formData.city} onChange={handleChange} /></td></tr>
                                <tr><td className='td-1'>Locality*</td><td><input name="locality" value={formData.locality} onChange={handleChange} /></td></tr>
                                <tr><td className='td-1'>Address*</td><td><input name="address" value={formData.address} onChange={handleChange} /></td></tr>
                                <tr><td className='td-1'>PIN Code*</td><td><input name="pincode" value={formData.pincode} onChange={handleChange} /></td></tr>
                                <tr>
                                    <td></td>
                                    <td>
                                        <button onClick={handlePrevious}>Previous</button>
                                        <button onClick={handleNext}>Next</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* STEP 3: Property Features */}
                {step === 3 && (
                    <div className="BasicPropertyInfo slide-form active">
                        <div className="heading-1">Property Features</div>
                        <table>
                            <tbody>
                                <tr><td className='td-1'>Construction Status*</td>
                                    <td>
                                        <select name="construction_status" value={formData.construction_status} onChange={handleChange}>
                                            <option value="">Select</option>
                                            <option>Ready to Move</option>
                                            <option>Under Construction</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr><td className='td-1'>Age of Property*</td>
                                    <td>
                                        <select name="age_of_property" value={formData.age_of_property} onChange={handleChange}>
                                            <option value="">Select</option>
                                            <option>New</option>
                                            <option>Less than 5 years</option>
                                            <option>5-10 years</option>
                                            <option>10+ years</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr><td className='td-1'>Floor Number*</td><td><input type="number" name="floor_number" value={formData.floor_number} onChange={handleChange} /></td></tr>
                                <tr><td className='td-1'>Total Floors*</td><td><input type="number" name="total_floors" value={formData.total_floors} onChange={handleChange} /></td></tr>
                                <tr><td className='td-1'>Parking*</td>
                                    <td>
                                        <select name="parking" value={formData.parking} onChange={handleChange}>
                                            <option>Select</option>
                                            <option>Yes</option>
                                            <option>No</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td>
                                        <button onClick={handlePrevious}>Previous</button>
                                        <button onClick={handleNext}>Next</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* STEP 4: Photos */}
                {step === 4 && (
                    <div className="BasicPropertyInfo slide-form active">
                        <div className="heading-1">Upload Property Photos</div>
                        <table>
                            <tbody>
                                <tr><td className='td-1'>Upload Images*</td><td><input type="file" name="images" accept="image/*" multiple onChange={handleFileChange} /></td></tr>
                                <tr><td colSpan="2">You can upload up to 10 property photos.</td></tr>
                                <tr><td className='td-1'>Upload Floor Plan</td><td><input type="file" name="floor_plan" accept="image/*" onChange={handleFileChange} /></td></tr>
                                <tr>
                                    <td></td>
                                    <td>
                                        <button onClick={handlePrevious}>Previous</button>
                                        <button onClick={handleNext}>Next</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* STEP 5: Seller Info */}
                {step === 5 && (
                    <div className="BasicPropertyInfo slide-form active">
                        <div className="heading-1">Seller Info & Submit</div>
                        <table>
                            <tbody>
                                <tr><td className='td-1'>Your Name*</td><td><input name="seller_name" value={formData.seller_name} onChange={handleChange} /></td></tr>
                                <tr><td className='td-1'>Contact Number*</td><td><input name="seller_contact" value={formData.seller_contact} onChange={handleChange} /></td></tr>
                                <tr><td className='td-1'>Email*</td><td><input name="seller_email" value={formData.seller_email} onChange={handleChange} /></td></tr>
                                <tr><td className='td-1'>Seller Type*</td>
                                    <td>
                                        <select name="seller_type" value={formData.seller_type} onChange={handleChange}>
                                            <option>Select</option>
                                            <option>Owner</option>
                                            <option>Agent</option>
                                            <option>Builder</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr><td className='td-1'>Description*</td><td><textarea rows="3" name="description" value={formData.description} onChange={handleChange} /></td></tr>
                                <tr>
                                    <td></td>
                                    <td>
                                        <button onClick={handlePrevious}>Previous</button>
                                        <button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellPage;
