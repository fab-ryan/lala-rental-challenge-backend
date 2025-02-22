# LaLa Rental Properties

## Features

### Backend

1. **User Authentication**

   - Google Sign-In (OAuth authentication and verification) for user registration and login.
   - Secure login and logout functionalities.
   - User roles: Renters (who book properties) and Hosts (who list properties).

2. **Property Listings**

   - Hosts can create, update, and delete property listings.
   - Renters can view all available properties on the front page.
   - Each property includes the following details:
     - Title
     - Description
     - Price per night
     - Location
     - Host ID

3. **Booking System**

   - Renters can book properties by specifying check-in and check-out dates.
   - Prevent double-booking for the same dates.
   - Booking statuses include:
     - Pending (awaiting confirmation)
     - Confirmed (approved by the host)
     - Canceled
   - Secure storage of booking records.

### Frontend

- A well-designed homepage showcasing available properties.
- Integration with the backend for dynamic property and booking management.
- Responsive design for an optimal user experience across devices.

## Project Setup

### Installation

```bash
$ npm install
```

### Compile and Run the Project

```bash
# Development mode
$ npm run start

# Watch mode
$ npm run start:dev

# Production mode
$ npm run start:prod
```

### Testing

```bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## Deployment

To deploy the application, follow these steps for production readiness. Visit the [NestJS Deployment Documentation](https://docs.nestjs.com/deployment) for more details.

If you're looking for a cloud-based platform, consider using [NestJS Mau](https://mau.nestjs.com), which simplifies AWS deployment:

```bash
$ npm install -g mau
$ mau deploy
```

## Environment Variables

Make sure to create a `.env` file with the following configuration:

```env
PREFIX=api
PORT=5200
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_SYNCHRONIZE=
MAIL_HOST=
MAIL_USER=
MAIL_PASS=
MAIL_PORT=587
MAIL_FROM=
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com)



