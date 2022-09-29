import 'module-alias/register';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from '@/config/config';
import { updateDoctorsDayArrays } from '@/library/CronJobs';
import Log from '@/library/Logging';
import { logTraffic } from '@/middleware/LogTraffic';
import { rules } from '@/middleware/Rules';
import doctorRoutes from '@/routes/Doctor';
import reservationRoutes from '@/routes/Reservation';
import userRoutes from '@/routes/User';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';

const router = express();

// Connect to Mongo
mongoose
	.connect(config.mongo.url, { retryWrites: true, w: 'majority' })
	.then(() => {
		Log.info('Connected to MongoDB.');
		startServer();
		updateDoctorsDayArrays();
	})
	.catch((error) => {
		Log.error('Unable to connect:');
		Log.error(error);
	});

// Start server only if connected to Mongo
const startServer = () => {
	// Middleware
	router.use(express.urlencoded({ extended: true }));
	router.use(express.json());

	//Custom Middleware
	router.use(logTraffic);
	router.use(rules);

	//Creating new session Store
	const sessionStore = new MongoStore({
		mongoUrl: config.mongo.url,
		collectionName: 'sessions'
	});

	//Implementing session Middleware
	router.use(
		session({
			secret: 'someSecret',
			resave: false,
			saveUninitialized: true,
			store: sessionStore,
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 // 1 Day
			}
		})
	);

	router.use(passport.initialize());
	router.use(passport.session());

	require('@/middleware/Passport');
	// Routes
	router.use('/doctor', doctorRoutes);
	router.use('/reservation', reservationRoutes);
	router.use('/user', userRoutes);

	// Healthcheck Route
	router.get('/healthcheck', (req, res, next) => {
		res.status(200).json({ message: 'All good.' });
		Log.debug('Healthcheck - all good.');
	});

	// Error Handling
	router.use((req, res, next) => {
		const error = new Error('Not found');
		Log.error(error);

		return res.status(404).json({ message: error.message });
	});

	http.createServer(router).listen(config.server.port, () => Log.info(`Server running on port ${config.server.port}.`));
};
