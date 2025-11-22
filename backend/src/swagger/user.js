/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get information about the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged user details
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Access rules:
 *         - **GLOBAL_ADMIN** - can view any user  
 *         - **ORG_ADMIN** - can view only users from their organization
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       403:
 *         description: Forbidden — user belongs to another organization
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users depending on role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Returned users depend on the logged-in user's role:
 *         - **GLOBAL_ADMIN** - all users  
 *         - **ORG_ADMIN** - only users in their organization
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - **GLOBAL_ADMIN** - can create users in any organization  
 *       - **ORG_ADMIN** - can create users *only* inside their organization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               organization_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 5
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Smith"
 *               email:
 *                 type: string
 *                 example: "john.smith@example.com"
 *               password:
 *                 type: string
 *                 example: "StrongPassword123!"
 *               role:
 *                 type: string
 *                 enum: [GLOBAL_ADMIN, ORG_ADMIN, EMPLOYEE]
 *                 example: "EMPLOYEE"
 *               position:
 *                 type: string
 *                 example: "Waiter"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Email already in use or validation error
 *       403:
 *         description: ORG_ADMIN can only create users in their organization
 */

/**
 * @swagger
 * /api/users/organization/{organization_id}:
 *   get:
 *     summary: Get users by organization ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Access rules:
 *         - **GLOBAL_ADMIN** - any organization  
 *         - **ORG_ADMIN** - only their own organization
 *     parameters:
 *       - in: path
 *         name: organization_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Not allowed to view users from another organization
 *       404:
 *         description: Organization not found
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - **GLOBAL_ADMIN** - can delete any user  
 *       - **ORG_ADMIN** - only users from their organization
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */

/**
* @swagger
* /api/users/{id}:
*   patch:
*     summary: Update user information
*     tags: [Users]
*     security:
*       - bearerAuth: []
*     description: |
*       - **GLOBAL_ADMIN** – can update ANY user  
*       - **ORG_ADMIN** – can update ONLY users from their organization
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: integer
*         description: ID of the user to update
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               first_name:
*                 type: string
*                 example: "John"
*               last_name:
*                 type: string
*                 example: "Smith"
*               role:
*                 type: string
*                 enum: [GLOBAL_ADMIN, ORG_ADMIN, EMPLOYEE]
*                 example: "ORG_ADMIN"
*               position:
*                 type: string
*                 example: "Manager"
*     responses:
*       200:
*         description: User successfully updated
*       403:
*         description: Forbidden – insufficient permissions
*       404:
*         description: User not found
*/

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change password for the logged-in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Current password incorrect or same as new
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/{id}/reset-password:
 *   post:
 *     summary: Reset password for a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - **GLOBAL_ADMIN** - can reset any password  
 *       - **ORG_ADMIN** - only within their own organization
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_password
 *             properties:
 *               new_password:
 *                 type: string
 *                 example: "NewStrongPassword123!"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       403:
 *         description: Not allowed
 *       404:
 *         description: User not found
 */
