'use strict';

const { Router } = require('express');
const { getCurrentUser, updateUser } = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

/**
 * @openapi
 * /api/users/current:
 *   get:
 *     summary: Get current logged-in user profile details
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retrieved a current logged in profile successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Retrieved a current logged in profile successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "6ae9fc4b4d0254b4ca4dbe17"
 *                     name:
 *                       type: string
 *                       example: Test name
 *                     email:
 *                       type: string
 *                       example: test@test.com
 *                     accountType:
 *                       type: string
 *                       example: User
 *                     phoneNumber:
 *                       type: string
 *                       example: "8124566736"
 *                     occupation:
 *                       type: string
 *                       example: Software Engineer
 *                     dateOfBirth:
 *                       type: string
 *                       example: "1995-05-15"
 *                     address:
 *                       type: object
 *                       properties:
 *                         street:
 *                           type: string
 *                           example: No. 6 Prince Okey
 *                         state:
 *                           type: string
 *                           example: Rivers
 *                         country:
 *                           type: string
 *                           example: Nigeria
 *                         countryCode:
 *                           type: string
 *                           example: "+123"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized / Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Authentication required
 */
router.get('/current', authenticate, (req, res, next) => getCurrentUser(req, res, next));

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: test@test.com
 *               phone_number:
 *                 type: string
 *                 example: "1234567890"
 *               country:
 *                 type: string
 *                 example: United States
 *               state:
 *                 type: string
 *                 example: California
 *               countryCode:
 *                 type: string
 *                 example: "+1"
 *               occupation:
 *                 type: string
 *                 example: Developer
 *               address:
 *                 type: string
 *                 example: 123 Main St
 *               dateOfBirth:
 *                 type: string
 *                 example: "1995-05-15"
 *     responses:
 *       200:
 *         description: User edited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: User edited successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "6ae9fc4b4d0254b4ca4dbe17"
 *                     first_name:
 *                       type: string
 *                       example: John
 *                     last_name:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: test@test.com
 *                     phone_number:
 *                       type: string
 *                       example: "1234567890"
 *                     country:
 *                       type: string
 *                       example: United States
 *                     state:
 *                       type: string
 *                       example: California
 *                     countryCode:
 *                       type: string
 *                       example: "+1"
 *                     occupation:
 *                       type: string
 *                       example: Developer
 *                     address:
 *                       type: string
 *                       example: 123 Main St
 *                     dateOfBirth:
 *                       type: string
 *                       example: "1995-05-15"
 *       400:
 *         description: Bad Request (Invalid user id, validation error, or no valid fields to update)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Invalid user id
 *       401:
 *         description: Unauthorized / Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Authentication required
 *       403:
 *         description: Forbidden / Cannot update another user's profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: You can only update your own profile
 *       409:
 *         description: Conflict / Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 409
 *                 message:
 *                   type: string
 *                   example: Email already in use
 */
router.put('/:id', authenticate, (req, res, next) => updateUser(req, res, next));

module.exports = router;
