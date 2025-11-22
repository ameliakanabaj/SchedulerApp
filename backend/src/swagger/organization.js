/**
 * @swagger
 * /api/organizations/:
 *   post:
 *     summary: Create a new organization
 *     tags:
 *       - Organization
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Anne's Bakery"
 *     responses:
 *       201:
 *         description: Organization successfully created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Only GLOBAL_ADMIN or ORG_ADMIN can create organizations
 */

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: Get list of organizations
 *     description: |
 *       Returned data depends on user role:
 *         - **GLOBAL_ADMIN** → returns all organizations  
 *         - **ORG_ADMIN** → returns only the organization assigned to the user  
 *         - **Other users** → returns an empty array  
 *     tags:
 *       - Organization
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of organizations depending on user role
 *         

/**
 * @swagger
 * /api/organizations/{id}:
 *   get:
 *     summary: Get organization by ID
 *     tags:
 *       - Organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Organization data
 *       403:
 *         description: Access denied - user cannot access this organization
 *       404:
 *         description: Organization not found
 */

/**
 * @swagger
 * /api/organizations/{id}:
 *   patch:
 *     summary: Update an organization
 *     tags:
 *       - Organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Organization Name"
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *       403:
 *         description: Only GLOBAL_ADMIN or this organizations admin can update this organization
 *       404:
 *         description: Organization not found
 */

/**
 * @swagger
 * /api/organizations/{id}:
 *   delete:
 *     summary: Delete an organization
 *     tags:
 *       - Organization
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Organization deleted
 *       403:
 *         description: Only GLOBAL_ADMIN can delete organizations
 *       404:
 *         description: Organization not found
 */
