const jwt = require("jsonwebtoken");
const auth = require("../src/middlewares/auth.middleware");

jest.mock("jsonwebtoken");

describe("auth middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  test("should return error when Authorization header is missing", () => {
    const middleware = auth();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith({
      type: "BUSINESS_LOGIC",
      message: "Missing token",
      statusCode: 401,
    });
  });

  test("should return error when token verification fails", () => {
    const middleware = auth();
    req.headers.authorization = "Bearer fake_token";

    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith({
      type: "BUSINESS_LOGIC",
      message: "Unauthorized: Invalid or expired token",
      statusCode: 401,
    });
  });

  test("should attach decoded user to req when token is valid", () => {
    const middleware = auth();
    req.headers.authorization = "Bearer valid_token";

    const decodedUser = { user_id: 1, role: "EMPLOYEE" };
    jwt.verify.mockReturnValue(decodedUser);

    middleware(req, res, next);

    expect(req.user).toEqual(decodedUser);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  test("should forbid access when role is insufficient", () => {
    const middleware = auth(["ORG_ADMIN"]);
    req.headers.authorization = "Bearer token";

    jwt.verify.mockReturnValue({ user_id: 1, role: "EMPLOYEE" });

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith({
      type: "BUSINESS_LOGIC",
      message: "Forbidden: Insufficient role",
      statusCode: 403,
    });
  });

  test("should allow access when role is sufficient", () => {
    const middleware = auth(["ORG_ADMIN"]);
    req.headers.authorization = "Bearer token";

    jwt.verify.mockReturnValue({ user_id: 1, role: "ORG_ADMIN" });

    middleware(req, res, next);

    expect(req.user).toEqual({ user_id: 1, role: "ORG_ADMIN" });
    expect(next).toHaveBeenCalledWith();
  });
});
