/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Checks API and database health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API and database are working correctly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 message:
 *                   type: string
 *                   example: "API and Database connection are healthy"
 *                 time:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-22T12:34:56.789Z"
 *       500:
 *         description: Database connection failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Database connection failed"
 *                 error:
 *                   type: string
 *                   example: "connection timeout"
 */
