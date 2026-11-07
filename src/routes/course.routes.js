'use strict';

const { Router } = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');
const { validateQuery } = require('../middlewares/validate.middleware');
const { getCoursesQuerySchema } = require('../validators/course.validator');
const { getAllCourses } = require('../controllers/course.controller');
const { ROLES } = require('../constants/roles');
const { sendSuccess } = require('../utils/response');

const router = Router();

/**
 * @openapi
 * /api/courses:
 *   get:
 *     summary: Retrieve a list of courses
 *     description: Retrieve all courses with pagination, filtering, searching, and sorting. Any logged-in user can access this endpoint. Standard Users only see courses with availability set to true. Instructors and Admins see all courses and can filter by availability.
 *     tags:
 *       - Courses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Page number (zero-based)
 *         example: 0
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of courses per page (1 to 100)
 *         example: 10
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Case-insensitive search query matching title and tags
 *         example: "Figma"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by course category
 *         example: "Design"
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: Filter by course level (e.g. Beginners, Intermediate, Advanced)
 *         example: "Beginners"
 *       - in: query
 *         name: availability
 *         schema:
 *           type: boolean
 *         description: Filter by course availability (true or false). Ignored for standard Users.
 *         example: true
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, price, title]
 *           default: createdAt
 *         description: Field to sort by
 *         example: "createdAt"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *         example: "desc"
 *     responses:
 *       200:
 *         description: Retrieved all courses successfully
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
 *                   example: "Retrieved all courses successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "6aec5b0c848268f02461857c"
 *                       title:
 *                         type: string
 *                         example: "Course title"
 *                       price:
 *                         type: number
 *                         example: 90
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Product", "Figma"]
 *                       description:
 *                         type: string
 *                         example: "This is your course's description"
 *                       level:
 *                         type: string
 *                         example: "Beginners"
 *                       category:
 *                         type: string
 *                         example: "Design"
 *                       availability:
 *                         type: boolean
 *                         example: true
 *                       instructor:
 *                         type: string
 *                         example: "6aec5b0c848268f02461857c"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-11-05T10:31:40.203Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-11-05T10:31:40.203Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 0
 *                     size:
 *                       type: integer
 *                       example: 10
 *                     totalItems:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Bad Request (Invalid query parameters)
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
 *                   example: "page must be 0 or greater"
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
 *                   example: "Authentication required"
 */
router.get('/', authenticate, validateQuery(getCoursesQuerySchema), getAllCourses);

/**
 * @openapi
 * /api/courses:
 *   post:
 *     summary: Create a new course (Instructor and Admin only)
 *     description: Create a new course. Allowed for Instructor and Admin accounts only. Normal Users receive 403 Forbidden.
 *     tags:
 *       - Courses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Full Stack Web Development
 *               description:
 *                 type: string
 *                 example: Learn web development from scratch
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Course created successfully
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
 *       403:
 *         description: Forbidden (Access denied, insufficient permissions)
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
 *                   example: "Access denied: insufficient permissions"
 */
router.post('/', authenticate, authorize(ROLES.INSTRUCTOR, ROLES.ADMIN), (req, res) => {
  return sendSuccess(res, 201, 'Course created successfully', {
    course: req.body || {},
    createdBy: {
      id: req.user._id,
      accountType: req.user.accountType,
    },
  });
});

module.exports = router;
