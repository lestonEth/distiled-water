# AquaPure - Distilled Water Management System

A comprehensive web application for managing distilled water e-commerce operations, built with Next.js, React, and Tailwind CSS.

## Features

### 🔐 Authentication System
- User registration and login
- Multiple user roles: Customer, Admin, Quality Tester, Transporter
- Secure password handling
- Role-based access control

### 👥 User Management
- Customer registration with profile management
- Admin panel for user oversight
- Transporter registration with vehicle information
- Quality tester accounts

### 📦 Order Management
- Easy order placement with quantity selection
- Real-time order tracking
- Admin approval workflow
- Transporter assignment
- Delivery status updates

### 🧪 Quality Testing
- Container quality control system
- Tester approval/rejection workflow
- Test notes and documentation
- Quality assurance tracking

### 🚚 Delivery Management
- Transporter dashboard
- Vehicle information management
- Delivery status tracking
- Route optimization support

### ⭐ Feedback System
- Customer rating system
- Delivery feedback collection
- Service quality monitoring
- Admin feedback oversight

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Storage**: localStorage (simulating database)
- **Icons**: Lucide React
- **Routing**: Next.js App Router

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd distilled-water-management
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### For Customers
1. Register as a "Customer" user type
2. Login to access your dashboard
3. Place orders by specifying quantity and delivery details
4. Track order status in real-time
5. Leave feedback after delivery completion

### For Admins
1. Register as an "Admin" user type
2. Access the admin panel to:
   - View and manage all orders
   - Approve/reject orders
   - Assign transporters to orders
   - Monitor user activity
   - Review customer feedback

### For Quality Testers
1. Register as a "Quality Tester" user type
2. Access the testing interface to:
   - Review container quality
   - Approve or reject containers
   - Add testing notes
   - Track testing history

### For Transporters
1. Register as a "Transporter" user type
2. Provide vehicle information during registration
3. Access transporter dashboard to:
   - View assigned deliveries
   - Update delivery status
   - Manage vehicle information
   - Track delivery history

## Data Structure

The application uses localStorage to simulate a database with the following data models:

### Users
\`\`\`json
{
  "id": "unique-id",
  "name": "User Name",
  "email": "user@example.com",
  "password": "hashed-password",
  "phone": "phone-number",
  "address": "user-address",
  "userType": "user|admin|tester|transporter",
  "vehicleId": "vehicle-id", // for transporters
  "vehicleName": "vehicle-name", // for transporters
  "vehicleSize": "small|medium|large", // for transporters
  "createdAt": "ISO-date"
}
\`\`\`

### Orders
\`\`\`json
{
  "id": "unique-id",
  "userId": "customer-id",
  "quantity": 10,
  "deliveryAddress": "delivery-address",
  "preferredDeliveryTime": "morning|afternoon|evening|anytime",
  "specialInstructions": "special-notes",
  "totalAmount": 250,
  "status": "pending|approved|in_transit|delivered|rejected",
  "transporterId": "transporter-id",
  "createdAt": "ISO-date",
  "startTime": "ISO-date",
  "deliveredTime": "ISO-date"
}
\`\`\`

### Containers
\`\`\`json
{
  "id": "container-id",
  "weight": 20,
  "manufactureDate": "ISO-date",
  "expiryDate": "ISO-date",
  "approved": true|false|null,
  "testerId": "tester-id",
  "testNotes": "testing-notes",
  "testedAt": "ISO-date",
  "createdAt": "ISO-date"
}
\`\`\`

### Feedback
\`\`\`json
{
  "id": "unique-id",
  "userId": "customer-id",
  "orderId": "order-id",
  "transporterId": "transporter-id",
  "rating": 5,
  "comment": "feedback-comment",
  "createdAt": "ISO-date"
}
\`\`\`

## Key Features Explained

### Role-Based Access Control
- Different user types have access to different parts of the application
- Automatic redirection based on user role after login
- Protected routes ensure users can only access appropriate sections

### Order Workflow
1. Customer places order
2. Admin reviews and approves/rejects
3. Admin assigns transporter
4. Transporter picks up and delivers
5. Customer provides feedback

### Quality Control
- Containers are automatically generated for testing
- Testers can approve or reject containers with notes
- Quality tracking ensures only approved containers are used

### Real-time Updates
- Order status updates reflect immediately across all user types
- Dashboard statistics update in real-time
- Responsive design works on all device sizes

## Customization

### Adding New User Types
1. Update the registration form in `app/auth/register/page.tsx`
2. Add new routes for the user type
3. Update the login redirect logic
4. Create appropriate dashboard components

### Modifying Order Workflow
1. Update order status options in utility functions
2. Modify the admin approval process
3. Adjust transporter workflow as needed
4. Update status tracking components

### Styling Customization
- Modify `tailwind.config.ts` for theme changes
- Update component styles in individual files
- Customize shadcn/ui components as needed

## Deployment

### Vercel (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
1. Build the application: `npm run build`
2. Deploy the `out` folder to your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.
