const express = require('express');
const axios = require('axios');
const router = express.Router();

let bookings = [];

router.post('/bookings', async (req, res) => {
    const { userId, carId, startDate, endDate } = req.body;
    
    const userResponse = await axios.get(`http://localhost:3001/users/${userId}`);
    const carResponse = await axios.get(`http://localhost:3002/cars/${carId}`);
    const user = userResponse.data;
    const car = carResponse.data;
    
    if (!user || !car) {
        return res.status(400).json({ error: 'User or Car not found' });
    }
    if (user.activeBookings >= user.maxBookings || !car.isAvailable) {
        return res.status(400).json({ error: 'Booking not allowed' });
    }
    
    const booking = { id: bookings.length + 1, userId, carId, startDate, endDate, status: 'active' };
    bookings.push(booking);
    
    await axios.put(`http://localhost:3001/users/${userId}`, { activeBookings: user.activeBookings + 1 });
    await axios.put(`http://localhost:3002/cars/${carId}`, { isAvailable: false });
    
    res.json(booking);
});

router.get('/bookings/:userId', (req, res) => {
    const userBookings = bookings.filter(b => b.userId == req.params.userId);
    res.json(userBookings);
});

router.delete('/bookings/:bookingId', async (req, res) => {
    const bookingIndex = bookings.findIndex(b => b.id == req.params.bookingId);
    if (bookingIndex === -1) return res.status(400).json({ error: 'Booking not found' });
    
    const booking = bookings[bookingIndex];
    bookings.splice(bookingIndex, 1);
    
    const userResponse = await axios.get(`http://localhost:3001/users/${booking.userId}`);
    const carResponse = await axios.get(`http://localhost:3002/cars/${booking.carId}`);
    const user = userResponse.data;
    const car = carResponse.data;
    
    await axios.put(`http://localhost:3001/users/${booking.userId}`, { activeBookings: user.activeBookings - 1 });
    await axios.put(`http://localhost:3002/cars/${booking.carId}`, { isAvailable: true });
    
    res.json({ message: 'Booking cancelled' });
});

module.exports = router;
