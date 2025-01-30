const express = require('express');
const router = express.Router();

let users = [];

router.post('/users', (req, res) => {
    const { name, email } = req.body;
    const CurrentBookings=0;
    const MaxBookings=3;
    const user = { id: users.length + 1, name, email, CurrentBookings, MaxBookings };
    users.push(user);
    res.json(user);
});

router.get('/users/:userId', (req, res) => {
    const user = users.find(o => o.id == req.params.userId);
    if(user){
        res.json(user);
    }
    else{
        res.json('User not found');
    }
});

router.put('/users/:userId', (req, res) => {
    const user = users.find(o => o.id == req.params.userId);
    if (!user){
        return res.status(404).json({ error: 'User not found' });
    } 
    user.CurrentBookings = req.body.CurrentBookings;
    res.json(user);
});

module.exports = router;
