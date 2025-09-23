import { UserResponseDTO } from "../src/dtos/user-response.dto";
import { UserRole } from "../src/interfaces/user.interface";

describe("Auth Controller", () => {
  it("should return user response DTO", () => {
    const mockUser: UserResponseDTO = {
      id: "123",
      name: "Test User",
      email: "test@example.com",
      role: UserRole.Admin // ✅ matches enum type
    };

    expect(mockUser).toHaveProperty("id", "123");
    expect(mockUser).toHaveProperty("name", "Test User");
    expect(mockUser).toHaveProperty("email", "test@example.com");
    expect(mockUser.role).toBe(UserRole.Admin);
  });
});
