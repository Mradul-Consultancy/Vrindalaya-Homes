import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import './MyListings.css';

const MyListings = () => {
    const [listings, setListings] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const loadListings = useCallback(async () => {
        try {
            const { data } = await api.get('/property/mine/', { params: { page },
                headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
            });
            setListings(data.results);
            setPageCount(Math.max(1, Math.ceil(data.count / 12)));
            setError('');
        } catch {
            setError('Could not load your listings. Please sign in again and retry.');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        loadListings();
    }, [loadListings]);

    const markSold = async (id) => {
        try {
            await api.post(`/property/mine/${id}/sold/`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
            });
            setListings(current => current.map(listing => (
                listing.id === id ? { ...listing, status: 'Sold' } : listing
            )));
        } catch {
            setError('Could not update the listing status.');
        }
    };

    const startEditing = (listing) => {
        setEditingId(listing.id);
        setEditData({
            title: listing.title,
            price: listing.price,
            city: listing.city,
            locality: listing.locality,
            description: listing.description,
        });
    };

    const saveEdits = async (event) => {
        event.preventDefault();
        try {
            const { data } = await api.patch(`/property/mine/${editingId}/`, editData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
            });
            setListings(current => current.map(listing => (
                listing.id === editingId ? data : listing
            )));
            setEditingId(null);
            setError('');
        } catch (editError) {
            const details = editError.response?.data;
            setError(typeof details === 'string' ? details : JSON.stringify(details || 'Could not save listing changes.'));
        }
    };

    const deleteListing = async (id) => {
        if (!window.confirm('Delete this property listing? This cannot be undone.')) return;
        try {
            await api.delete(`/property/mine/${id}/`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
            });
            setListings(current => current.filter(listing => listing.id !== id));
        } catch {
            setError('Could not delete the listing.');
        }
    };

    return (
        <main className="MyListingsPage">
            <header>
                <Link to="/">Banke Bihari Group</Link>
                <nav>
                    <Link to="/buy">Buy</Link>
                    <Link to="/sell">Post a property</Link>
                </nav>
            </header>
            <section>
                <h1>My property listings</h1>
                {error && <p role="alert">{error}</p>}
                {loading ? <p>Loading your listings...</p> : listings.length === 0 ? (
                    <p>You have not submitted any property listings yet.</p>
                ) : listings.map(listing => (
                    <article key={listing.id} className="MyListingCard">
                        <div>
                            {editingId === listing.id ? (
                                <form className="MyListingEdit" onSubmit={saveEdits}>
                                    <label>Title<input required maxLength="255" name="title" value={editData.title} onChange={(event) => setEditData(current => ({ ...current, title: event.target.value }))} /></label>
                                    <label>Price (₹)<input required type="number" min="0.01" step="0.01" name="price" value={editData.price} onChange={(event) => setEditData(current => ({ ...current, price: event.target.value }))} /></label>
                                    <label>City<input required name="city" value={editData.city} onChange={(event) => setEditData(current => ({ ...current, city: event.target.value }))} /></label>
                                    <label>Locality<input required name="locality" value={editData.locality} onChange={(event) => setEditData(current => ({ ...current, locality: event.target.value }))} /></label>
                                    <label>Description<textarea required name="description" value={editData.description} onChange={(event) => setEditData(current => ({ ...current, description: event.target.value }))} /></label>
                                    <button type="submit">Save changes</button>
                                    <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
                                </form>
                            ) : (
                                <>
                                    <h2>{listing.title}</h2>
                                    <p>{listing.city}, {listing.locality} · ₹{Number(listing.price).toLocaleString('en-IN')}</p>
                                </>
                            )}
                            <p>Status: <strong>{listing.status}</strong></p>
                        </div>
                        <div className="MyListingActions">
                            {editingId !== listing.id && (
                                <button type="button" onClick={() => startEditing(listing)}>Edit</button>
                            )}
                            {listing.status === 'Active' && (
                                <button type="button" onClick={() => markSold(listing.id)}>Mark as sold</button>
                            )}
                            <button type="button" onClick={() => deleteListing(listing.id)}>Delete</button>
                        </div>
                    </article>
                ))}
                {!loading && pageCount > 1 && (
                    <nav className="MyListingsPagination" aria-label="Your listing pages">
                        <button type="button" onClick={() => setPage(current => current - 1)} disabled={page <= 1}>Previous</button>
                        <span>Page {page} of {pageCount}</span>
                        <button type="button" onClick={() => setPage(current => current + 1)} disabled={page >= pageCount}>Next</button>
                    </nav>
                )}
            </section>
        </main>
    );
};

export default MyListings;
