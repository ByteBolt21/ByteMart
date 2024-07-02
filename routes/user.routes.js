import express from 'express';
const router = express.Router();

import { signup, signin, getAllUsers, getUserById, deleteUser , updateUser, exportUsers , verifyUser ,
    requestPasswordReset,
    resetPassword,bulkImportUsers
 } from '../controllers/user.controller.js';
import auth from '../middlewares/auth.js';
import csvUpload from '../middlewares/csvUpload.js';

// Routes for user signup and signin
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/verify/:token', verifyUser);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);

// Route for bulk user import
router.post('/bulk-import', auth(['seller']), csvUpload.single('file'), bulkImportUsers);

//export users
router.get('/export', auth(['seller']),exportUsers);

// Routes for getting all users and specific user by ID
router.get('/', getAllUsers);
router.get('/:userId', getUserById);

// Route for deleting a user by ID
router.put('/:userId', updateUser);
router.delete('/:userId', deleteUser);


export default router;
