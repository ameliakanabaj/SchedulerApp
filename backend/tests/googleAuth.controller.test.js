jest.mock("../src/services/googleCalendar.service");
jest.mock("../src/models/user.model");

const googleAuthController = require("../src/controllers/googleAuth.controller");
const googleCalendarService = require("../src/services/googleCalendar.service");

let req, res, next;

beforeEach(() => {
  req = { body: {}, params: {}, query: {}, user: {} };
  res = { status: jest.fn().mockReturnThis(), json: jest.fn(), redirect: jest.fn() };
  next = jest.fn();
  jest.clearAllMocks();
});

describe("Google Auth Controller", () => {
  
  describe("connect", () => {
    it("should return Google Auth URL", async () => {
      req.user = { user_id: 1 };
      const mockUrl = "https://accounts.google.com/o/oauth2/v2/auth?test=true";
      googleCalendarService.getAuthUrl.mockReturnValue(mockUrl);

      await googleAuthController.connect(req, res, next);

      expect(googleCalendarService.getAuthUrl).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ url: mockUrl });
    });

    it("should call next if getAuthUrl throws error", async () => {
      const error = new Error("Auth service error");
      googleCalendarService.getAuthUrl.mockImplementation(() => { throw error; });

      await googleAuthController.connect(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("disconnect", () => {
    it("should disconnect user and return success message", async () => {
      req.user = { user_id: 1 };
      googleCalendarService.disconnectUser.mockResolvedValue({ user_id: 1 });

      await googleAuthController.disconnect(req, res, next);

      expect(googleCalendarService.disconnectUser).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ 
        message: "Successfully disconnected from Google Calendar." 
      });
    });

    it("should call next if service throws error", async () => {
        req.user = { user_id: 1 };
        const error = new Error("DB failure");
        googleCalendarService.disconnectUser.mockRejectedValue(error);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await googleAuthController.disconnect(req, res, next);
        
        expect(next).toHaveBeenCalledWith(error);

        consoleSpy.mockRestore();
    });
  });

  describe("callback", () => {
    it("should handle callback and redirect with success status", async () => {
      req.query = { code: "some-code", state: "1" };
      googleCalendarService.handleCallback.mockResolvedValue({ access_token: "abc" });

      await googleAuthController.callback(req, res, next);

      expect(googleCalendarService.handleCallback).toHaveBeenCalledWith("some-code", "1");
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("google=success"));
    });

    it("should call next if handleCallback fails", async () => {
      req.query = { code: "invalid", state: "1" };
      const error = new Error("Invalid code");
      googleCalendarService.handleCallback.mockRejectedValue(error);

      await googleAuthController.callback(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
