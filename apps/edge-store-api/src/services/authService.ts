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
    const { username, password, machineCode } = payload;

    const userAccount = await db("user_accounts")
      .join("person", "user_accounts.person_id", "person.id")
      .where("user_accounts.username", username)
      .where("user_accounts.is_active", true)
      .where("user_accounts.voided", false)
      .where("person.voided", false)
      .select(
        "user_accounts.*",
        "person.first_name",
        "person.other_names",
        "person.last_name",
        "person.date_of_birth",
        "person.gender"
      )
      .first();

    if (!userAccount) {
      throw new Error("Invalid username or password");
    }

    const isPasswordValid = await bcrypt.compare(password, userAccount.password_hash);
    if (!isPasswordValid) {
      throw new Error("Invalid username or password");
    }

    const company = await db("companies").where("id", userAccount.company_id).first();

    const userRoles = await db("user_roles")
      .join("roles", "user_roles.role_id", "roles.id")
      .where("user_roles.user_id", userAccount.id)
      .where("user_roles.voided", false)
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

    if (userAccount.is_super_admin) {
      permissions = ["*"];
    }

    let device = null;
    let branch = null;

    if (machineCode) {
      device = await db("devices").where("machine_code", machineCode).first();
      if (device) {
        await db("devices").where("id", device.id).update({ last_seen_at: new Date() });
        if (device.branch_id) {
          branch = await db("branches").where("id", device.branch_id).first();
        }
      }
    }

    const signOptions: jwt.SignOptions = {
      expiresIn: config.jwt.expiresIn as any,
    };

    const accessToken = jwt.sign(
      {
        userId: userAccount.id,
        username: userAccount.username,
        companyId: userAccount.company_id,
        isSuperAdmin: userAccount.is_super_admin,
      },
      config.jwt.secret,
      signOptions
    );

    const refreshToken = uuidv4();
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await db("sessions").insert({
      id: uuidv4(),
      user_id: userAccount.id,
      device_id: device?.id || null,
      refresh_token_hash: refreshTokenHash,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await db("user_accounts").where("id", userAccount.id).update({ last_login_at: new Date() });

    return {
      user: {
        id: userAccount.id,
        username: userAccount.username,
        isSuperAdmin: userAccount.is_super_admin,
        companyId: userAccount.company_id,
        person: {
          id: userAccount.person_id,
          firstName: userAccount.first_name,
          otherNames: userAccount.other_names,
          lastName: userAccount.last_name,
          dateOfBirth: userAccount.date_of_birth,
          gender: userAccount.gender,
        },
      },
      company: company ? { id: company.id, name: company.name, logo: company.logo } : null,
      branch: branch ? { id: branch.id, name: branch.name, code: branch.code } : null,
      device: device ? { id: device.id, name: device.device_name, branchId: device.branch_id } : null,
      permissions,
      roles: userRoles.map((r: any) => ({ id: r.id, name: r.name, branchId: r.branch_id })),
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: config.jwt.expiresIn,
      },
    };
  },

  verifyToken: async (token: string) => {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch {
      return null;
    }
  },


  refreshToken: async (payload: { refreshToken: string; userId: string | number }) => {
    const { refreshToken, userId } = payload;

    const session = await db("sessions")
    .where("user_id", userId)
    .where("voided", false)
    .orderBy("created_at", "desc")
    .first();

    if(!session) return null; 

    if(new Date(session.expires_at) < new Date()){
      await db("sessions").where("id", session.id).update({ voided: true });
      return null;
    }

    const user = await db("user_accounts")
    .where("id", userId)
    .where("is_active", true)
    .where("voided", false)
    .first();

    if(!user) return null;

    const signOptions: jwt.SignOptions = { expiresIn: config.jwt.expiresIn as any };

    const newAccessToken = jwt.sign({
        userId: user.id,
        username: user.username,
        companyId: user.company_id,
        isSuperAdmin: user.is_super_admin,
      }, config.jwt.secret, signOptions);

    const newRefreshToken = uuidv4();
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

    await db("sessions").where("id", session.id).update({
      refresh_token_hash: newRefreshTokenHash,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: config.jwt.expiresIn,
      },
    };
  }
};