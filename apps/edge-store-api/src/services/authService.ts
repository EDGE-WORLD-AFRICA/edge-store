import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../config/dbconnection";
import { config } from "../config/index";
import { v4 as uuidv4 } from "uuid";

export interface ILoginPayload {
  username: string;
  password: string;
  deviceId?: string;
  deviceName?: string;
  machineCode?: string;
}

export const authService = {
  login: async (payload: ILoginPayload) => {
    const { username, password, deviceId, deviceName, machineCode } = payload;

    const user = await db("users")
      .where("username", username)
      .where("is_active", true)
      .first();

    if (!user) {
      throw new Error("Invalid username or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error("Invalid username or password");
    }

    const company = await db("companies")
      .where("id", user.company_id)
      .first();

    const userRoles = await db("user_roles")
      .where("user_id", user.id)
      .join("roles", "user_roles.role_id", "roles.id")
      .select("roles.*", "user_roles.branch_id");

    const roleIds = userRoles.map((r: any) => r.id);

    let permissions: string[] = [];

    if (roleIds.length > 0) {
      const rolePermissions = await db("role_permissions")
        .whereIn("role_id", roleIds)
        .join("permissions", "role_permissions.permission_id", "permissions.id")
        .select("permissions.key");

      permissions = [...new Set(rolePermissions.map((p: any) => p.key))];
    }

    if (user.is_super_admin) {
      permissions = ["*"];
    }

    let device = null;

    if (machineCode) {
      device = await db("devices")
        .where("machine_code", machineCode)
        .first();

      if (device) {
        await db("devices")
          .where("id", device.id)
          .update({ last_seen_at: new Date() });
      }
    }

    // FIX: Cast expiresIn to 'any' to bypass the strict StringValue branded type 
    // required by newer versions of @types/jsonwebtoken.
    const signOptions: jwt.SignOptions = {
      expiresIn: config.jwt.expiresIn as any,
    };

    const accessToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        companyId: user.company_id,
        isSuperAdmin: user.is_super_admin,
      },
      config.jwt.secret,
      signOptions
    );

    const refreshToken = uuidv4();
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await db("sessions").insert({
      id: uuidv4(),
      user_id: user.id,
      device_id: device?.id || null,
      refresh_token_hash: refreshTokenHash,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await db("users")
      .where("id", user.id)
      .update({ last_login_at: new Date() });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        isSuperAdmin: user.is_super_admin,
        companyId: user.company_id,
      },
      company: {
        id: company?.id,
        name: company?.name,
        logo: company?.logo,
      },
      device: device
        ? {
            id: device.id,
            name: device.device_name,
            branchId: device.branch_id,
          }
        : null,
      permissions,
      roles: userRoles.map((r: any) => ({
        id: r.id,
        name: r.name,
        branchId: r.branch_id,
      })),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: config.jwt.expiresIn,
      },
    };
  },

  verifyToken: async (token: string) => {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded;
    } catch {
      return null;
    }
  },
};