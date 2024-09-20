document.getElementById('addUserFormData').addEventListener('submit', function(e) {
    e.preventDefault();
    const c_name = document.getElementById('c_name').value;
    const c_vill = document.getElementById('c_vill').value;
    const c_category = document.getElementById('c_category').value;
    const phone = document.getElementById('phone').value;

    fetch('/add_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ c_name, c_vill, c_category, phone })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    });
});

document.getElementById('addPaymentsFormData').addEventListener('submit', function(e) {
    e.preventDefault();
    const c_id = document.getElementById('c_id').value;
    const p_month = document.getElementById('p_month').value;

    fetch('/add_payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ c_id, p_month })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    });
});

document.getElementById('findUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const userId = document.getElementById('userId').value;

    fetch(`/find_user?userId=${userId}`)
    .then(response => response.json())
    .then(data => {
        alert(JSON.stringify(data));
    });
});

document.getElementById('findPaymentsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const userIdPayments = document.getElementById('userIdPayments').value;

    fetch(`/find_payments?userIdPayments=${userIdPayments}`)
    .then(response => response.json())
    .then(data => {
        alert(JSON.stringify(data));
    });
});

document.getElementById('viewPaymentsByMonthForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const p_month_view = document.getElementById('p_month_view').value;

    fetch(`/view_payments_by_month?p_month_view=${p_month_view}`)
    .then(response => response.json())
    .then(data => {
        alert(JSON.stringify(data));
    });
});

document.getElementById('findTotalAmountForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const userIdTotalAmount = document.getElementById('userIdTotalAmount').value;

    fetch(`/total_amount_paid?userIdTotalAmount=${userIdTotalAmount}`)
    .then(response => response.json())
    .then(data => {
        document.getElementById('totalAmount').innerText = `Total Amount Paid: ${data.total_amount}`;
        document.getElementById('totalAmountResult').classList.remove('hidden');
    });
});

function showAddUserForm() {
    document.getElementById('addUserForm').classList.remove('hidden');
    document.getElementById('addPaymentsForm').classList.add('hidden');
}

function showAddPaymentsForm() {
    document.getElementById('addPaymentsForm').classList.remove('hidden');
    document.getElementById('addUserForm').classList.add('hidden');
}
