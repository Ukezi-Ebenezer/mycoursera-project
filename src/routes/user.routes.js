'use strict';

const { Router } = require('express');
const { getCurrentUser, updateUser } = require('../controllers/user.controller');
const { completeCourse } = require('../controllers/enrollment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { completeLimiter } = require('../middlewares/rateLimit.middleware');
const { validateParams } = require('../middlewares/validate.middleware');
const { courseIdParamSchema } = require('../validators/course.validator');

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
 * /api/users/courses/{id}:
 *   put:
 *     summary: Complete a course
 *     description: Mark an enrolled course as completed or update completion status.
 *     tags:
 *       - Users
 *       - Enrollments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: 24-character hexadecimal MongoDB ObjectId of the course
 *         example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isCompleted
 *             properties:
 *               isCompleted:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Course successfully marked
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
 *                   example: "Course successfully marked"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "64f1a2b3c4d5e6f7a8b9c0d2"
 *                     courseId:
 *                       type: string
 *                       example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                     title:
 *                       type: string
 *                       example: "Full Stack Web Development"
 *                     description:
 *                       type: string
 *                       example: "Learn full stack development from scratch"
 *                     isCompleted:
 *                       type: boolean
 *                       example: true
 *                     progress:
 *                       type: integer
 *                       example: 100
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-11-10T14:00:00.000Z"
 *       400:
 *         description: Bad request (invalid course id, invalid body, or marking completed course as incomplete)
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
 *                   example: "Invalid course id"
 *       401:
 *         description: Unauthorized (missing, invalid, or revoked token)
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
 *                   example: "Authentication required"
 *       404:
 *         description: Not found (not enrolled in the course)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "You are not enrolled in this course"
 *       409:
 *         description: Conflict (course has been dropped)
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
 *                   example: "You have dropped this course"
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 429
 *                 message:
 *                   type: string
 *                   example: "Too many attempts, please try again later"
 */
router.put(
  '/courses/:id',
  authenticate,
  completeLimiter,
  validateParams(courseIdParamSchema),
  completeCourse
);

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
