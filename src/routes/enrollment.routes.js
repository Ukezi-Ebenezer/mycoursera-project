'use strict';

const { Router } = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { enrollLimiter } = require('../middlewares/rateLimit.middleware');
const { validateParams } = require('../middlewares/validate.middleware');
const { courseIdParamSchema } = require('../validators/course.validator');
const { enrollCourse } = require('../controllers/enrollment.controller');

const router = Router();

/**
 * @openapi
 * /api/courses/{id}/enroll:
 *   post:
 *     summary: Enroll in a course
 *     description: Enroll the authenticated user into an available course. Any logged-in role can enroll in courses (except instructors cannot enroll in their own course). Free courses enroll immediately; paid courses process payment via the configured gateway.
 *     tags:
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
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Course fee to pay (must match the database price)
 *                 example: 30
 *               courseId:
 *                 type: string
 *                 description: Optional course ObjectId (if provided, must match route parameter :id)
 *                 example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *     responses:
 *       200:
 *         description: Course enrolled successfully
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
 *                   example: Course enrolled successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "64f1a2b3c4d5e6f7a8b9c0d5"
 *                       amount:
 *                         type: string
 *                         example: "$30"
 *                       courseId:
 *                         type: string
 *                         example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                       user:
 *                         type: string
 *                         example: "64f1a2b3c4d5e6f7a8b9c0a1"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       progress:
 *                         type: number
 *                         example: 0
 *                       paymentStatus:
 *                         type: string
 *                         example: "paid"
 *                       transactionDate:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad Request (Invalid course id, amount mismatch, or courseId in body mismatch)
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
 *                   example: Amount does not match the course price
 *       401:
 *         description: Unauthorized (Missing or invalid token)
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
 *       402:
 *         description: Payment Required (Payment charge failed)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 402
 *                 message:
 *                   type: string
 *                   example: Payment failed
 *       403:
 *         description: Forbidden (Instructor attempting to enroll in own course)
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
 *                   example: You cannot enroll in your own course
 *       404:
 *         description: Not Found (Course not found or unavailable)
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
 *                   example: Course not found
 *       409:
 *         description: Conflict (Already enrolled in this course)
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
 *                   example: You are already enrolled in this course
 *       429:
 *         description: Too Many Requests (Rate limit exceeded)
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
 *                   example: Too many attempts, please try again later
 *       503:
 *         description: Service Unavailable (Payment gateway not configured)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 503
 *                 message:
 *                   type: string
 *                   example: Payment gateway not configured
 */
router.post(
  '/:id/enroll',
  authenticate,
  enrollLimiter,
  validateParams(courseIdParamSchema),
  enrollCourse
);

module.exports = router;
