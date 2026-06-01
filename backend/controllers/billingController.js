const Bill = require('../models/Bill');
const Patient = require('../models/Patient');

const billingController = {
    // Get all bills
    getAllBills: async (req, res) => {
        try {
            let bills;
            
            if (req.user.role === 'patient') {
                const patient = await Patient.getByUserId(req.user.id);
                if (patient) {
                    bills = await Bill.getByPatientId(patient.id);
                } else {
                    bills = [];
                }
            } else {
                bills = await Bill.getAll();
            }
            
            // Get bill items for each bill
            const billsWithItems = await Promise.all(bills.map(async (bill) => {
                const items = await Bill.getItems(bill.id);
                return {
                    ...bill,
                    items
                };
            }));
            
            res.json(billsWithItems);
        } catch (error) {
            console.error('Get bills error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Get bills for current patient
    getMyBills: async (req, res) => {
        try {
            const patient = await Patient.getByUserId(req.user.id);
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            
            const bills = await Bill.getByPatientId(patient.id);
            
            // Get bill items for each bill
            const billsWithItems = await Promise.all(bills.map(async (bill) => {
                const items = await Bill.getItems(bill.id);
                return {
                    id: bill.bill_number,
                    date: bill.date,
                    dueDate: bill.due_date,
                    description: bill.description,
                    doctor: bill.doctor_name,
                    department: bill.department,
                    items: items,
                    insurance: bill.insurance_amount,
                    totalAmount: bill.total_amount,
                    status: bill.status,
                    paidDate: bill.paid_date,
                    method: bill.payment_method
                };
            }));
            
            res.json(billsWithItems);
        } catch (error) {
            console.error('Get my bills error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Create new bill
    createBill: async (req, res) => {
        try {
            const { patientId, patientName, doctorName, department, description, items, insurance } = req.body;
            
            // Calculate amounts
            const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
            const totalAmount = subtotal - (insurance || 0);
            const billNumber = Bill.generateBillNumber();
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);
            
            // Create bill
            const billId = await Bill.create({
                bill_number: billNumber,
                patient_id: patientId,
                patient_name: patientName,
                doctor_name: doctorName,
                department,
                description,
                date: new Date().toISOString().split('T')[0],
                due_date: dueDate.toISOString().split('T')[0],
                subtotal,
                insurance_amount: insurance || 0,
                total_amount: totalAmount,
                status: 'Unpaid'
            });
            
            // Add bill items
            for (const item of items) {
                await Bill.addItem(billId, item.label, item.amount);
            }
            
            res.json({
                success: true,
                message: 'Bill created successfully',
                billNumber,
                billId
            });
            
        } catch (error) {
            console.error('Create bill error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Process payment
    processPayment: async (req, res) => {
        try {
            const { method } = req.body;
            const { billNumber } = req.params;
            
            const updated = await Bill.processPayment(billNumber, method);
            if (updated === 0) {
                return res.status(404).json({ message: 'Bill not found' });
            }
            
            res.json({
                success: true,
                message: 'Payment processed successfully'
            });
            
        } catch (error) {
            console.error('Process payment error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Get revenue summary
    getRevenueSummary: async (req, res) => {
        try {
            const summary = await Bill.getRevenueSummary();
            res.json(summary);
        } catch (error) {
            console.error('Get revenue summary error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },
    
    // Get bill by number
    getBillByNumber: async (req, res) => {
        try {
            const bill = await Bill.getByBillNumber(req.params.billNumber);
            if (!bill) {
                return res.status(404).json({ message: 'Bill not found' });
            }
            
            const items = await Bill.getItems(bill.id);
            res.json({ ...bill, items });
        } catch (error) {
            console.error('Get bill error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = billingController;