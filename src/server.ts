import './util/prototype'; //! must be first
import startServer from './util/server/startServer';
import { NotificationJobs } from './app/modules/notification/Notification.job';

startServer().then(NotificationJobs.publishing);
