const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  // Add this line to parse JSON request bodies

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Database connection details
const db_config = {
    host: 'localhost',
    user: 'root',
    password: 'Immanuvel@12',
    database: 'diwali'
};

// Create a connection pool
const pool = mysql.createPool(db_config);

// Route to serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/templates/index.html'));
});

// Route for adding a user
app.post('/add_user', (req, res) => {
    const { c_name, c_vill, c_category, phone } = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err;
        const sql = 'INSERT INTO customers (c_name, c_vill, c_category, phone) VALUES (?, ?, ?, ?)';
        connection.query(sql, [c_name, c_vill, c_category, phone], (err, results) => {
            connection.release(); // Release the connection
            if (err) throw err;
            res.json({ message: 'User added successfully', data: { id: results.insertId, c_name, c_vill, c_category, phone } });
        });
    });
});

// Route for adding payments
app.post('/add_payments', (req, res) => {
    const { c_id, p_month } = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err;
        const sql = 'INSERT INTO payments (c_id, p_month) VALUES (?, ?)';
        connection.query(sql, [c_id, p_month], (err, results) => {
            connection.release(); // Release the connection
            if (err) throw err;
            res.json({ message: 'Payment added successfully', data: { c_id, p_month } });
        });
    });
});

// Route for finding a user by ID
app.get('/find_user', (req, res) => {
    const userId = req.query.userId;

    pool.getConnection((err, connection) => {
        if (err) throw err;
        const sql = 'SELECT * FROM customers WHERE c_id = ?';
        connection.query(sql, [userId], (err, results) => {
            connection.release(); // Release the connection
            if (err) throw err;
            res.json(results);
        });
    });
});

// Route for finding payments made by a user
app.get('/find_payments', (req, res) => {
    const userId = req.query.userIdPayments;

    pool.getConnection((err, connection) => {
        if (err) throw err;
        const sql = 'SELECT payments.*, customers.c_name FROM payments JOIN customers ON payments.c_id = customers.c_id WHERE payments.c_id = ?';
        connection.query(sql, [userId], (err, results) => {
            connection.release(); // Release the connection
            if (err) throw err;
            res.json(results);
        });
    });
});

// Route for viewing payments by month
app.get('/view_payments_by_month', (req, res) => {
    const month = req.query.p_month;

    pool.getConnection((err, connection) => {
        if (err) throw err;
        const sql = 'SELECT payments.*, customers.c_name FROM payments JOIN customers ON payments.c_id = customers.c_id WHERE payments.p_month = ?';
        connection.query(sql, [month], (err, results) => {
            connection.release(); // Release the connection
            if (err) throw err;
            res.json(results);
        });
    });
});

// Route for calculating total amount paid by a user
app.get('/total_amount_paid', (req, res) => {
    const userId = req.query.userId;

    pool.getConnection((err, connection) => {
        if (err) throw err;
        const sql = `
            SELECT payments.p_id, category.ct_price
            FROM payments
            JOIN category ON payments.p_month = category.ct_name
            WHERE payments.c_id = ?
        `;
        connection.query(sql, [userId], (err, results) => {
            connection.release(); // Release the connection
            if (err) {
                console.error("Error executing query:", err);
                throw err;
            }
            let totalAmount = 0;
            results.forEach((row) => {
                const categoryPrice = row.ct_price;
                totalAmount += categoryPrice;
            });
            res.json({ total_amount: totalAmount });
        });
    });
});


// Update user details
app.put('/update_user', (req, res) => {
    const { c_id, c_name, c_vill, c_category, phone } = req.body;
    const sql = 'UPDATE customers SET c_name = ?, c_vill = ?, c_category = ?, phone = ? WHERE c_id = ?';
    connection.query(sql, [c_name, c_vill, c_category, phone, c_id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'User updated successfully' });
    });
});


// Route for deleting a user
app.delete('/delete_user', (req, res) => {
    const userId = req.query.userId;

    pool.getConnection((err, connection) => {
        if (err) throw err;

        // Query to get user details before deletion
        const userDetailsQuery = 'SELECT * FROM customers WHERE c_id = ?';
        connection.query(userDetailsQuery, [userId], (err, userDetails) => {
            if (err) {
                connection.release();
                throw err;
            }

            if (userDetails.length === 0) {
                connection.release();
                return res.json({ message: 'User not found' });
            }

            // Query to count payments made by the user
            const paymentsCountQuery = 'SELECT COUNT(*) AS payment_count FROM payments WHERE c_id = ?';
            connection.query(paymentsCountQuery, [userId], (err, paymentsCountResult) => {
                if (err) {
                    connection.release();
                    throw err;
                }

                const paymentCount = paymentsCountResult[0].payment_count;

                // Delete payments made by the user
                const deletePaymentsQuery = 'DELETE FROM payments WHERE c_id = ?';
                connection.query(deletePaymentsQuery, [userId], (err) => {
                    if (err) {
                        connection.release();
                        throw err;
                    }

                    // Delete the user
                    const deleteUserQuery = 'DELETE FROM customers WHERE c_id = ?';
                    connection.query(deleteUserQuery, [userId], (err) => {
                        connection.release();
                        if (err) throw err;

                        res.json({ 
                            message: 'User and associated payments deleted successfully',
                            userDetails: userDetails[0],
                            paymentCount: paymentCount
                        });
                    });
                });
            });
        });
    });
});

// Route for finding all users
app.post('/update_user', (req, res) => {
    const { c_id, c_name, c_vill, c_category, phone } = req.body;
    const sql = 'UPDATE customers SET c_name = ?, c_vill = ?, c_category = ?, phone = ? WHERE c_id = ?';
    pool.query(sql, [c_name, c_vill, c_category, phone, c_id], (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        if (results.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
